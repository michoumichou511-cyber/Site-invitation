/**
 * Coordonnées publiques de la marque.
 * À REMPLACER avant le lancement : numéro WhatsApp, e-mail et réseaux réels.
 */
export const SITE = {
  name: "Lou'lou'a",
  /** Numéro WhatsApp au format international sans + (ex. 213550123456). */
  whatsapp: "213000000000",
  email: "bonjour@louloua.example",
  instagram: "https://www.instagram.com/",
  tiktok: "https://www.tiktok.com/",
  /** Paiement BaridiMob / CCP (affiché à l'étape paiement). */
  payment: {
    ccpAccount: "0000000000 clé 00",
    ccpName: "NOM PRÉNOM",
    rip: "00799999000000000000",
    baridimob: "00799999000000000000",
  },
} as const;

export const waLink = (phone: string, text?: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
