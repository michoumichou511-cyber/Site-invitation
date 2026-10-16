import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { LocaleSwitch } from "@/components/site/LocaleSwitch";

export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("home");

  return (
    <main className="mx-auto flex min-h-dvh max-w-site flex-col px-4">
      <header className="flex items-center justify-between py-4">
        <span className="font-display text-2xl text-cedar">{t("brand")}</span>
        <LocaleSwitch />
      </header>
      <section className="flex flex-1 flex-col justify-center gap-6 py-12">
        <h1 className="text-4xl text-cedar md:text-6xl">{t("title")}</h1>
        <p className="max-w-prose text-lg text-ink-soft">{t("subtitle")}</p>
      </section>
    </main>
  );
}
