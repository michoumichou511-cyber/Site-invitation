import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { trackOrder } from "@/actions/trackOrder";
import { PaymentForm } from "@/components/order/PaymentForm";
import { OrderRecap } from "@/components/order/OrderRecap";
import { getEnv } from "@/db";
import { TRACK_STEPS } from "@/lib/orders/status";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/suivi">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "order" });
  return { title: t("trackTitle"), robots: { index: false } };
}

/** Suivi par code : marche sans JavaScript (formulaire GET). */
export default async function TrackPage({ params, searchParams }: PageProps<"/[locale]/suivi">) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("order");
  const code = typeof sp.code === "string" ? sp.code : "";
  const order = code ? await trackOrder(code) : null;
  const lang = locale as "fr" | "ar";
  const env = await getEnv();
  const fmt = (ms: number) =>
    new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ-u-nu-latn" : "fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Africa/Algiers",
    }).format(ms);
  const current = order ? TRACK_STEPS.indexOf(order.status) : -1;
  const refused = order?.payment?.status === "refuse";

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-[28px] text-cedar">{t("trackTitle")}</h1>
      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label htmlFor="code" className="block font-bold">
            {t("code")}
          </label>
          <input
            id="code"
            name="code"
            defaultValue={code}
            dir="ltr"
            autoCapitalize="characters"
            placeholder="LLA-7K2Q9M"
            className="block min-h-12 w-full rounded-field border border-wall bg-surface px-3 uppercase"
            aria-describedby="code-help"
          />
          <p id="code-help" className="text-sm text-ink-soft">
            {t("trackHelp")}
          </p>
        </div>
        <button
          type="submit"
          className="mb-7 inline-flex min-h-12 items-center rounded-full bg-sea px-6 font-bold text-white"
        >
          {t("trackSubmit")}
        </button>
      </form>

      {code && !order && (
        <p role="alert" className="rounded-field bg-danger/10 p-3 text-danger">
          {t("trackNotFound")}
        </p>
      )}

      {order && (
        <section className="space-y-5" aria-live="polite">
          {order.status === "annulee" ? (
            <p className="rounded-card bg-surface p-4 font-bold">{t("statuses.annulee")}</p>
          ) : (
            <ol className="space-y-2">
              {TRACK_STEPS.map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`grid size-8 place-items-center rounded-full text-sm font-bold ${i <= current ? "bg-zellige text-white" : "bg-wall text-ink-soft"}`}
                  >
                    {i < current ? "✓" : i + 1}
                  </span>
                  <span
                    className={i === current ? "font-bold" : "text-ink-soft"}
                    aria-current={i === current ? "step" : undefined}
                  >
                    {t(`statuses.${s}`)}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {refused && (
            <div className="rounded-card border border-danger bg-danger/10 p-4">
              <p className="font-bold text-danger">{t("refused")}</p>
              {order.payment?.refusalReason && (
                <p>{t("refusedReason", { reason: order.payment.refusalReason })}</p>
              )}
            </div>
          )}
          {order.status === "paiement_en_attente" && !refused && (
            <p className="rounded-card bg-surface p-4">{t("checking")}</p>
          )}
          {order.dueAt && order.status !== "livree" && (
            <p>{t("due", { date: fmt(order.dueAt) })}</p>
          )}
          {order.invitationUrl && (
            <a
              href={order.invitationUrl}
              className="inline-flex min-h-12 items-center rounded-full bg-sea px-6 font-bold text-white"
            >
              {t("seeInvitation")}
            </a>
          )}
          {order.canUploadReceipt && (
            <>
              <OrderRecap
                code={order.code}
                templateName={order.templateName[lang]}
                pack={order.pack}
                amountDa={order.amountDa}
                locale={locale}
              />
              {refused && <h2 className="text-xl text-cedar">{t("resend")}</h2>}
              <PaymentForm code={order.code} turnstileSiteKey={env.TURNSTILE_SITE_KEY || null} />
            </>
          )}
        </section>
      )}
    </main>
  );
}
