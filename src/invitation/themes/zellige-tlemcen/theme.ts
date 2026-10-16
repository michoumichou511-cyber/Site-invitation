import { svgPattern, type ThemeDefinition } from "../../engine/theme";

/**
 * Zellige de Tlemcen — médersa Tachfiniya et plaques de zellige (PRD) :
 * plâtre #C6BBAF, vert zellige #16544E, ocre #A88861, sable #CBB59A, brun #6E4719,
 * noir #2B3130. Sable éclairci (#D6C3A8) pour le texte sur le vert (5:1).
 */
export const zelligeTheme: ThemeDefinition = {
  slug: "zellige-tlemcen",
  opener: "envelope",
  defaultPalette: "zellige",
  palettes: {
    zellige: {
      ground: "#16544E",
      groundDeep: "#0F3D38",
      accent: "#D6C3A8",
      soft: "#E4DCD2",
      bright: "#F7F3EE",
      paper: "#F3EEE7",
      ink: "#2B3130",
      action: "#16544E",
      onAction: "#FFFFFF",
    },
    ocre: {
      ground: "#6E4719",
      groundDeep: "#55360F",
      accent: "#E3D2B4",
      soft: "#EFE6DA",
      bright: "#FBF8F3",
      paper: "#F3EEE7",
      ink: "#2B3130",
      action: "#6E4719",
      onAction: "#FFFFFF",
    },
  },
  confetti: ["#CBB59A", "#A88861", "#F3EEE7", "#C6BBAF"],
  // Étoile à huit branches du zellige.
  pattern: svgPattern(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='#CBB59A' stroke-width='1.1'><rect x='22' y='22' width='36' height='36'/><rect x='22' y='22' width='36' height='36' transform='rotate(45 40 40)'/><circle cx='40' cy='40' r='6'/><path d='M0 0l12 12M80 0L68 12M0 80l12-12M80 80L68 68'/></g></svg>`,
  ),
};
