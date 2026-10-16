import type { SectionProps } from "./types";

/** Galerie en arches. Masquée en mode discret (aucune photo des mariés). */
export function Gallery({ vm, lang, t }: SectionProps) {
  const photos = vm.config.gallery;
  if (vm.discreet || photos.length === 0) return null;
  return (
    <section className="inv-reveal" aria-labelledby="h-gallery">
      <h2 id="h-gallery">{t("galleryTitle")}</h2>
      <div className="inv-gallery">
        {photos.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- images déjà en WebP, pas d'optimiseur
          <img key={i} src={p.src} alt={p.alt[lang]} loading="lazy" decoding="async" />
        ))}
      </div>
    </section>
  );
}
