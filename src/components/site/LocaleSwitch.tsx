"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

/** Pastille FR / ع : garde la page en cours, change seulement la langue. */
export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("common");
  const other = locale === "ar" ? "fr" : "ar";

  return (
    <Link
      href={pathname}
      locale={other}
      hrefLang={other}
      aria-label={t("switchLanguage")}
      className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-brass bg-surface px-4 text-sm font-medium text-ink"
    >
      {other === "ar" ? "ع" : "FR"}
    </Link>
  );
}
