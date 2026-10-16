import { getTranslations } from "next-intl/server";
import { SITE } from "@/config/site";
import { formatDa } from "@/lib/catalog";
import { CopyButton } from "./PaymentForm";

/** Récapitulatif + coordonnées de paiement avec boutons copier. */
export async function OrderRecap({
  code,
  templateName,
  pack,
  amountDa,
  locale,
}: {
  code: string;
  templateName: string;
  pack: string;
  amountDa: number;
  locale: string;
}) {
  const t = await getTranslations("order");
  const p = await getTranslations("packs");
  const rows: [string, string, boolean][] = [
    [t("code"), code, true],
    [t("model"), templateName, false],
    [t("pack"), p(`${pack}.name`), false],
    [t("amount"), `${formatDa(amountDa, locale)} DA`, true],
  ];
  const payRows: [string, string][] = [
    [t("ccp"), SITE.payment.ccpAccount],
    [t("ccpName"), SITE.payment.ccpName],
    [t("rip"), SITE.payment.rip],
    [t("baridimob"), SITE.payment.baridimob],
  ];
  return (
    <div className="space-y-6">
      <section className="rounded-card bg-surface p-5">
        <h2 className="mb-3 text-xl text-cedar">{t("recap")}</h2>
        <dl className="divide-y divide-wall">
          {rows.map(([k, v, strong]) => (
            <div key={k} className="flex justify-between gap-4 py-2">
              <dt className="text-ink-soft">{k}</dt>
              <dd className={strong ? "font-bold" : ""}>
                <bdi>{v}</bdi>
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="rounded-card border border-brass bg-surface p-5">
        <p className="mb-3">{t("payHow")}</p>
        <dl className="space-y-3">
          {payRows.map(([k, v]) => (
            <div key={k} className="flex flex-wrap items-center justify-between gap-2">
              <dt className="w-full text-sm text-ink-soft">{k}</dt>
              <dd className="font-bold" dir="ltr">
                {v}
              </dd>
              <CopyButton value={v} />
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
