import type { MetadataRoute } from "next";
import { getEnv } from "@/db";

export const dynamic = "force-dynamic";

/** Invitations, espace client, admin et commande ne sont jamais indexés. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = (await getEnv()).PUBLIC_SITE_URL.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /i/ reste accessible : noindex sur chaque invitation, et WhatsApp doit lire l'aperçu.
      disallow: [
        "/api/",
        "/fr/admin",
        "/ar/admin",
        "/fr/compte",
        "/ar/compte",
        "/fr/commander",
        "/ar/commander",
        "/fr/suivi",
        "/ar/suivi",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
