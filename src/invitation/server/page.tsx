import "server-only";
import { and, eq, isNull, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getDb, getEnv } from "@/db";
import { guests, invitations, rsvps } from "@/db/schema";
import fr from "../../../messages/fr.json";
import ar from "../../../messages/ar.json";
import { GUEST_CODE_RE } from "../engine/codes";
import type { Lang } from "../engine/config";
import type { Dicts } from "../engine/i18n";
import { InvitationApp } from "../engine/InvitationApp";
import { rsvpState } from "../engine/rules";
import type { InvitationViewModel, ViewGuest, ViewRsvp } from "../engine/types";
import { getThemeEntry } from "../themes";
import { ACCESS_COOKIE, accessToken } from "./access";
import { loadInvitation, loadWishes } from "./load";
import { ExpiredInvitation, InvalidGuestLink } from "./Notices";

const strip = (messages: typeof fr.invitation) => {
  const rest: Partial<typeof messages> = { ...messages };
  delete rest.ogTitle;
  return rest as Record<string, string>;
};
export const invitationDicts: Dicts = { fr: strip(fr.invitation), ar: strip(ar.invitation) };
const dicts = invitationDicts;

/** Rendu serveur d'une invitation (générique ou nominative). */
export async function renderInvitation({
  slug,
  code,
  lang,
}: {
  slug: string;
  code: string | null;
  lang?: string;
}) {
  const inv = await loadInvitation(slug);
  if (!inv) notFound();
  const pick = (l?: string | null): Lang | null =>
    l === "fr" || l === "ar" ? (inv.languages.includes(l) ? l : null) : null;
  const fallbackLang = pick(lang) ?? inv.languages[0] ?? "fr";

  if (inv.expired) return <ExpiredInvitation lang={fallbackLang} dicts={dicts} />;

  const db = await getDb();
  let guest: (ViewGuest & { id: string; locale: string | null }) | null = null;
  if (code !== null) {
    const row = GUEST_CODE_RE.test(code)
      ? await db.query.guests.findFirst({
          where: and(eq(guests.code, code), eq(guests.invitationId, inv.id)),
        })
      : undefined;
    if (!row)
      return (
        <InvalidGuestLink
          lang={fallbackLang}
          dicts={dicts}
          genericHref={inv.allowGenericLink ? `/i/${inv.slug}` : null}
        />
      );
    guest = {
      id: row.id,
      name: row.name,
      code: row.code,
      maxSeats: row.maxSeats,
      locale: row.locale,
    };
  } else if (!inv.allowGenericLink) {
    notFound();
  }

  // Code d'accès : le lien nominatif suffit, sinon il faut le cookie posé par /acces.
  if (inv.accessCodeHash && !guest) {
    const cookie = (await cookies()).get(ACCESS_COOKIE(inv.slug))?.value;
    if (cookie !== (await accessToken(inv.accessCodeHash))) redirect(`/i/${inv.slug}/acces`);
  }

  let existingRsvp: ViewRsvp | null = null;
  if (guest) {
    const r = await db.query.rsvps.findFirst({
      where: and(eq(rsvps.guestId, guest.id), isNull(rsvps.eventId)),
    });
    if (r) existingRsvp = { answer: r.answer, seats: r.seats, message: r.message, name: r.name };
  }

  // Compteurs d'ouverture (non bloquants pour l'affichage).
  if (inv.isPublished) {
    const updates: Promise<unknown>[] = [
      db
        .update(invitations)
        .set({ viewCount: sql`${invitations.viewCount} + 1` })
        .where(eq(invitations.id, inv.id)),
    ];
    if (guest)
      updates.push(
        db
          .update(guests)
          .set({
            openCount: sql`${guests.openCount} + 1`,
            firstOpenedAt: sql`coalesce(${guests.firstOpenedAt}, ${Date.now()})`,
          })
          .where(eq(guests.id, guest.id)),
      );
    await Promise.allSettled(updates);
  }

  const entry = getThemeEntry(inv.theme);
  if (!entry) notFound();
  const env = await getEnv();
  const wishes = inv.config.sections.guestbook && inv.isPublished ? await loadWishes(inv.id) : [];

  const vm: InvitationViewModel = {
    slug: inv.slug,
    theme: inv.theme,
    eventType: inv.eventType,
    languages: inv.languages,
    defaultLang: pick(lang) ?? pick(guest?.locale) ?? fallbackLang,
    config: inv.config,
    events: inv.events,
    guest: guest && { name: guest.name, code: guest.code, maxSeats: guest.maxSeats },
    rsvp: rsvpState({
      sectionEnabled: inv.config.sections.rsvp,
      published: inv.isPublished,
      rsvpOpen: inv.rsvpOpen,
      deadline: inv.rsvpDeadline,
      isPast: inv.isPast,
      now: Date.now(),
    }),
    existingRsvp,
    maxSeats: guest?.maxSeats ?? inv.config.genericMaxSeats,
    isPast: inv.isPast,
    preview: !inv.isPublished,
    discreet: inv.discreet,
    wishes,
    turnstileSiteKey: env.TURNSTILE_SITE_KEY || null,
  };

  return <InvitationApp vm={vm} theme={entry.theme} dicts={dicts} />;
}
