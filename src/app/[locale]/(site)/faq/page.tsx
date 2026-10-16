import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { FaqList } from "@/components/home/Sections";

export async function generateMetadata({ params }: PageProps<"/[locale]/faq">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return { title: t("title") };
}

export default function FaqPage({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <FaqContent />;
}

async function FaqContent() {
  const t = await getTranslations("faq");
  const items = t.raw("items") as [string, string][];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
  return (
    <main className="mx-auto max-w-site px-4 py-10">
      <h1 className="text-[36px] text-cedar md:text-[56px]">{t("title")}</h1>
      <FaqList />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </main>
  );
}
