import { Aref_Ruqaa, Marcellus, Pinyon_Script, Reem_Kufi, Tajawal } from "next/font/google";

// Polices auto-hébergées par next/font (téléchargées au build, servies depuis notre domaine).

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

export const reemKufi = Reem_Kufi({
  weight: ["500", "700"],
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-reem-kufi",
});

export const pinyonScript = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pinyon",
});

export const arefRuqaa = Aref_Ruqaa({
  weight: ["400", "700"],
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-aref-ruqaa",
});
