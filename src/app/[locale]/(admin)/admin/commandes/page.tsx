import { getTranslations, setRequestLocale } from "next-intl/server";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getDb } from "@/db";
import { ORDER_STATUSES } from "@/db/schema";
import { Link } from "@/i18n/navigation";
import { listOrders } from "@/lib/admin/queries";
import { requireAdminPage } from "@/lib/auth/guard";
import { formatDa } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const isLate = (o: { dueAt: Date | null; status: string }) =>
  Boolean(o.dueAt && o.dueAt.getTime() < Date.now() && ["payee", "en_creation"].includes(o.status));

export default async function AdminOrders({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/commandes">) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  await requireAdminPage(locale);
  const t = await getTranslations("admin.orders");
  const o = await getTranslations("order");
  const status = ORDER_STATUSES.find((s) => s === sp.statut);
  const rows = await listOrders(await getDb(), status);
  const lang = locale as "fr" | "ar";
  const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ-u-nu-latn" : "fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Africa/Algiers",
  });
  return (
    <div className="space-y-4">
      <h1 className="text-[28px] text-cedar">{t("title")}</h1>
      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
        <Link
          href="/admin/commandes"
          className={`flex min-h-12 flex-none items-center rounded-full px-4 ${!status ? "bg-sea text-white" : "bg-surface"}`}
        >
          {t("all")}
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/commandes?statut=${s}`}
            className={`flex min-h-12 flex-none items-center rounded-full px-4 ${status === s ? "bg-sea text-white" : "bg-surface"}`}
          >
            {o(`statuses.${s}`)}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="rounded-card bg-surface p-6 text-ink-soft">{t("empty")}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(({ order, templateName }) => {
            const late = isLate(order);
            return (
              <li key={order.id}>
                <Link
                  href={`/admin/commandes/${order.id}`}
                  className="grid gap-1 rounded-card bg-surface p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <span>
                    <b dir="ltr">{order.trackingCode}</b> · {order.contactName} ·{" "}
                    {templateName[lang]} · {order.pack} · {formatDa(order.amountDa, locale)} DA
                    <span className="block text-sm text-ink-soft">
                      {fmt.format(order.createdAt)}
                      {late && <b className="ms-2 text-danger">{t("late")}</b>}
                    </span>
                  </span>
                  <StatusBadge status={order.status} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
