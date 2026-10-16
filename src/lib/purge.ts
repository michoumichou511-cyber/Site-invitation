import { and, eq, inArray, isNotNull, lt, not, like } from "drizzle-orm";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { guests, invitations, media, rsvps, wishes } from "@/db/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- D1 (prod) ou better-sqlite3 (tests)
type AnyDb = BaseSQLiteDatabase<"sync" | "async", any, any>;

/**
 * Rétention (BACKEND_SCHEMA) : 6 mois après l'événement (`invitations.expires_at`), on
 * supprime invités, réponses, entrées, vœux, photos et musiques de l'invitation.
 * Commandes, paiements et avis restent pour la comptabilité. Idempotent.
 * Renvoie les clés des fichiers (KV) à supprimer.
 */
export async function purgeExpiredInvitations(db: AnyDb, now = Date.now()) {
  const expired = await db
    .select({ id: invitations.id, config: invitations.config })
    .from(invitations)
    .where(
      and(
        isNotNull(invitations.expiresAt),
        lt(invitations.expiresAt, new Date(now)),
        not(like(invitations.slug, "demo-%")),
      ),
    );
  if (expired.length === 0) return { invitations: 0, r2Keys: [] as string[] };
  const ids = expired.map((e) => e.id);
  const files = await db
    .select({ key: media.r2Key })
    .from(media)
    .where(inArray(media.invitationId, ids));
  await db.delete(rsvps).where(inArray(rsvps.invitationId, ids));
  await db.delete(guests).where(inArray(guests.invitationId, ids)); // + checkins (cascade)
  await db.delete(wishes).where(inArray(wishes.invitationId, ids));
  await db.delete(media).where(inArray(media.invitationId, ids));
  for (const e of expired) {
    const config = e.config as { gallery?: unknown[]; music?: unknown };
    if ((config.gallery?.length ?? 0) > 0 || (config.music && config.music !== "none")) {
      await db
        .update(invitations)
        .set({ config: { ...config, gallery: [], music: null }, musicKey: null })
        .where(eq(invitations.id, e.id));
    }
  }
  return { invitations: ids.length, r2Keys: files.map((f) => f.key) };
}
