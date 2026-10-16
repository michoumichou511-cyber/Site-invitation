import { getTranslations, setRequestLocale } from "next-intl/server";
import { waLink } from "@/config/site";
import { getDb } from "@/db";
import { Link } from "@/i18n/navigation";
import { listClients } from "@/lib/admin/queries";
import { requireAdminPage } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export default async function AdminClients({ params }: PageProps<"/[locale]/admin/clients">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage(locale);
  const t = await getTranslations("admin.clients");
  const rows = await listClients(await getDb());
  const fmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ-u-nu-latn" : "fr-FR", {
    dateStyle: "medium",
    timeZone: "Africa/Algiers",
  });
  return (
    <div className="space-y-4">
      <h1 className="text-[28px] text-cedar">{t("title")}</h1>
      {rows.length === 0 && (
        <p className="rounded-card bg-surface p-6 text-ink-soft">{t("empty")}</p>
      )}
      <ul className="space-y-2">
        {rows.map((c) => (
          <li
            key={c.whatsapp}
            className="flex flex-wrap items-center justify-between gap-2 rounded-card bg-surface p-4"
          >
            <span>
              <b>{c.name}</b> · <bdi>{c.whatsapp}</bdi>
              {c.email && (
                <>
                  {" "}
                  · <bdi>{c.email}</bdi>
                </>
              )}
              <span className="block text-sm text-ink-soft">
                {t("orders", { count: c.n })} ·{" "}
                {t("last", { date: fmt.format(new Date(Number(c.last))) })}
              </span>
            </span>
            <span className="flex gap-2">
              <Link
                href={`/admin/commandes/${c.lastId}`}
                className="inline-flex min-h-12 items-center rounded-full border border-sea px-4 font-bold text-sea"
              >
                →
              </Link>
              <a
                href={waLink(c.whatsapp)}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-12 items-center rounded-full bg-whatsapp px-4 font-bold text-white"
              >
                WhatsApp
              </a>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
