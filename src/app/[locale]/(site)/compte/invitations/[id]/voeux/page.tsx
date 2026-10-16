import { desc, eq } from "drizzle-orm";
import { setRequestLocale } from "next-intl/server";
import { WishesList } from "@/components/account/WishesList";
import { wishes } from "@/db/schema";
import { requireOwnedInvitation } from "@/lib/auth/client-guard";

export const dynamic = "force-dynamic";

export default async function WishesPage({
  params,
}: PageProps<"/[locale]/compte/invitations/[id]/voeux">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const { db, invitation } = await requireOwnedInvitation(locale, id);
  const rows = await db
    .select()
    .from(wishes)
    .where(eq(wishes.invitationId, invitation.id))
    .orderBy(desc(wishes.createdAt));
  return (
    <WishesList
      invitationId={invitation.id}
      wishes={rows.map((w) => ({
        id: w.id,
        name: w.name,
        message: w.message ?? "",
        approved: w.isApproved,
      }))}
    />
  );
}
