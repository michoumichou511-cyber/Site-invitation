import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";

export default function AdminLoginPage({ params }: PageProps<"/[locale]/admin/connexion">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <AdminLogin />;
}
