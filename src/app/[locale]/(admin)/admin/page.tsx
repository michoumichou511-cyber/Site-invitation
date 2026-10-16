import { getTranslations, setRequestLocale } from "next-intl/server";
import { getDb } from "@/db";
import { Link } from "@/i18n/navigation";
import { dashboardStats } from "@/lib/admin/queries";
import { requireAdminPage } from "@/lib/auth/guard";
import { formatDa } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({ params }: PageProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage(locale);
  const t = await getTranslations("admin");
  const s = await dashboardStats(await getDb());
  const lang = locale as "fr" | "ar";
  const cards = [
    [t("dashboard.today"), String(s.today), "/admin/commandes"],
    [t("dashboard.revenue"), `${formatDa(s.revenue, locale)} DA`, "/admin/commandes"],
    [t("dashboard.late"), String(s.late), "/admin/commandes?statut=payee"],
  ] as const;
  return (
    <div className="space-y-6">
      <h1 className="text-[28px] text-cedar">{t("nav.dashboard")}</h1>
      <Link
        href="/admin/paiements"
        className={`flex min-h-16 items-center rounded-card p-5 text-lg font-bold ${s.toCheck ? "bg-coral text-ink" : "bg-surface text-ink-soft"}`}
      >
        {t("dashboard.toCheck", { count: s.toCheck })}
      </Link>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-card bg-surface p-5">
            <p className="text-sm text-ink-soft">{label}</p>
            <p className="mt-1 text-3xl font-bold text-sea">{value}</p>
          </Link>
        ))}
      </div>
      <section className="rounded-card bg-surface p-5">
        <h2 className="mb-3 text-xl text-cedar">{t("dashboard.top")}</h2>
        {s.top.length === 0 ? (
          <p className="text-ink-soft">{t("dashboard.none")}</p>
        ) : (
          <ol className="space-y-1">
            {s.top.map((m) => (
              <li key={m.name.fr} className="flex justify-between">
                <span>{m.name[lang]}</span>
                <span className="text-ink-soft">{t("dashboard.sales", { count: m.n })}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
