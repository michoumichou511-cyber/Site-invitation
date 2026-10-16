import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";

/** Site public : en-tête, pied de page, WhatsApp flottant, défilement fluide. */
export default function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  // Chaque layout fixe la langue avant toute traduction (sinon next-intl garde le défaut).
  setRequestLocale(use(params).locale);
  return (
    <>
      <SiteHeader />
      <div id="contenu">{children}</div>
      <SiteFooter />
      <WhatsAppFloat />
      <SmoothScroll />
    </>
  );
}
