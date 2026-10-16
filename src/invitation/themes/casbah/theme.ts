import { svgPattern, type ThemeDefinition } from "../../engine/theme";

/**
 * Casbah d'Alger — vieilles portes de la Casbah (PRD) : chaux #DCD8CF, pierre #BAAE9E,
 * bois de cèdre #421A0C, bois ciré #633525, laiton #D7C099. Thème clair : texte en cèdre.
 */
export const casbahTheme: ThemeDefinition = {
  slug: "casbah",
  opener: "doors",
  defaultPalette: "chaux",
  palettes: {
    chaux: {
      ground: "#EDEAE4",
      groundDeep: "#DCD8CF",
      accent: "#633525",
      soft: "#421A0C",
      bright: "#2B140A",
      paper: "#FFFFFF",
      ink: "#2B140A",
      action: "#421A0C",
      onAction: "#FFFFFF",
    },
  },
  confetti: ["#D7C099", "#BAAE9E", "#633525", "#FFFFFF"],
  // Moucharabieh : losanges entrelacés.
  pattern: svgPattern(
    `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'><g fill='none' stroke='#633525' stroke-width='1'><path d='M24 2L46 24 24 46 2 24z'/><path d='M24 12l12 12-12 12-12-12z'/><circle cx='24' cy='24' r='3'/></g></svg>`,
  ),
};
