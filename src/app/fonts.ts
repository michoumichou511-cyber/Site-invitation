import { Aref_Ruqaa, Marcellus, Pinyon_Script, Reem_Kufi, Tajawal } from "next/font/google";

// Polices auto-hébergées par next/font (téléchargées au build, servies depuis notre domaine).
// Budget invitations : < 150 Ko de polices → graisses limitées, pas de préchargement
// des polices qui ne servent qu'à une langue (elles se chargent seulement si utilisées).

export const marcellus = Marcellus({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-marcellus",
});

export const tajawal = Tajawal({
  weight: ["400", "500", "700"],
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-tajawal",
});

/** Tajawal allégée pour les invitations (2 graisses). */
export const tajawalInvitation = Tajawal({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-tajawal",
});

export const reemKufi = Reem_Kufi({
  weight: ["500", "700"],
  subsets: ["arabic"],
  display: "swap",
  preload: false,
  variable: "--font-reem-kufi",
});

export const pinyonScript = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pinyon",
});

export const arefRuqaa = Aref_Ruqaa({
  weight: "400",
  subsets: ["arabic"],
  display: "swap",
  preload: false,
  variable: "--font-aref-ruqaa",
});
