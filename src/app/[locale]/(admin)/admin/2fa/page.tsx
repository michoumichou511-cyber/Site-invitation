import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { TwoFactorSetup } from "@/components/admin/TwoFactorSetup";
import { getViewer } from "@/lib/auth/viewer";

export const dynamic = "force-dynamic";

export default async function TwoFactorPage({ params }: PageProps<"/[locale]/admin/2fa">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const viewer = await getViewer();
  if (!viewer || viewer.role !== "admin") redirect(`/${locale}/admin/connexion`);
  if (viewer.twoFactorEnabled) redirect(`/${locale}/admin`);
  return <TwoFactorSetup />;
}
