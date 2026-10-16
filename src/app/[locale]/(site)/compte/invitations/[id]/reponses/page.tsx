import { and, asc, eq, isNull } from "drizzle-orm";
import { setRequestLocale } from "next-intl/server";
import { AnswersBoard, type AnswerRow } from "@/components/account/AnswersBoard";
import { guests, rsvps } from "@/db/schema";
import { requireOwnedInvitation } from "@/lib/auth/client-guard";
import { shareContext } from "@/lib/guests/context";

export const dynamic = "force-dynamic";

export default async function AnswersPage({
  params,
}: PageProps<"/[locale]/compte/invitations/[id]/reponses">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const { db, invitation } = await requireOwnedInvitation(locale, id);
  const [guestRows, answerRows] = await Promise.all([
    db
      .select()
      .from(guests)
      .where(eq(guests.invitationId, invitation.id))
      .orderBy(asc(guests.name)),
    db
      .select()
      .from(rsvps)
      .where(and(eq(rsvps.invitationId, invitation.id), isNull(rsvps.eventId))),
  ]);
  const byGuest = new Map(answerRows.filter((r) => r.guestId).map((r) => [r.guestId!, r]));
  const rows: AnswerRow[] = [
    ...guestRows.map((g) => {
      const r = byGuest.get(g.id);
      return {
        key: g.id,
        guestId: g.id,
        name: g.name,
        phone: g.phone,
        locale: g.locale,
        code: g.code,
        group: g.groupLabel,
        maxSeats: g.maxSeats,
        answer: r?.answer ?? null,
        seats: r?.seats ?? 0,
        message: r?.message ?? null,
        source: r?.source ?? null,
      };
    }),
    ...answerRows
      .filter((r) => !r.guestId)
      .map((r) => ({
        key: r.id,
        guestId: null,
        name: r.name,
        phone: null,
        locale: null,
        code: null,
        group: null,
        maxSeats: null,
        answer: r.answer,
        seats: r.seats,
        message: r.message,
        source: r.source,
      })),
  ];
  const share = await shareContext(invitation);
  return <AnswersBoard invitationId={invitation.id} rows={rows} {...share} />;
}
