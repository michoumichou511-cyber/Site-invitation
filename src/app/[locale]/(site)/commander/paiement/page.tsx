import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OrderRecap } from "@/components/order/OrderRecap";
import { PaymentForm } from "@/components/order/PaymentForm";
import { getDb, getEnv } from "@/db";
import { TRACKING_RE } from "@/lib/orders/codes";
import { findOrderByTracking } from "@/lib/orders/lookup";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function PaymentPage({
  params,
  searchParams,
}: PageProps<"/[locale]/commander/paiement">) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const code = typeof sp.code === "string" ? sp.code.toUpperCase() : "";
  if (!TRACKING_RE.test(code)) notFound();
  const found = await findOrderByTracking(await getDb(), code);
  if (!found) notFound();
  const t = await getTranslations("order");
  const env = await getEnv();
  const lang = locale as "fr" | "ar";
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-[28px] text-cedar">{t("payTitle")}</h1>
      <OrderRecap
        code={code}
        templateName={found.template.name[lang]}
        pack={found.order.pack}
        amountDa={found.order.amountDa - found.order.discountDa}
        locale={locale}
      />
      <PaymentForm code={code} turnstileSiteKey={env.TURNSTILE_SITE_KEY || null} />
    </main>
  );
}
