import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatDa, type CatalogItem } from "@/lib/catalog";

/** Carte modèle : aperçu en arche, nom, événements, prix « à partir de », badges. */
export async function TemplateCard({ item, locale }: { item: CatalogItem; locale: "fr" | "ar" }) {
  const t = await getTranslations("catalog");
  const c = await getTranslations("common");
  const ev = await getTranslations("events");
  return (
    <Link
      href={`/modeles/${item.slug}`}
      className="group block rounded-card bg-surface p-3 shadow-float transition-transform duration-300 [transform-style:preserve-3d] hover:[transform:perspective(900px)_rotateX(4deg)_rotateY(-4deg)] motion-reduce:hover:transform-none rtl:hover:[transform:perspective(900px)_rotateX(4deg)_rotateY(4deg)]"
    >
      <div className="relative overflow-hidden rounded-t-full bg-wall">
        {/* eslint-disable-next-line @next/next/no-img-element -- aperçus SVG/WebP déjà optimisés */}
        <img
          src={item.previewImage}
          alt=""
          width={270}
          height={570}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover object-top"
        />
        {item.badges.length > 0 && (
          <div className="absolute start-3 top-[40%] flex flex-col gap-1">
            {item.badges.map((b) => (
              <span key={b} className="rounded-full bg-coral px-3 py-1 text-sm font-bold text-ink">
                {t(`badges.${b}`)}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-1 px-1 pt-3 pb-1">
        <h3 className="text-xl text-cedar">{item.name[locale]}</h3>
        <p className="text-sm text-ink-soft">{item.eventTypes.map((e) => ev(e)).join(" · ")}</p>
        <p className="font-bold text-sea">
          {c("from", { price: c("da", { amount: formatDa(item.basePriceDa, locale) }) })}
        </p>
      </div>
    </Link>
  );
}
