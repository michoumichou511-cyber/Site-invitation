import { getTranslations, setRequestLocale } from "next-intl/server";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { Link } from "@/i18n/navigation";
import { getViewer } from "@/lib/auth/viewer";

export const metadata = { robots: { index: false, follow: false } };

const NAV = [
  ["dashboard", "/admin"],
  ["orders", "/admin/commandes"],
  ["payments", "/admin/paiements"],
  ["templates", "/admin/modeles"],
  ["clients", "/admin/clients"],
  ["library", "/admin/bibliotheque"],
] as const;

/** Back-office : barre de navigation à gauche (à droite en arabe), interface sobre. */
export default async function AdminLayout({ children, params }: LayoutProps<"/[locale]/admin">) {
  setRequestLocale((await params).locale);
  const viewer = await getViewer();
  const t = await getTranslations("admin");
  const isAdmin = viewer?.role === "admin" && viewer.twoFactorEnabled;
  if (!isAdmin) return <main className="min-h-dvh bg-bg">{children}</main>;
  return (
    <div className="min-h-dvh bg-bg md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-wall bg-surface md:min-h-dvh md:border-e md:border-b-0">
        <p className="px-4 pt-4 font-display text-xl text-cedar">{t("title")}</p>
        <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col" aria-label={t("title")}>
          {NAV.map(([key, href]) => (
            <Link
              key={key}
              href={href}
              className="flex min-h-12 flex-none items-center rounded-field px-3 hover:bg-bg"
            >
              {t(`nav.${key}`)}
            </Link>
          ))}
          <Link
            href="/"
            className="flex min-h-12 flex-none items-center rounded-field px-3 text-ink-soft hover:bg-bg"
          >
            {t("nav.site")}
          </Link>
          <LogoutButton label={t("nav.logout")} />
        </nav>
      </aside>
      <main className="min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}
