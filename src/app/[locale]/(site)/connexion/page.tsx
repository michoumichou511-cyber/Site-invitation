import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MagicLinkForm } from "@/components/account/MagicLinkForm";
import { getViewer } from "@/lib/auth/viewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/connexion">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("loginTitle"), robots: { index: false } };
}

export default async function LoginPage({ params }: PageProps<"/[locale]/connexion">) {
  const { locale } = await params;
  setRequestLocale(locale);
  if ((await getViewer())?.profileId) redirect(`/${locale}/compte`);
  return (
    <main>
      <MagicLinkForm />
    </main>
  );
}
