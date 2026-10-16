import "server-only";
import { getEnv } from "@/db";

/** Jeton Cloudflare Web Analytics (variable PUBLIC_CF_BEACON_TOKEN), ou null. */
export async function analyticsToken() {
  try {
    return ((await getEnv()) as { PUBLIC_CF_BEACON_TOKEN?: string }).PUBLIC_CF_BEACON_TOKEN || null;
  } catch {
    return null; // pages pré-rendues au build
  }
}
