import type { MetadataRoute } from "next";
import { publicBaseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

/** Invitations, espace client, admin et commande ne sont jamais indexés. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await publicBaseUrl();
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
