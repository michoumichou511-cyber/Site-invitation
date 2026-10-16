import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogGrid } from "@/components/site/CatalogGrid";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/modeles">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });
  return { title: t("title"), description: t("lead") };
}

export default async function CatalogPage({
  params,
  searchParams,
}: PageProps<"/[locale]/modeles">) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("catalog");
  const items = await getCatalog();
  return (
    <main className="mx-auto max-w-site px-4 py-10">
      <h1 className="text-[36px] text-cedar md:text-[56px]">{t("title")}</h1>
      <p className="mt-2 max-w-prose text-ink-soft">{t("lead")}</p>
      <CatalogGrid
        items={items}
        locale={locale as "fr" | "ar"}
        style={typeof sp.style === "string" ? sp.style : undefined}
      />
    </main>
  );
}
