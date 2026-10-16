import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Packs } from "@/components/home/Sections";
import { PhoneDemo } from "@/components/site/PhoneDemo";
import { TemplateCard } from "@/components/site/TemplateCard";
import { Link } from "@/i18n/navigation";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/modeles/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = (await getCatalog()).find((i) => i.slug === slug);
  if (!item) return {};
  const lang = locale as "fr" | "ar";
  return { title: item.name[lang], description: item.description?.[lang] };
}

export default async function TemplatePage({ params }: PageProps<"/[locale]/modeles/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const lang = locale as "fr" | "ar";
  const catalog = await getCatalog();
  const item = catalog.find((i) => i.slug === slug);
  if (!item) notFound();
  const t = await getTranslations("template");
  const c = await getTranslations("common");
  const cat = await getTranslations("catalog");
  const ev = await getTranslations("events");
  const others = catalog.filter((i) => i.slug !== slug).slice(0, 3);
  const demo = `/i/${item.demoSlug}?lang=${lang}`;

  return (
    <main className="pb-24">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-10 md:grid-cols-2 md:items-start">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {item.badges.map((b) => (
              <span key={b} className="rounded-full bg-coral px-3 py-1 text-sm font-bold text-ink">
                {cat(`badges.${b}`)}
              </span>
            ))}
          </div>
          <h1 className="text-[36px] text-cedar md:text-[56px]">{item.name[lang]}</h1>
          {item.description && <p className="text-lg text-ink-soft">{item.description[lang]}</p>}
          <p className="text-ink-soft">
            {t("events", { events: item.eventTypes.map((e) => ev(e)).join(", ") })}
          </p>
          <h2 className="pt-4 text-2xl text-cedar">{t("included")}</h2>
          <ul className="space-y-2">
            {(t.raw("includedItems") as string[]).map((i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden="true" className="text-zellige">
                  ✓
                </span>
                {i}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2 md:sticky md:top-24">
          <p className="text-center text-sm text-ink-soft">{t("demoHint")}</p>
          <PhoneDemo src={demo} title={item.name[lang]} fullscreenLabel={c("fullscreen")} />
        </div>
      </div>

      <h2 className="mx-auto max-w-site px-4 text-[28px] text-cedar">{t("packs")}</h2>
      <Packs showTitle={false} />

      {others.length > 0 && (
        <section className="mx-auto max-w-site px-4 py-10">
          <h2 className="text-[28px] text-cedar">{t("others")}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <TemplateCard key={o.slug} item={o} locale={lang} />
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-wall bg-bg/95 p-3 pe-20 backdrop-blur md:pe-3">
        <div className="mx-auto flex max-w-site justify-center">
          <Link
            href={`/commander?modele=${item.slug}`}
            className="inline-flex min-h-12 w-full max-w-md items-center justify-center rounded-full bg-sea px-6 font-bold text-white"
          >
            {c("customize")}
          </Link>
        </div>
      </div>
    </main>
  );
}
