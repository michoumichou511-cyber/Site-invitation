import { getTranslations, setRequestLocale } from "next-intl/server";
import { PackForm, type PackInfo } from "@/components/order/PackForm";
import { PACK_IDS } from "@/components/home/Sections";
import { getEnv } from "@/db";
import type { Pack } from "@/lib/orders/pricing";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function PackPage({
  params,
  searchParams,
}: PageProps<"/[locale]/commander/pack">) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("packs");
  const env = await getEnv();
  const packs: PackInfo[] = PACK_IDS.map((id) => ({
    id,
    name: t(`${id}.name`),
    price: t(`${id}.price`),
    delay: t(`${id}.delay`),
    items: t.raw(`${id}.items`) as string[],
  }));
  const initial = PACK_IDS.includes(sp.pack as Pack) ? (sp.pack as Pack) : undefined;
  return (
    <main>
      <PackForm
        packs={packs}
        turnstileSiteKey={env.TURNSTILE_SITE_KEY || null}
        initialPack={initial}
      />
    </main>
  );
}
