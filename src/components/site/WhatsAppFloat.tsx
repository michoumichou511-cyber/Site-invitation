import { useTranslations } from "next-intl";
import { SITE, waLink } from "@/config/site";

/** Petit bouton WhatsApp flottant : en bas, côté fin de ligne, ne cache pas le contenu. */
export function WhatsAppFloat() {
  const c = useTranslations("common");
  return (
    <a
      href={waLink(SITE.whatsapp, c("whatsappMessage"))}
      target="_blank"
      rel="noopener"
      aria-label={c("whatsappUs")}
      className="fixed end-4 bottom-4 z-30 grid size-12 place-items-center rounded-full bg-whatsapp text-white shadow-float ring"
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.6-.1 1.2z" />
      </svg>
    </a>
  );
}
