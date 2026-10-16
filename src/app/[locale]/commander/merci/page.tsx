import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE, waLink } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { TRACKING_RE } from "@/lib/orders/codes";

export const metadata = { robots: { index: false } };

export default async function ThanksPage({
  params,
  searchParams,
}: PageProps<"/[locale]/commander/merci">) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("order");
  const code = typeof sp.code === "string" && TRACKING_RE.test(sp.code) ? sp.code : "";
  return (
    <main className="mx-auto max-w-xl space-y-6 px-4 py-12 text-center">
      <h1 className="text-[32px] text-cedar">{t("thanksTitle")}</h1>
      <p className="text-lg">{t("thanksText")}</p>
      {code && (
        <div className="rounded-card bg-surface p-5">
          <p className="text-ink-soft">{t("thanksCode")}</p>
          <p className="mt-1 text-3xl font-bold tracking-wider text-sea" dir="ltr">
            {code}
          </p>
        </div>
      )}
      <div className="flex flex-col gap-3">
        <Link
          href={`/suivi?code=${code}`}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-sea px-6 font-bold text-white"
        >
          {t("thanksTrack")}
        </Link>
        <a
          href={waLink(SITE.whatsapp, t("thanksWhatsappMsg", { code }))}
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-whatsapp px-6 font-bold text-white"
        >
          {t("thanksWhatsapp")}
        </a>
      </div>
    </main>
  );
}
