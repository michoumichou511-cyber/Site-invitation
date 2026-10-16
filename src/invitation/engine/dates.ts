import type { Lang } from "./config";

/** Fuseau des fêtes : l'Algérie (UTC+1, sans heure d'été). */
export const TIME_ZONE = "Africa/Algiers";

const locales: Record<Lang, string> = { fr: "fr-DZ", ar: "ar-DZ-u-nu-latn" };

export function formatLongDate(ms: number, lang: Lang) {
  return new Intl.DateTimeFormat(locales[lang], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(ms);
}

export function formatTime(ms: number, lang: Lang) {
  return new Intl.DateTimeFormat(locales[lang], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE,
  }).format(ms);
}

/** Date de l'hégire (calendrier Umm al-Qura), ou "" si le navigateur ne la connaît pas. */
export function formatHijri(ms: number, lang: Lang) {
  try {
    return new Intl.DateTimeFormat(`${lang === "ar" ? "ar" : "fr"}-u-ca-islamic-umalqura-nu-latn`, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: TIME_ZONE,
    }).format(ms);
  } catch {
    return "";
  }
}
