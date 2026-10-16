import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OrderActions } from "@/components/admin/OrderActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { waLink } from "@/config/site";
import { getDb } from "@/db";
import { Link } from "@/i18n/navigation";
import { orderDetail } from "@/lib/admin/queries";
import { requireAdminPage } from "@/lib/auth/guard";
import { formatDa } from "@/lib/catalog";
import { mediaUrl } from "@/lib/media";
import { NEXT_STATUSES } from "@/lib/orders/status";

export const dynamic = "force-dynamic";

export default async function AdminOrderPage({
  params,
}: PageProps<"/[locale]/admin/commandes/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireAdminPage(locale);
  const d = await orderDetail(await getDb(), id);
  if (!d) notFound();
  const t = await getTranslations("admin");
  const o = await getTranslations("order");
  const lang = locale as "fr" | "ar";
  const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ-u-nu-latn" : "fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Algiers",
  });
  const { order, invitation, template } = d;
  return (
    <div className="space-y-6">
      <Link href="/admin/commandes" className="font-bold text-sea">
        ← {t("order.back")}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[28px] text-cedar" dir="ltr">
          {order.trackingCode}
        </h1>
        <StatusBadge status={order.status} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="space-y-2 rounded-card bg-surface p-5">
            <h2 className="text-xl text-cedar">{t("order.contact")}</h2>
            <p className="font-bold">{order.contactName}</p>
            <p dir="ltr">{order.contactWhatsapp}</p>
            {order.contactEmail && <p dir="ltr">{order.contactEmail}</p>}
            <a
              href={waLink(order.contactWhatsapp)}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-12 items-center rounded-full bg-whatsapp px-4 font-bold text-white"
            >
              {t("order.whatsapp")}
            </a>
            <p className="text-sm text-ink-soft">
              {d.assignee
                ? t("order.assignedTo", { name: d.assignee.fullName })
                : t("order.notAssigned")}
            </p>
          </section>
          <section className="space-y-2 rounded-card bg-surface p-5">
            <h2 className="text-xl text-cedar">{t("order.invitation")}</h2>
            <p>
              {template.name[lang]} · {o(`statuses.${order.status}`)} · {order.pack} ·{" "}
              {formatDa(order.amountDa, locale)} DA
            </p>
            <p className={invitation.isPublished ? "text-zellige" : "text-ink-soft"}>
              {invitation.isPublished ? t("order.published") : t("order.unpublished")}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`/i/${invitation.slug}`}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-12 items-center rounded-full border border-sea px-4 font-bold text-sea"
              >
                {t("order.preview")}
              </a>
              <Link
                href={`/compte/invitations/${invitation.id}`}
                className="inline-flex min-h-12 items-center rounded-full border border-sea px-4 font-bold text-sea"
              >
                {t("order.edit")}
              </Link>
            </div>
          </section>
          <section className="space-y-3 rounded-card bg-surface p-5">
            <h2 className="text-xl text-cedar">{t("order.payments")}</h2>
            {d.payments.length === 0 && <p className="text-ink-soft">{t("order.noPayments")}</p>}
            {d.payments.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 border-t border-wall pt-2"
              >
                <span>
                  {fmt.format(p.createdAt)} · {p.method} · {formatDa(p.amountDa, locale)} DA ·{" "}
                  <b>{p.status}</b>
                  {p.refusalReason && (
                    <span className="block text-sm text-danger">{p.refusalReason}</span>
                  )}
                </span>
                {p.receiptKey && (
                  <a
                    href={mediaUrl(p.receiptKey)}
                    target="_blank"
                    rel="noopener"
                    className="font-bold text-sea underline"
                  >
                    {t("order.receipt")}
                  </a>
                )}
              </div>
            ))}
          </section>
        </div>
        <div className="space-y-6">
          <section className="rounded-card bg-surface p-5">
            <OrderActions
              orderId={order.id}
              status={order.status}
              nextStatuses={NEXT_STATUSES[order.status]}
              notes={order.internalNotes ?? ""}
              canPublish={["payee", "en_creation", "livree"].includes(order.status)}
              published={invitation.isPublished}
            />
          </section>
          <section className="rounded-card bg-surface p-5">
            <h2 className="mb-2 text-xl text-cedar">{t("order.history")}</h2>
            <ul className="space-y-1 text-sm">
              {d.history.map(({ log, actor }) => (
                <li key={log.id}>
                  {fmt.format(log.createdAt)} · {actor ?? "—"} ·{" "}
                  {t.has(`actions.${log.action.replace(".", "_")}`)
                    ? t(`actions.${log.action.replace(".", "_")}`)
                    : log.action}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
