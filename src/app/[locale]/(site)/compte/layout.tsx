import { setRequestLocale } from "next-intl/server";
import { ClientMessages } from "@/components/site/ClientMessages";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  setRequestLocale((await params).locale);
  return <ClientMessages namespaces={["account", "order", "events"]}>{children}</ClientMessages>;
}
