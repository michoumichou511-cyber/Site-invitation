import { desc, eq } from "drizzle-orm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { getDb } from "@/db";
import { invitations, templates } from "@/db/schema";
import { Link } from "@/i18n/navigation";
import { requireClientPage } from "@/lib/auth/client-guard";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function AccountPage({ params }: PageProps<"/[locale]/compte">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const viewer = await requireClientPage(locale);
  const t = await getTranslations("account");
  const ev = await getTranslations("events");
  const lang = locale as "fr" | "ar";
  const rows = await (
    await getDb()
  )
    .select({ inv: invitations, template: templates.name })
    .from(invitations)
    .innerJoin(templates, eq(templates.id, invitations.templateId))
    .where(eq(invitations.ownerId, viewer.profileId))
    .orderBy(desc(invitations.createdAt));
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[32px] text-cedar">{t("title")}</h1>
        <LogoutButton label={t("logout")} to="/connexion" />
      </div>
      {rows.length === 0 ? (
        <div className="rounded-card bg-surface p-6 text-center">
          <p className="text-ink-soft">{t("empty")}</p>
          <Link
            href="/commander"
            className="mt-4 inline-flex min-h-12 items-center rounded-full bg-sea px-6 font-bold text-white"
          >
            {t("emptyCta")}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ inv, template }) => {
            const names = inv.config as {
              names?: { first?: { fr: string; ar: string }; second?: { fr: string; ar: string } };
            };
            return (
              <li key={inv.id}>
                <Link
                  href={`/compte/invitations/${inv.id}`}
                  className="flex items-center justify-between gap-3 rounded-card bg-surface p-5"
                >
                  <span>
                    <b className="block text-xl text-cedar">
                      {[names.names?.first?.[lang], names.names?.second?.[lang]]
                        .filter(Boolean)
                        .join(lang === "ar" ? " و " : " & ")}
                    </b>
                    <span className="text-sm text-ink-soft">
                      {ev(inv.eventType)} · {template[lang]} ·{" "}
                      {t("views", { count: inv.viewCount })}
                    </span>
                  </span>
                  <span className="font-bold text-sea">{t("open")}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
