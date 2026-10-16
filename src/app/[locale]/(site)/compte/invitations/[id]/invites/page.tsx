import { asc, eq } from "drizzle-orm";
import { setRequestLocale } from "next-intl/server";
import { GuestsManager } from "@/components/account/GuestsManager";
import { guests } from "@/db/schema";
import { requireOwnedInvitation } from "@/lib/auth/client-guard";
import { shareContext } from "@/lib/guests/context";

export const dynamic = "force-dynamic";

export default async function GuestsPage({
  params,
}: PageProps<"/[locale]/compte/invitations/[id]/invites">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const { db, invitation } = await requireOwnedInvitation(locale, id);
  const rows = await db
    .select()
    .from(guests)
    .where(eq(guests.invitationId, invitation.id))
    .orderBy(asc(guests.createdAt), asc(guests.name));
  const share = await shareContext(invitation);
  return (
    <GuestsManager
      invitationId={invitation.id}
      guests={rows.map((g) => ({
        id: g.id,
        name: g.name,
        phone: g.phone,
        groupLabel: g.groupLabel,
        maxSeats: g.maxSeats,
        code: g.code,
        locale: g.locale,
        sentAt: g.sentAt?.getTime() ?? null,
        firstOpenedAt: g.firstOpenedAt?.getTime() ?? null,
      }))}
      {...share}
    />
  );
}
