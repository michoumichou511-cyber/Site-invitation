"use server";

import { and, eq, inArray, notInArray } from "drizzle-orm";
import { z } from "zod";
import { activityLog, events, invitations, media } from "@/db/schema";
import { getThemeEntry } from "@/invitation/themes";
import { logActivity } from "@/lib/activity";
import { getOwnedInvitation } from "@/lib/auth/access";
import { deleteFiles, MediaError, mediaUrl, storeFile } from "@/lib/media";
import { algiersToUtc, draftEventSchema } from "@/lib/orders/draft";

const SIX_MONTHS = 183 * 86_400_000;

const input = z.object({
  invitationId: z.uuid(),
  config: z.record(z.string(), z.unknown()),
  events: z
    .array(draftEventSchema.extend({ id: z.string().max(60).nullable() }))
    .min(1)
    .max(6),
  discreet: z.boolean(),
  rsvpOpen: z.boolean(),
  rsvpDeadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  allowGenericLink: z.boolean(),
});

/**
 * Client (ou admin) : modifie l'invitation. La config est validée par le schéma zod du
 * thème. Pack Essentiel : une seule modification par le client.
 */
export async function updateInvitation(raw: z.input<typeof input>) {
  const data = input.safeParse(raw);
  if (!data.success) return { ok: false as const, error: "invalid" as const };
  const owned = await getOwnedInvitation(data.data.invitationId);
  if (!owned) return { ok: false as const, error: "forbidden" as const };
  const { db, invitation, order, template, viewer, isAdmin } = owned;

  if (!isAdmin && order.pack === "essentiel") {
    const used = await db.$count(
      activityLog,
      and(
        eq(activityLog.entityId, invitation.id),
        eq(activityLog.action, "invitation.update"),
        eq(activityLog.actorId, viewer.profileId!),
      ),
    );
    if (used >= 1) return { ok: false as const, error: "limit" as const };
  }

  const entry = getThemeEntry(template.slug);
  // Galerie et musique ne changent pas ici (actions dédiées aux fichiers).
  const current = invitation.config as { gallery?: unknown; music?: unknown };
  const parsed = entry?.schema.safeParse({
    ...data.data.config,
    gallery: current.gallery ?? [],
    music: current.music ?? null,
  });
  if (!parsed?.success) return { ok: false as const, error: "invalid" as const };

  // Seuls les moments de cette invitation peuvent être mis à jour ; les autres ids sont neufs.
  const ownIds = new Set(
    (
      await db.select({ id: events.id }).from(events).where(eq(events.invitationId, invitation.id))
    ).map((e) => e.id),
  );
  const rows = data.data.events.map((e, i) => ({
    id: e.id && ownIds.has(e.id) ? e.id : crypto.randomUUID(),
    invitationId: invitation.id,
    type: e.type,
    title: { fr: e.title.fr, ar: e.title.ar || e.title.fr },
    startsAt: new Date(algiersToUtc(e.date, e.time)),
    venueName: e.venueName || null,
    address: e.address || null,
    mapsUrl: e.mapsUrl || null,
    sortOrder: i,
  }));
  const keep = rows.map((r) => r.id);
  const lastEvent = Math.max(...rows.map((r) => r.startsAt.getTime()));
  await db.batch([
    db
      .update(invitations)
      .set({
        config: parsed.data,
        discreetMode: data.data.discreet,
        rsvpOpen: data.data.rsvpOpen,
        rsvpDeadline: data.data.rsvpDeadline
          ? new Date(algiersToUtc(data.data.rsvpDeadline, "23:59"))
          : null,
        allowGenericLink: data.data.allowGenericLink,
        expiresAt: new Date(lastEvent + SIX_MONTHS),
      })
      .where(eq(invitations.id, invitation.id)),
    db
      .delete(events)
      .where(and(eq(events.invitationId, invitation.id), notInArray(events.id, keep))),
    ...rows.map((r) =>
      db
        .insert(events)
        .values(r)
        .onConflictDoUpdate({
          target: events.id,
          set: {
            type: r.type,
            title: r.title,
            startsAt: r.startsAt,
            venueName: r.venueName,
            address: r.address,
            mapsUrl: r.mapsUrl,
            sortOrder: r.sortOrder,
          },
        }),
    ),
  ]);
  await logActivity(db, {
    actorId: viewer.profileId,
    action: "invitation.update",
    entity: "invitations",
    entityId: invitation.id,
  });
  return { ok: true as const };
}

/** Client : ajoute une photo (déjà compressée en WebP) à la galerie, 6 au maximum. */
export async function addInvitationPhoto(form: FormData) {
  const owned = await getOwnedInvitation(z.uuid().parse(form.get("invitationId")));
  const file = form.get("photo");
  if (!owned || !(file instanceof File)) return { ok: false as const };
  const { db, invitation, order } = owned;
  const config = invitation.config as {
    gallery?: { src: string; alt: { fr: string; ar: string } }[];
  };
  const gallery = config.gallery ?? [];
  const max = order.pack === "essentiel" ? 3 : 6;
  if (gallery.length >= max) return { ok: false as const };
  try {
    const stored = await storeFile(file, "photo", `inv/${invitation.id}`);
    await db.batch([
      db
        .insert(media)
        .values({
          invitationId: invitation.id,
          ownerId: owned.viewer.profileId,
          kind: "photo",
          r2Key: stored.key,
          mimeType: stored.mimeType,
          sizeBytes: stored.sizeBytes,
        }),
      db
        .update(invitations)
        .set({
          config: {
            ...invitation.config,
            gallery: [...gallery, { src: mediaUrl(stored.key), alt: { fr: "", ar: "" } }],
          },
        })
        .where(eq(invitations.id, invitation.id)),
    ]);
    return { ok: true as const };
  } catch (e) {
    if (e instanceof MediaError) return { ok: false as const };
    throw e;
  }
}

/** Client : retire une photo de la galerie (et le fichier R2). */
export async function removeInvitationPhoto(invitationId: string, src: string) {
  const owned = await getOwnedInvitation(z.uuid().parse(invitationId));
  if (!owned) return { ok: false as const };
  const { db, invitation } = owned;
  const config = invitation.config as { gallery?: { src: string }[] };
  const gallery = (config.gallery ?? []).filter((g) => g.src !== src);
  const key = src.replace(/^\/api\/media\//, "");
  await db.batch([
    db
      .update(invitations)
      .set({ config: { ...invitation.config, gallery } })
      .where(eq(invitations.id, invitation.id)),
    db.delete(media).where(and(eq(media.invitationId, invitation.id), inArray(media.r2Key, [key]))),
  ]);
  await deleteFiles([key]).catch(() => {});
  return { ok: true as const };
}
