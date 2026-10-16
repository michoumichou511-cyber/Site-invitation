import { svgPattern, type ThemeDefinition } from "../../engine/theme";

/**
 * Ciel — anniversaire, dans l'esprit de la vidéo Canva : bougie à souffler, cadeau à
 * ouvrir, polaroïds. Palette baie d'Alger (PRD) : bleu ciel #A8C7DE, bleu Méditerranée
 * #045588, brume #D2DBDE, bleu profond #274958, et une touche de corail #DB7456.
 */
export const cielTheme: ThemeDefinition = {
  slug: "ciel",
  opener: "gift",
  galleryStyle: "polaroid",
  candle: true,
  defaultPalette: "ciel",
  palettes: {
    ciel: {
      ground: "#E6F0F8",
      groundDeep: "#C9DDEC",
      accent: "#045588",
      soft: "#274958",
      bright: "#1E3A47",
      paper: "#FFFFFF",
      ink: "#1E3A47",
      action: "#045588",
      onAction: "#FFFFFF",
    },
  },
  confetti: ["#DB7456", "#A8C7DE", "#045588", "#F7D6CC", "#FFFFFF"],
  // Nuages et petits points.
  pattern: svgPattern(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='#FFFFFF'><circle cx='20' cy='30' r='12'/><circle cx='34' cy='26' r='14'/><circle cx='48' cy='32' r='10'/><circle cx='86' cy='88' r='10'/><circle cx='98' cy='84' r='12'/></g><g fill='#DB7456'><circle cx='90' cy='20' r='2'/><circle cx='20' cy='96' r='2'/></g></svg>`,
  ),
};
