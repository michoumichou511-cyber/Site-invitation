import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroStage, type HeroCopy } from "@/components/hero/HeroStage";
import {
  Compare,
  FaqList,
  FeaturedModels,
  FinalCta,
  HowItWorks,
  Packs,
  ReviewsList,
} from "@/components/home/Sections";
import { SplitTitle } from "@/components/site/SplitTitle";
import { Link } from "@/i18n/navigation";
import { getCatalog, getPublishedReviews } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "./", languages: { fr: "/fr", ar: "/ar", "x-default": "/fr" } },
};

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = (await params) as { locale: "fr" | "ar" };
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const c = await getTranslations("common");
  const [catalog, reviews] = await Promise.all([getCatalog(), getPublishedReviews(3)]);

  const copy: HeroCopy = {
    lang: locale,
    eyebrow: t("eyebrow"),
    title: t("heroTitle"),
    lead: t("heroLead"),
    cta: c("seeModels"),
    ctaHref: `/${locale}/modeles`,
    how: t("howCta"),
    howHref: "#comment",
    phoneLabel: t("phoneLabel"),
    slides: t.raw("slides") as string[],
    chips: [
      { k: t("chipRsvpK"), v: t("chipRsvpV"), icon: "check" },
      { k: t("chipMapK"), v: t("chipMapV"), icon: "pin" },
      { k: t("chipMusicK"), v: t("chipMusicV"), icon: "music" },
      { k: t("chipDayK"), v: t("chipDayV", { days: 60, hours: 0 }), icon: "clock" },
    ],
    dayTemplate: t.raw("chipDayV") as string,
  };

  return (
    <main>
      <HeroStage copy={copy} />
      <HowItWorks />
      <FeaturedModels items={catalog} locale={locale} />
      <Compare />
      <Packs />
      <section className="mx-auto max-w-site px-4 py-16">
        <SplitTitle className="text-[28px] text-cedar md:text-[40px]">
          {t("reviewsTitle")}
        </SplitTitle>
        <ReviewsList reviews={reviews} />
      </section>
      <section className="mx-auto max-w-site px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <SplitTitle className="text-[28px] text-cedar md:text-[40px]">{t("faqTitle")}</SplitTitle>
          <Link href="/faq" className="inline-flex min-h-12 items-center font-bold text-sea">
            {t("faqAll")}
          </Link>
        </div>
        <FaqList limit={4} />
      </section>
      <FinalCta />
    </main>
  );
}
