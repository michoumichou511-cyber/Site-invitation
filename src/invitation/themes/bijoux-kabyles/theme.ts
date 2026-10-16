import { svgPattern, type ThemeDefinition } from "../../engine/theme";

/**
 * Bijoux kabyles — fibules et parures en argent émaillé (PRD) : argent #B4B6B6,
 * argent sombre #4F4940, corail #DB7456, émail turquoise #578993, laiton #C1A37A.
 * Laiton éclairci (#E2C9A0) pour le texte ; turquoise foncée (#3F6F78) pour les boutons.
 */
export const kabyleTheme: ThemeDefinition = {
  slug: "bijoux-kabyles",
  opener: "envelope",
  defaultPalette: "argent",
  palettes: {
    argent: {
      ground: "#4F4940",
      groundDeep: "#3A352E",
      accent: "#E2C9A0",
      soft: "#E6E6E4",
      bright: "#FFFFFF",
      paper: "#F4F3F1",
      ink: "#2E2A25",
      action: "#3F6F78",
      onAction: "#FFFFFF",
    },
  },
  confetti: ["#DB7456", "#578993", "#C1A37A", "#B4B6B6"],
  // Losanges et triangles des poteries et tapis kabyles.
  pattern: svgPattern(
    `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='none' stroke-width='1.2'><path d='M30 6l12 12-12 12-12-12z' stroke='#DB7456'/><path d='M0 54l10-10 10 10 10-10 10 10 10-10 10 10' stroke='#578993'/><circle cx='30' cy='18' r='2.5' fill='#C1A37A' stroke='none'/></g></svg>`,
  ),
};
