import { getTranslations } from "next-intl/server";
import { SplitTitle } from "@/components/site/SplitTitle";
import { TemplateCard } from "@/components/site/TemplateCard";
import { Link } from "@/i18n/navigation";
import type { CatalogItem, PublicReview } from "@/lib/catalog";

export const PACK_IDS = ["essentiel", "premium", "prestige"] as const;

const sectionTitle = "text-[28px] text-cedar md:text-[40px]";

export async function HowItWorks() {
  const t = await getTranslations("home");
  const steps = [
    [t("how1"), t("how1p")],
    [t("how2"), t("how2p")],
    [t("how3"), t("how3p")],
  ];
  return (
    <section id="comment" className="mx-auto max-w-site scroll-mt-20 px-4 py-16 md:py-24">
      <SplitTitle className={sectionTitle}>{t("howTitle")}</SplitTitle>
      <ol className="mt-8 grid gap-5 md:grid-cols-3">
        {steps.map(([title, text], i) => (
          <li
            key={i}
            className="flex flex-col gap-2 rounded-card border border-wall bg-surface p-6"
          >
            <span className="font-display text-3xl text-sea">{i + 1}</span>
            <strong className="text-xl">{title}</strong>
            <p className="text-ink-soft">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export async function FeaturedModels({
  items,
  locale,
}: {
  items: CatalogItem[];
  locale: "fr" | "ar";
}) {
  const t = await getTranslations("home");
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-site px-4 py-16">
      <div className="flex items-end justify-between gap-4">
        <SplitTitle className={sectionTitle}>{t("featuredTitle")}</SplitTitle>
        <Link href="/modeles" className="inline-flex min-h-12 items-center font-bold text-sea">
          {t("featuredAll")}
        </Link>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item) => (
          <TemplateCard key={item.slug} item={item} locale={locale} />
        ))}
      </div>
    </section>
  );
}

export async function Compare() {
  const t = await getTranslations("home");
  const rows = t.raw("compareRows") as Record<string, [string, string, string]>;
  return (
    <section className="mx-auto max-w-site px-4 py-16">
      <SplitTitle className={sectionTitle}>{t("compareTitle")}</SplitTitle>
      <div className="mt-8 overflow-hidden rounded-card border border-wall bg-surface">
        <table className="w-full text-start">
          <thead>
            <tr className="bg-wall/60">
              <th className="p-3 text-start" scope="col">
                <span className="sr-only">—</span>
              </th>
              <th className="p-3 text-start text-sea" scope="col">
                {t("compareDigital")}
              </th>
              <th className="p-3 text-start text-ink-soft" scope="col">
                {t("comparePaper")}
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(rows).map(([key, [label, digital, paper]]) => (
              <tr key={key} className="border-t border-wall align-top">
                <th scope="row" className="p-3 text-start font-bold">
                  {label}
                </th>
                <td className="p-3">{digital}</td>
                <td className="p-3 text-ink-soft">{paper}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export async function Packs({ showTitle = true }: { showTitle?: boolean }) {
  const t = await getTranslations("packs");
  const h = await getTranslations("home");
  return (
    <section className="mx-auto max-w-site px-4 py-16">
      {showTitle && <SplitTitle className={sectionTitle}>{h("packsTitle")}</SplitTitle>}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {PACK_IDS.map((id) => {
          const popular = id === "premium";
          const items = t.raw(`${id}.items`) as string[];
          return (
            <article
              key={id}
              className={`relative flex flex-col gap-4 rounded-card bg-surface p-6 ${popular ? "border-2 border-sea shadow-float" : "border border-wall"}`}
            >
              {popular && (
                <span className="absolute start-6 -top-3 rounded-full bg-sea px-3 py-1 text-sm font-bold text-white">
                  {t("popular")}
                </span>
              )}
              <h3 className="text-2xl text-cedar">{t(`${id}.name`)}</h3>
              <p className="text-3xl font-bold text-ink">{t(`${id}.price`)}</p>
              <p className="text-sm text-ink-soft">{t(`${id}.delay`)}</p>
              <ul className="flex-1 space-y-2">
                {items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="text-zellige">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={`/commander?pack=${id}`}
                className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 font-bold ${popular ? "bg-sea text-white" : "border-[1.5px] border-sea text-sea"}`}
              >
                {t("choose", { name: t(`${id}.name`) })}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export async function ReviewsList({ reviews }: { reviews: PublicReview[] }) {
  const t = await getTranslations("reviews");
  if (reviews.length === 0) {
    return (
      <p className="mt-6 rounded-card border border-dashed border-brass bg-surface p-6 text-ink-soft">
        {t("empty")}
      </p>
    );
  }
  return (
    <ul className="mt-8 grid gap-5 md:grid-cols-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-card border border-wall bg-surface p-6">
          <p aria-label={t("rating", { rating: r.rating })} className="text-brass">
            {"★".repeat(r.rating)}
            <span className="text-wall">{"★".repeat(5 - r.rating)}</span>
          </p>
          {r.text && <p className="mt-2">{r.text}</p>}
        </li>
      ))}
    </ul>
  );
}

export async function FaqList({ limit }: { limit?: number }) {
  const t = await getTranslations("faq");
  const items = (t.raw("items") as [string, string][]).slice(0, limit);
  return (
    <div className="mt-8 divide-y divide-wall rounded-card border border-wall bg-surface">
      {items.map(([q, a]) => (
        <details key={q} className="group px-5">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-bold [&::-webkit-details-marker]:hidden">
            {q}
            <span aria-hidden="true" className="text-sea transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="pb-5 text-ink-soft">{a}</p>
        </details>
      ))}
    </div>
  );
}

export async function FinalCta() {
  const t = await getTranslations("home");
  const c = await getTranslations("common");
  return (
    <section className="mx-auto max-w-site px-4 py-16">
      <div className="rounded-card bg-sea px-6 py-12 text-center text-white md:px-12">
        <h2 className="text-[28px] md:text-[40px]">{t("ctaTitle")}</h2>
        <p className="mx-auto mt-3 max-w-prose text-white/90">{t("ctaText")}</p>
        <Link
          href="/modeles"
          className="mt-6 inline-flex min-h-12 items-center rounded-full bg-surface px-6 font-bold text-sea"
        >
          {c("seeModels")}
        </Link>
      </div>
    </section>
  );
}
