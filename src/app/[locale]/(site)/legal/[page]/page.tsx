import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { routing } from "@/i18n/routing";

const PAGES = ["cgv", "confidentialite", "remboursement"] as const;
type LegalPage = (typeof PAGES)[number];
const UPDATED = "2026-10-16";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => PAGES.map((page) => ({ locale, page })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/legal/[page]">): Promise<Metadata> {
  const { locale, page } = await params;
  if (!PAGES.includes(page as LegalPage)) return {};
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t(`pages.${page}.title`) };
}

export default function LegalPageRoute({ params }: PageProps<"/[locale]/legal/[page]">) {
  const { locale, page } = use(params);
  if (!PAGES.includes(page as LegalPage)) notFound();
  setRequestLocale(locale);
  return <LegalContent page={page as LegalPage} locale={locale} />;
}

async function LegalContent({ page, locale }: { page: LegalPage; locale: string }) {
  const t = await getTranslations("legal");
  const sections = t.raw(`pages.${page}.sections`) as [string, string][];
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ-u-nu-latn" : "fr-FR", {
    dateStyle: "long",
  }).format(new Date(UPDATED));
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="rounded-field border border-coral bg-coral/15 p-3 text-sm text-ink">
        {t("draft")}
      </p>
      <h1 className="mt-6 text-[32px] text-cedar md:text-[48px]">{t(`pages.${page}.title`)}</h1>
      <p className="text-sm text-ink-soft">{t("updated", { date })}</p>
      {sections.map(([title, text]) => (
        <section key={title} className="mt-8">
          <h2 className="text-2xl text-cedar">{title}</h2>
          <p className="mt-2">{text}</p>
        </section>
      ))}
    </main>
  );
}
