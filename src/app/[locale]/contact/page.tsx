import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { SITE, waLink } from "@/config/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("lead") };
}

export default function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <ContactContent />;
}

async function ContactContent() {
  const t = await getTranslations("contact");
  const c = await getTranslations("common");
  const links = [
    [t("whatsapp"), waLink(SITE.whatsapp, c("whatsappMessage")), `+${SITE.whatsapp}`],
    [t("email"), `mailto:${SITE.email}`, SITE.email],
    [t("instagram"), SITE.instagram, "Instagram"],
    [t("tiktok"), SITE.tiktok, "TikTok"],
  ];
  return (
    <main className="mx-auto max-w-site px-4 py-10">
      <h1 className="text-[36px] text-cedar md:text-[56px]">{t("title")}</h1>
      <p className="mt-2 max-w-prose text-ink-soft">{t("lead")}</p>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {links.map(([label, href, value]) => (
          <li key={label}>
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener"
              className="flex min-h-16 flex-col justify-center rounded-card border border-wall bg-surface p-5"
            >
              <span className="text-sm text-ink-soft">{label}</span>
              <bdi className="font-bold text-sea">{value}</bdi>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-ink-soft">{t("hours")}</p>
    </main>
  );
}
