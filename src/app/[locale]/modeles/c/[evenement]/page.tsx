import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogGrid } from "@/components/site/CatalogGrid";
import { EVENT_TYPES } from "@/db/schema";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

const isEvent = (e: string): e is (typeof EVENT_TYPES)[number] =>
  (EVENT_TYPES as readonly string[]).includes(e);

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/modeles/c/[evenement]">): Promise<Metadata> {
  const { locale, evenement } = await params;
  if (!isEvent(evenement)) return {};
  const t = await getTranslations({ locale, namespace: "catalog" });
  const ev = await getTranslations({ locale, namespace: "events" });
  return { title: t("categoryTitle", { event: ev(evenement) }) };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/[locale]/modeles/c/[evenement]">) {
  const [{ locale, evenement }, sp] = await Promise.all([params, searchParams]);
  if (!isEvent(evenement)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("catalog");
  const ev = await getTranslations("events");
  const items = await getCatalog();
  return (
    <main className="mx-auto max-w-site px-4 py-10">
      <h1 className="text-[36px] text-cedar md:text-[56px]">
        {t("categoryTitle", { event: ev(evenement) })}
      </h1>
      <p className="mt-2 max-w-prose text-ink-soft">{t("lead")}</p>
      <CatalogGrid
        items={items}
        locale={locale as "fr" | "ar"}
        event={evenement}
        style={typeof sp.style === "string" ? sp.style : undefined}
      />
    </main>
  );
}
