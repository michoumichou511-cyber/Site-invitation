import type { ThemeDefinition } from "../../engine/theme";

const fetla = (color: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'><g fill='none' stroke='${color}' stroke-width='1.1'><path d='M48 8c10 12 10 28 0 40-10-12-10-28 0-40zM48 88c10-12 10-28 0-40-10 12-10 28 0 40zM8 48c12-10 28-10 40 0-12 10-28 10-40 0zM88 48c-12-10-28-10-40 0 12 10 28 10 40 0z'/><circle cx='48' cy='48' r='4'/><circle cx='0' cy='0' r='10'/><circle cx='96' cy='0' r='10'/><circle cx='0' cy='96' r='10'/><circle cx='96' cy='96' r='10'/></g></svg>`,
  )}")`;

/**
 * Karakou — palette mesurée sur des karakous exposés à Alger (PRD, Identité algérienne) :
 * velours bordeaux #4D1919, brique #73392F, or fetla #B49068, or vieilli #9E6D3A,
 * ivoire #D0B8A2, bleu nuit #546E8D. Le papier et le texte clair sont éclaircis
 * à partir de l'ivoire pour garder un contraste ≥ 4,5:1.
 */
export const karakouTheme: ThemeDefinition = {
  slug: "karakou",
  opener: "envelope",
  defaultPalette: "velours",
  palettes: {
    velours: {
      ground: "#4D1919",
      groundDeep: "#381111",
      accent: "#B49068",
      soft: "#E3D3C2",
      bright: "#F6EDE3",
      paper: "#F4ECE2",
      ink: "#2E1410",
      action: "#73392F",
      onAction: "#FFFFFF",
    },
    nuit: {
      ground: "#1F2A3A",
      groundDeep: "#151D29",
      accent: "#B49068",
      soft: "#D9DEE6",
      bright: "#F6EDE3",
      paper: "#F4ECE2",
      ink: "#1F2A3A",
      action: "#546E8D",
      onAction: "#FFFFFF",
    },
  },
  confetti: ["#B49068", "#E3D3C2", "#9E6D3A", "#F6EDE3"],
  pattern: fetla("#B49068"),
};
