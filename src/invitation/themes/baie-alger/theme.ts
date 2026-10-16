import { svgPattern, type ThemeDefinition } from "../../engine/theme";

/**
 * Baie d'Alger — naissance. Baie vue du ciel (PRD) : bleu Méditerranée #045588,
 * bleu moyen #4F8DBB, bleu ciel #A8C7DE, brume #D2DBDE, bleu profond #274958.
 */
export const baieTheme: ThemeDefinition = {
  slug: "baie-alger",
  opener: "envelope",
  defaultPalette: "brume",
  palettes: {
    brume: {
      ground: "#F5F8FA",
      groundDeep: "#D2DBDE",
      accent: "#045588",
      soft: "#274958",
      bright: "#1E3A47",
      paper: "#FFFFFF",
      ink: "#1E3A47",
      action: "#045588",
      onAction: "#FFFFFF",
    },
  },
  confetti: ["#A8C7DE", "#4F8DBB", "#FFFFFF", "#D2DBDE"],
  // Vagues de la baie.
  pattern: svgPattern(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='40' viewBox='0 0 80 40'><path d='M0 20q10-10 20 0t20 0 20 0 20 0' fill='none' stroke='#4F8DBB' stroke-width='1.2'/><path d='M0 34q10-8 20 0t20 0 20 0 20 0' fill='none' stroke='#A8C7DE' stroke-width='1'/></svg>`,
  ),
};
