import type { SectionProps } from "./types";

/**
 * Galerie en arches ou en polaroïds. Mode discret : aucune photo des mariés,
 * un médaillon décoratif du thème à la place.
 */
export function Gallery({
  vm,
  lang,
  t,
  style = "arch",
}: SectionProps & { style?: "arch" | "polaroid" }) {
  const photos = vm.config.gallery;
  if (vm.discreet) {
    return (
      <div className="inv-reveal inv-discreet" role="img" aria-label={t("discreetArt")}>
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="100" cy="100" r="86" />
            <circle cx="100" cy="100" r="70" strokeDasharray="2 6" />
            <rect x="58" y="58" width="84" height="84" />
            <rect x="58" y="58" width="84" height="84" transform="rotate(45 100 100)" />
            <circle cx="100" cy="100" r="14" />
            <path d="M100 30c14 18 14 40 0 56-14-16-14-38 0-56zM100 170c14-18 14-40 0-56-14 16-14 38 0 56zM30 100c18-14 40-14 56 0-16 14-38 14-56 0zM170 100c-18-14-40-14-56 0 16 14 38 14 56 0z" />
          </g>
        </svg>
      </div>
    );
  }
  if (photos.length === 0) return null;
  return (
    <section className="inv-reveal" aria-labelledby="h-gallery">
      <h2 id="h-gallery">{t("galleryTitle")}</h2>
      <div className={style === "polaroid" ? "inv-polaroids" : "inv-gallery"}>
        {photos.map((p, i) =>
          style === "polaroid" ? (
            <figure
              key={i}
              style={{ "--r": `${(i % 2 ? 1 : -1) * (2 + (i % 3))}deg` } as React.CSSProperties}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- images déjà en WebP */}
              <img src={p.src} alt={p.alt[lang]} loading="lazy" decoding="async" />
            </figure>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- images déjà en WebP, pas d'optimiseur
            <img key={i} src={p.src} alt={p.alt[lang]} loading="lazy" decoding="async" />
          ),
        )}
      </div>
    </section>
  );
}
