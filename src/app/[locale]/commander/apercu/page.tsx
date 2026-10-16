import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { PreviewClient } from "@/components/order/PreviewClient";
import { invitationDicts } from "@/invitation/server/page";
import { arefRuqaa, pinyonScript } from "../../../fonts";
import "@/invitation/invitation.css";

export const metadata = { robots: { index: false } };

export default function PreviewPage({ params }: PageProps<"/[locale]/commander/apercu">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return (
    <main className={`${pinyonScript.variable} ${arefRuqaa.variable}`}>
      <PreviewClient dicts={invitationDicts} />
    </main>
  );
}
