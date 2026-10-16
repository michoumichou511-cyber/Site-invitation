import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitch } from "./LocaleSwitch";

const NAV = [
  ["models", "/modeles"],
  ["pricing", "/tarifs"],
  ["reviews", "/avis"],
  ["faq", "/faq"],
  ["contact", "/contact"],
] as const;

/** En-tête : logo, navigation, FR / ع, menu mobile sans JavaScript (<details>). */
export function SiteHeader() {
  const t = useTranslations("nav");
  const c = useTranslations("common");
  return (
    <header className="sticky top-0 z-40 border-b border-wall/70 bg-bg/90 backdrop-blur">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-2 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2"
      >
        {c("skip")}
      </a>
      <div className="mx-auto flex h-16 max-w-site items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl text-cedar">
          <span
            aria-hidden="true"
            className="size-3.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#e9e2d3_45%,#c9bfae)] shadow-[0_0_0_1px_#d8cfbf]"
          />
          {c("brand")}
        </Link>
        <nav aria-label={c("menu")} className="hidden items-center gap-6 md:flex">
          {NAV.map(([key, href]) => (
            <Link key={key} href={href} className="text-ink-soft hover:text-sea">
              {t(key)}
            </Link>
          ))}
          <Link
            href="/commander"
            className="inline-flex min-h-12 items-center rounded-full bg-sea px-5 font-bold text-white"
          >
            {t("order")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitch />
          <details className="group relative md:hidden">
            <summary className="flex min-h-12 min-w-12 cursor-pointer list-none items-center justify-center rounded-full border border-brass bg-surface [&::-webkit-details-marker]:hidden">
              <span className="sr-only">{c("menu")}</span>
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 7h16M4 12h16M4 17h16" className="group-open:hidden" />
                <path d="M6 6l12 12M18 6 6 18" className="hidden group-open:block" />
              </svg>
            </summary>
            <nav
              aria-label={c("menu")}
              className="absolute end-0 top-14 w-64 rounded-card bg-surface p-2 shadow-float"
            >
              {NAV.map(([key, href]) => (
                <Link
                  key={key}
                  href={href}
                  className="flex min-h-12 items-center rounded-field px-4 text-ink hover:bg-bg"
                >
                  {t(key)}
                </Link>
              ))}
              <Link
                href="/suivi"
                className="flex min-h-12 items-center rounded-field px-4 text-ink hover:bg-bg"
              >
                {t("track")}
              </Link>
              <Link
                href="/commander"
                className="mt-2 flex min-h-12 items-center justify-center rounded-full bg-sea px-4 font-bold text-white"
              >
                {t("order")}
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
