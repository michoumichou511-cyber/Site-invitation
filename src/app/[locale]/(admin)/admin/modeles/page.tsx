import { asc } from "drizzle-orm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TemplateRow } from "@/components/admin/TemplateRow";
import { getDb } from "@/db";
import { templates } from "@/db/schema";
import { requireAdminPage } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export default async function AdminTemplates({ params }: PageProps<"/[locale]/admin/modeles">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage(locale);
  const t = await getTranslations("admin.templates");
  const rows = await (await getDb()).select().from(templates).orderBy(asc(templates.sortOrder));
  const lang = locale as "fr" | "ar";
  return (
    <div className="space-y-4">
      <h1 className="text-[28px] text-cedar">{t("title")}</h1>
      {rows.map((r) => (
        <TemplateRow
          key={r.id}
          tpl={{
            id: r.id,
            slug: r.slug,
            name: r.name[lang],
            isActive: r.isActive,
            basePriceDa: r.basePriceDa,
            sortOrder: r.sortOrder,
            badges: r.badges,
          }}
        />
      ))}
    </div>
  );
}
