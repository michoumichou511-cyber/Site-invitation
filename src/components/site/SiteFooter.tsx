import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SITE, waLink } from "@/config/site";

export function SiteFooter() {
  const t = useTranslations("footer");
  const n = useTranslations("nav");
  const c = useTranslations("common");
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 bg-cedar text-wall">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-14 md:grid-cols-3">
        <div className="space-y-3">
          <p className="font-display text-2xl text-white">{c("brand")}</p>
          <p className="text-wall/80">{t("tagline")}</p>
          <a
            href={waLink(SITE.whatsapp, c("whatsappMessage"))}
            className="inline-flex min-h-12 items-center rounded-full border border-brass px-5 text-white"
            target="_blank"
            rel="noopener"
          >
            {c("whatsappUs")}
          </a>
        </div>
        <nav aria-label={t("site")} className="flex flex-col">
          <p className="mb-2 font-bold text-brass">{t("site")}</p>
          {(
            [
              ["models", "/modeles"],
              ["pricing", "/tarifs"],
              ["reviews", "/avis"],
              ["faq", "/faq"],
              ["contact", "/contact"],
              ["track", "/suivi"],
              ["account", "/connexion"],
            ] as const
          ).map(([key, href]) => (
            <Link
              key={key}
              href={href}
              className="flex min-h-12 items-center text-wall/90 hover:text-white"
            >
              {n(key)}
            </Link>
          ))}
        </nav>
        <nav aria-label={t("legal")} className="flex flex-col">
          <p className="mb-2 font-bold text-brass">{t("legal")}</p>
          {(
            [
              ["cgv", "cgv"],
              ["privacy", "confidentialite"],
              ["refund", "remboursement"],
            ] as const
          ).map(([key, page]) => (
            <Link
              key={key}
              href={`/legal/${page}`}
              className="flex min-h-12 items-center text-wall/90 hover:text-white"
            >
              {t(key)}
            </Link>
          ))}
        </nav>
      </div>
      <p className="border-t border-white/10 px-4 py-6 text-center text-sm text-wall/70">
        {t("rights", { year })}
      </p>
    </footer>
  );
}
