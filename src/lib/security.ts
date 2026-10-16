import "server-only";
import { headers } from "next/headers";
import { getEnv } from "@/db";

export async function clientIp() {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

/**
 * Limite de requêtes Cloudflare (binding ratelimits). Sans binding (tests), tout passe.
 * Renvoie true si la requête est autorisée.
 */
export async function rateLimit(kind: "RSVP_LIMITER" | "FORM_LIMITER", action = "") {
  const env = await getEnv();
  const limiter = env[kind] as RateLimit | undefined;
  if (!limiter?.limit) return true;
  // Compteur séparé par action : suivre sa commande ne bloque pas l'envoi du reçu.
  const { success } = await limiter.limit({ key: `${action}:${await clientIp()}` });
  return success;
}

/** Vérifie un jeton Turnstile côté serveur. Sans clé secrète configurée, la vérification est ignorée. */
export async function verifyTurnstile(token: string | null | undefined) {
  const env = await getEnv();
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  const body = new FormData();
  body.append("secret", env.TURNSTILE_SECRET_KEY);
  body.append("response", token);
  body.append("remoteip", await clientIp());
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}
