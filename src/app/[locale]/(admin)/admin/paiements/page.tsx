import { getTranslations, setRequestLocale } from "next-intl/server";
import { PaymentReview } from "@/components/admin/PaymentReview";
import { getDb } from "@/db";
import { Link } from "@/i18n/navigation";
import { pendingPayments, recentPayments } from "@/lib/admin/queries";
import { requireAdminPage } from "@/lib/auth/guard";
import { formatDa } from "@/lib/catalog";
import { mediaUrl } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function AdminPayments({ params }: PageProps<"/[locale]/admin/paiements">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage(locale);
  const t = await getTranslations("admin.payments");
  const db = await getDb();
  const [pending, recent] = await Promise.all([pendingPayments(db), recentPayments(db)]);
  const lang = locale as "fr" | "ar";
  const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ-u-nu-latn" : "fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Algiers",
  });
  return (
    <div className="space-y-6">
      <h1 className="text-[28px] text-cedar">{t("title")}</h1>
      {pending.length === 0 && (
        <p className="rounded-card bg-surface p-6 text-ink-soft">{t("empty")}</p>
      )}
      <ul className="space-y-6">
        {pending.map(({ payment, order, templateName }) => (
          <li
            key={payment.id}
            className="grid gap-4 rounded-card bg-surface p-5 md:grid-cols-2"
            data-testid="payment"
          >
            <div className="space-y-2">
              <Link
                href={`/admin/commandes/${order.id}`}
                className="text-xl font-bold text-sea"
                dir="ltr"
              >
                {order.trackingCode}
              </Link>
              <p>
                {order.contactName} · {templateName[lang]} · {order.pack}
              </p>
              <p className="text-2xl font-bold">
                {t("expected", { amount: formatDa(payment.amountDa, locale) })}
              </p>
              <p className="text-ink-soft">{t("method", { method: payment.method })}</p>
              <p className="text-ink-soft">{t("sent", { date: fmt.format(payment.createdAt) })}</p>
              <PaymentReview paymentId={payment.id} />
            </div>
            {payment.receiptKey &&
              (payment.receiptKey.endsWith(".pdf") ? (
                <a
                  href={mediaUrl(payment.receiptKey)}
                  target="_blank"
                  rel="noopener"
                  className="font-bold text-sea underline"
                >
                  PDF
                </a>
              ) : (
                <a href={mediaUrl(payment.receiptKey)} target="_blank" rel="noopener">
                  {/* eslint-disable-next-line @next/next/no-img-element -- reçu privé servi par /api/media */}
                  <img
                    src={mediaUrl(payment.receiptKey)}
                    alt=""
                    className="max-h-[70vh] w-full rounded-field border border-wall object-contain"
                  />
                </a>
              ))}
          </li>
        ))}
      </ul>
      {recent.length > 0 && (
        <section className="rounded-card bg-surface p-5">
          <h2 className="mb-2 text-xl text-cedar">{t("history")}</h2>
          <ul className="space-y-1 text-sm">
            {recent.map(({ payment, order }) => (
              <li key={payment.id}>
                <span dir="ltr">{order.trackingCode}</span> · {formatDa(payment.amountDa, locale)}{" "}
                DA · <b>{payment.status}</b>
                {payment.refusalReason && ` · ${payment.refusalReason}`}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
