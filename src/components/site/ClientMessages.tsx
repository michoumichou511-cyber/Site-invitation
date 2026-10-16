import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

/**
 * N'envoie au navigateur que les textes utilisés par les composants client de la
 * section (la page d'accueil n'a pas à porter ceux de l'admin ou de l'assistant).
 */
export async function ClientMessages({
  namespaces,
  children,
}: {
  namespaces: string[];
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages({ locale });
  const picked = Object.fromEntries(
    ["common", ...namespaces].filter((ns) => ns in messages).map((ns) => [ns, messages[ns]]),
  );
  return (
    <NextIntlClientProvider locale={locale} messages={picked}>
      {children}
    </NextIntlClientProvider>
  );
}
