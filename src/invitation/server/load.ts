import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/db";
import { events, invitations, templates, wishes } from "@/db/schema";
import { getViewer } from "@/lib/auth/viewer";
import type { BaseConfig } from "../engine/config";
import { isDemoSlug, isEventPast, shiftDemoDates } from "../engine/rules";
import type { ViewEvent, ViewWish } from "../engine/types";
import { getThemeEntry } from "../themes";

export type LoadedInvitation = {
  id: string;
  slug: string;
  ownerId: string | null;
  theme: string;
  eventType: string;
  languages: ("fr" | "ar")[];
  config: BaseConfig;
  events: ViewEvent[];
  isPublished: boolean;
  isDemo: boolean;
  isPast: boolean;
  discreet: boolean;
  rsvpOpen: boolean;
  rsvpDeadline: number | null;
  allowGenericLink: boolean;
  accessCodeHash: string | null;
  expired: boolean;
};

/**
 * Charge une invitation par son slug. Règles d'accès (BACKEND_SCHEMA) :
 * publiée → tout le monde ; non publiée → seulement son propriétaire ou un admin.
 * Ne renvoie jamais la liste des invités.
 */
export const loadInvitation = cache(async function loadInvitation(
  slug: string,
): Promise<LoadedInvitation | null> {
  const now = Date.now();
  const db = await getDb();
  const row = await db
    .select({ inv: invitations, themeSlug: templates.slug })
    .from(invitations)
    .innerJoin(templates, eq(templates.id, invitations.templateId))
    .where(eq(invitations.slug, slug))
    .get();
  if (!row) return null;
  const { inv } = row;

  if (!inv.isPublished) {
    const viewer = await getViewer();
    const allowed =
      viewer && (viewer.role === "admin" || (viewer.profileId && viewer.profileId === inv.ownerId));
    if (!allowed) return null;
  }

  const entry = getThemeEntry(row.themeSlug);
  if (!entry) throw new Error(`Thème inconnu : ${row.themeSlug}`);
  const config = entry.schema.parse(inv.config);

  const rows = await db
    .select()
    .from(events)
    .where(eq(events.invitationId, inv.id))
    .orderBy(asc(events.sortOrder), asc(events.startsAt));
  let list: ViewEvent[] = rows.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    startsAt: e.startsAt.getTime(),
    endsAt: e.endsAt?.getTime() ?? null,
    venueName: e.venueName,
    address: e.address,
    mapsUrl: e.mapsUrl,
    lat: e.lat,
    lng: e.lng,
  }));
  const isDemo = isDemoSlug(inv.slug);
  if (isDemo) list = shiftDemoDates(list, now);

  return {
    id: inv.id,
    slug: inv.slug,
    ownerId: inv.ownerId,
    theme: row.themeSlug,
    eventType: inv.eventType,
    languages: inv.languages.filter((l): l is "fr" | "ar" => l === "fr" || l === "ar"),
    config,
    events: list,
    isPublished: inv.isPublished,
    isDemo,
    isPast: isEventPast(list, now),
    discreet: inv.discreetMode,
    rsvpOpen: inv.rsvpOpen,
    rsvpDeadline: isDemo ? null : (inv.rsvpDeadline?.getTime() ?? null),
    allowGenericLink: inv.allowGenericLink,
    accessCodeHash: inv.accessCodeHash,
    expired: !isDemo && inv.expiresAt !== null && inv.expiresAt.getTime() < now,
  };
});

export async function loadWishes(invitationId: string, limit = 30): Promise<ViewWish[]> {
  const db = await getDb();
  const rows = await db
    .select({
      id: wishes.id,
      name: wishes.name,
      message: wishes.message,
      createdAt: wishes.createdAt,
    })
    .from(wishes)
    .where(and(eq(wishes.invitationId, invitationId), eq(wishes.isApproved, true)))
    .orderBy(desc(wishes.createdAt))
    .limit(limit);
  return rows.map((w) => ({
    id: w.id,
    name: w.name,
    message: w.message ?? "",
    createdAt: w.createdAt.getTime(),
  }));
}
