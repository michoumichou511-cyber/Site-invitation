import "server-only";
import { getTranslations } from "next-intl/server";
import { getEnv } from "@/db";
import { sendEmail } from "@/lib/email";

type Kind = "order" | "receipt" | "paid" | "refused" | "delivered";

/** E-mail transactionnel bilingue (dans la langue du client). Silencieux si pas d'adresse. */
export async function notifyCustomer(
  kind: Kind,
  to: { email: string | null; locale: "fr" | "ar" },
  vars: Record<string, string | number>,
) {
  if (!to.email) return;
  const t = await getTranslations({ locale: to.locale, namespace: "emails" });
  const text = t(`${kind}Body`, vars);
  const html = `<div dir="${to.locale === "ar" ? "rtl" : "ltr"}" style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6">${escapeHtml(text).replace(/\n/g, "<br>")}</div>`;
  try {
    await sendEmail({ to: to.email, subject: t(`${kind}Subject`, vars), text, html });
  } catch (e) {
    // Un e-mail en échec ne doit jamais bloquer la commande.
    console.error("notifyCustomer", kind, e);
  }
}

export async function siteUrl(path = "") {
  const env = await getEnv();
  return `${env.PUBLIC_SITE_URL.replace(/\/$/, "")}${path}`;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
