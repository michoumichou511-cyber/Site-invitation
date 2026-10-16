import { getTranslations, setRequestLocale } from "next-intl/server";
import { TabsNav } from "@/components/account/TabsNav";
import { Link } from "@/i18n/navigation";
import { requireOwnedInvitation } from "@/lib/auth/client-guard";

export default async function InvitationSpaceLayout({
  children,
  params,
}: LayoutProps<"/[locale]/compte/invitations/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const { invitation } = await requireOwnedInvitation(locale, id);
  const t = await getTranslations("account");
  const base = `/compte/invitations/${id}`;
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/compte" className="font-bold text-sea">
          ← {t("back")}
        </Link>
        <a
          href={`/i/${invitation.slug}`}
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-12 items-center rounded-full border border-sea px-4 font-bold text-sea"
        >
          {t("seeLive")}
        </a>
      </div>
      <TabsNav
        tabs={[
          { href: base, label: t("tabs.edit") },
          { href: `${base}/invites`, label: t("tabs.guests") },
          { href: `${base}/reponses`, label: t("tabs.answers") },
          { href: `${base}/voeux`, label: t("tabs.wishes") },
        ]}
      />
      <div className="mt-6">{children}</div>
    </main>
  );
}
