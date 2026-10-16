import { format } from "@/invitation/engine/i18n";

export type ShareTexts = { fr: string; ar: string; reminderFr: string; reminderAr: string };

/** Message WhatsApp prérempli (le client l'ouvre lui-même : aucun envoi automatique). */
export function guestWhatsapp(
  g: { name: string; phone: string | null; locale: string | null },
  ctx: {
    link: string;
    title: { fr: string; ar: string };
    defaultLang: "fr" | "ar";
    texts: ShareTexts;
    reminder?: boolean;
  },
) {
  const lang = g.locale === "ar" || (g.locale === null && ctx.defaultLang === "ar") ? "ar" : "fr";
  const template = ctx.reminder
    ? lang === "ar"
      ? ctx.texts.reminderAr
      : ctx.texts.reminderFr
    : ctx.texts[lang];
  const text = format(template, { name: g.name, title: ctx.title[lang], link: ctx.link }, lang);
  const phone = g.phone?.replace(/\D/g, "") ?? "";
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
