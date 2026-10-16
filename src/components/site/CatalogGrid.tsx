import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { CatalogItem } from "@/lib/catalog";
import { TemplateCard } from "./TemplateCard";

/** Grille du catalogue + filtres en pastilles (liens : marche sans JavaScript). */
export async function CatalogGrid({
  items,
  locale,
  event,
  style,
}: {
  items: CatalogItem[];
  locale: "fr" | "ar";
  event?: string;
  style?: string;
}) {
  const t = await getTranslations("catalog");
  const ev = await getTranslations("events");
  const events = [...new Set(items.flatMap((i) => i.eventTypes))];
  const styles = [...new Set(items.map((i) => i.style))];
  const filtered = items.filter(
    (i) => (!event || i.eventTypes.includes(event as never)) && (!style || i.style === style),
  );
  const pill = (active: boolean) =>
    `inline-flex min-h-12 flex-none items-center rounded-full px-5 font-medium ${active ? "bg-sea text-white" : "border border-wall bg-surface text-ink"}`;
  const href = (e?: string, s?: string) => {
    const q = new URLSearchParams();
    if (s) q.set("style", s);
    const qs = q.size ? `?${q}` : "";
    return e ? `/modeles/c/${e}${qs}` : `/modeles${qs}`;
  };

  return (
    <>
      <nav
        aria-label={t("eventsLabel")}
        className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2"
      >
        <Link
          href={href(undefined, style)}
          className={pill(!event)}
          aria-current={!event ? "page" : undefined}
        >
          {t("allEvents")}
        </Link>
        {events.map((e) => (
          <Link
            key={e}
            href={href(e, style)}
            className={pill(event === e)}
            aria-current={event === e ? "page" : undefined}
          >
            {ev(e)}
          </Link>
        ))}
      </nav>
      {styles.length > 1 && (
        <nav
          aria-label={t("stylesLabel")}
          className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-2"
        >
          <Link href={href(event)} className={pill(!style)}>
            {t("allStyles")}
          </Link>
          {styles.map((s) => (
            <Link key={s} href={href(event, s)} className={pill(style === s)}>
              {t.has(`styles.${s}`) ? t(`styles.${s}`) : s}
            </Link>
          ))}
        </nav>
      )}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-card border border-dashed border-brass bg-surface p-8 text-center">
          <p className="text-ink-soft">{t("empty")}</p>
          <Link
            href="/modeles"
            className="mt-4 inline-flex min-h-12 items-center rounded-full bg-sea px-6 font-bold text-white"
          >
            {t("emptyCta")}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <TemplateCard key={item.slug} item={item} locale={locale} />
          ))}
        </div>
      )}
    </>
  );
}
