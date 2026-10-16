import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Wizard } from "@/components/order/Wizard";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/commander">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "order" });
  return { title: t("title"), robots: { index: false } };
}

export default async function OrderPage({
  params,
  searchParams,
}: PageProps<"/[locale]/commander">) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const catalog = await getCatalog();
  return (
    <main>
      <Wizard
        templates={catalog.map((c) => ({
          slug: c.slug,
          name: c.name,
          eventTypes: c.eventTypes,
          previewImage: c.previewImage,
        }))}
        initialModel={typeof sp.modele === "string" ? sp.modele : undefined}
      />
    </main>
  );
}
