import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReviewsList } from "@/components/home/Sections";
import { getPublishedReviews } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/avis">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviews" });
  return { title: t("title"), description: t("lead") };
}

export default async function ReviewsPage({ params }: PageProps<"/[locale]/avis">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("reviews");
  const reviews = await getPublishedReviews(60);
  return (
    <main className="mx-auto max-w-site px-4 py-10">
      <h1 className="text-[36px] text-cedar md:text-[56px]">{t("title")}</h1>
      <p className="mt-2 max-w-prose text-ink-soft">{t("lead")}</p>
      <ReviewsList reviews={reviews} />
    </main>
  );
}
