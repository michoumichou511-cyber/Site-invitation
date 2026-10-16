import { getTranslations, setRequestLocale } from "next-intl/server";
import { getDb } from "@/db";
import { VERSES } from "@/invitation/engine/verses";
import { listMusic } from "@/lib/admin/queries";
import { requireAdminPage } from "@/lib/auth/guard";
import { mediaUrl } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function AdminLibrary({ params }: PageProps<"/[locale]/admin/bibliotheque">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage(locale);
  const t = await getTranslations("admin.library");
  const music = await listMusic(await getDb());
  return (
    <div className="space-y-6">
      <h1 className="text-[28px] text-cedar">{t("title")}</h1>
      <section className="space-y-3 rounded-card bg-surface p-5">
        <h2 className="text-xl text-cedar">{t("verses")}</h2>
        <p className="text-sm text-ink-soft">{t("versesHelp")}</p>
        {Object.entries(VERSES).map(([id, v]) => (
          <div key={id} className="border-t border-wall pt-2">
            <p lang="ar" dir="rtl" className="text-lg">
              {v.ar}
            </p>
            <p className="text-sm text-ink-soft">{v.fr}</p>
          </div>
        ))}
      </section>
      <section className="space-y-3 rounded-card bg-surface p-5">
        <h2 className="text-xl text-cedar">{t("music")}</h2>
        {music.length === 0 && <p className="text-ink-soft">{t("noMusic")}</p>}
        {music.map((m) => (
          <audio key={m.id} controls preload="none" src={mediaUrl(m.r2Key)} className="w-full" />
        ))}
      </section>
      <section className="space-y-2 rounded-card bg-surface p-5">
        <h2 className="text-xl text-cedar">{t("fonts")}</h2>
        <p>{t("fontsList")}</p>
      </section>
    </div>
  );
}
