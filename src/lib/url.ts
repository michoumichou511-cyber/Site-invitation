import "server-only";
import { headers } from "next/headers";
import { getEnv } from "@/db";

/**
 * Adresse publique du site, sans « / » final : PUBLIC_SITE_URL si elle est définie,
 * sinon l'adresse de la requête (ex. https://louloua.xxx.workers.dev avant le domaine).
 */
export async function publicBaseUrl() {
  try {
    const configured = (await getEnv()).PUBLIC_SITE_URL;
    if (configured) return configured.replace(/\/$/, "");
  } catch {
    // Pré-rendu au build : pas de contexte Cloudflare.
  }
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host)
      return `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`;
  } catch {
    // Hors requête.
  }
  return "http://localhost:3000";
}
