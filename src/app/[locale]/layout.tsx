import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { getEnv } from "@/db";
import { localeDir, routing } from "@/i18n/routing";
import { marcellus, reemKufi, tajawal } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

const CLIENT_NAMESPACES = ["common", "order", "events", "account", "admin"];

export const viewport: Viewport = {
  themeColor: "#EDEAE4",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  let base = "http://localhost:3000";
  try {
    base = (await getEnv()).PUBLIC_SITE_URL;
  } catch {
    // Pages pré-rendues au build : pas de contexte Cloudflare.
  }
  return {
    metadataBase: new URL(base),
    title: { default: t("title"), template: `%s · ${t("brand")}` },
    description: t("description"),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  // Seuls les textes utilisés par des composants client partent dans le navigateur.
  const messages = await getMessages({ locale });
  const clientMessages = Object.fromEntries(
    CLIENT_NAMESPACES.filter((ns) => ns in messages).map((ns) => [ns, messages[ns]]),
  );

  return (
    <html
      lang={locale}
      dir={localeDir(locale)}
      className={`${marcellus.variable} ${tajawal.variable} ${reemKufi.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
