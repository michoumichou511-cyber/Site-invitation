import "server-only";
import { getTranslations } from "next-intl/server";
import { siteUrl } from "@/lib/orders/notify";
import fr from "../../../messages/fr.json";
import ar from "../../../messages/ar.json";
import { format } from "@/invitation/engine/i18n";

type Inv = { slug: string; eventType: string; config: unknown; languages: string[] };

/** Titre et textes de partage d'une invitation (pour les messages WhatsApp). */
export async function shareContext(inv: Inv) {
  const t = await getTranslations("account.wa");
  const c = inv.config as {
    names: { first: { fr: string; ar: string }; second?: { fr: string; ar: string } };
  };
  const names = {
    fr: [c.names.first.fr, c.names.second?.fr].filter(Boolean).join(" & "),
    ar: [c.names.first.ar, c.names.second?.ar].filter(Boolean).join(" و "),
  };
  const og = {
    fr: fr.invitation.ogTitle as Record<string, string>,
    ar: ar.invitation.ogTitle as Record<string, string>,
  };
  return {
    linkBase: await siteUrl(`/i/${inv.slug}`),
    title: {
      fr: format(og.fr[inv.eventType] ?? "{names}", { names: names.fr }),
      ar: format(og.ar[inv.eventType] ?? "{names}", { names: names.ar }, "ar"),
    },
    defaultLang: (inv.languages[0] === "ar" ? "ar" : "fr") as "fr" | "ar",
    texts: {
      fr: t.raw("fr") as string,
      ar: t.raw("ar") as string,
      reminderFr: t.raw("reminderFr") as string,
      reminderAr: t.raw("reminderAr") as string,
    },
  };
}
