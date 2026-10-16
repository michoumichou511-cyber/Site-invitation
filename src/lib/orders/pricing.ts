import type { PACKS } from "@/db/schema";

export type Pack = (typeof PACKS)[number];

/** Prix des packs en DA (hypothèses du PRD, à confirmer). */
export const PACK_PRICES: Record<Pack, number> = {
  essentiel: 2500,
  premium: 5000,
  prestige: 10000,
};

/** Délai de livraison promis, en heures, à partir de la validation du paiement. */
export const PACK_DELAY_HOURS: Record<Pack, number> = {
  essentiel: 24,
  premium: 24,
  prestige: 5 * 24,
};

const RANK: Record<Pack, number> = { essentiel: 0, premium: 1, prestige: 2 };

/** Un modèle peut exiger un pack minimum (ex. ouverture 3D = Prestige). */
export const packAllowed = (pack: Pack, minPack: Pack) => RANK[pack] >= RANK[minPack];

export function orderAmount(pack: Pack, templateBase: number) {
  // Le prix d'un modèle « à partir de » correspond au pack Essentiel ; les autres packs
  // ajoutent leur différence.
  return Math.max(PACK_PRICES[pack], templateBase + (PACK_PRICES[pack] - PACK_PRICES.essentiel));
}
