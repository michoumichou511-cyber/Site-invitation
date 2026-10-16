import { asc, eq } from "drizzle-orm";
import { setRequestLocale } from "next-intl/server";
import { InvitationEditor, type EditorState } from "@/components/account/InvitationEditor";
import { events } from "@/db/schema";
import type { BaseConfig } from "@/invitation/engine/config";
import { invitationDicts } from "@/invitation/server/page";
import { requireOwnedInvitation } from "@/lib/auth/client-guard";
import { siteUrl } from "@/lib/orders/notify";
import { arefRuqaa, pinyonScript } from "@/app/fonts";
import "@/invitation/invitation.css";

export const dynamic = "force-dynamic";

/** Millisecondes UTC → date et heure à Alger (UTC+1). */
const algiers = (ms: number) => {
  const iso = new Date(ms + 3_600_000).toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
};

export default async function EditPage({ params }: PageProps<"/[locale]/compte/invitations/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const { db, invitation, template } = await requireOwnedInvitation(locale, id);
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.invitationId, invitation.id))
    .orderBy(asc(events.sortOrder));
  const c = invitation.config as BaseConfig & { variant?: string };
  const music = c.music;
  const initial: EditorState = {
    v: 1,
    templateSlug: template.slug,
    eventType: invitation.eventType,
    names: { first: c.names.first, second: c.names.second ?? { fr: "", ar: "" } },
    initials: c.initials,
    hosts: c.hosts ?? { fr: "", ar: "" },
    events: rows.map((e) => ({
      type: e.type,
      title: e.title,
      ...algiers(e.startsAt.getTime()),
      venueName: e.venueName ?? "",
      address: e.address ?? "",
      mapsUrl: e.mapsUrl ?? "",
    })),
    eventIds: rows.map((e) => e.id),
    basmala: c.basmala,
    verse: c.verse,
    program: c.program.map((p) => ({ time: p.time, title: p.title })),
    contactPhone: c.contactPhone ? c.contactPhone.replace(/^\+213/, "0") : "",
    photos: c.gallery.map((g) => g.src),
    discreet: invitation.discreetMode,
    music: music === "none" ? "none" : music ? "upload" : "generated",
    musicSrc: music && music !== "none" ? music.src : null,
    languages: invitation.languages.filter((l): l is "fr" | "ar" => l === "fr" || l === "ar"),
    variant: c.variant ?? "",
    accessCode: "",
    genericMaxSeats: c.genericMaxSeats,
    rsvpOpen: invitation.rsvpOpen,
    rsvpDeadline: invitation.rsvpDeadline ? algiers(invitation.rsvpDeadline.getTime()).date : "",
    allowGenericLink: invitation.allowGenericLink,
  };
  return (
    <div className={`${pinyonScript.variable} ${arefRuqaa.variable}`}>
      <InvitationEditor
        key={invitation.updatedAt.getTime()}
        invitationId={invitation.id}
        initial={initial}
        dicts={invitationDicts}
        slug={invitation.slug}
        link={await siteUrl(`/i/${invitation.slug}`)}
      />
    </div>
  );
}
