import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { FaqList, Packs } from "@/components/home/Sections";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/tarifs">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return { title: t("title"), description: t("lead") };
}

export default function PricingPage({ params }: PageProps<"/[locale]/tarifs">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <PricingContent />;
}

async function PricingContent() {
  const t = await getTranslations("pricing");
  const p = await getTranslations("packs");
  const f = await getTranslations("faq");
  return (
    <main className="py-10">
      <div className="mx-auto max-w-site px-4">
        <h1 className="text-[36px] text-cedar md:text-[56px]">{t("title")}</h1>
        <p className="mt-2 max-w-prose text-ink-soft">{t("lead")}</p>
      </div>
      <Packs showTitle={false} />
      <section className="mx-auto max-w-site px-4">
        <h2 className="text-[28px] text-cedar">{p("optionsTitle")}</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {(p.raw("options") as string[]).map((o) => (
            <li key={o} className="reveal rounded-card border border-wall bg-surface p-4">
              {o}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-ink-soft">{p("note")}</p>
        <h2 className="mt-12 text-[28px] text-cedar">{f("title")}</h2>
        <FaqList limit={4} />
      </section>
    </main>
  );
}
