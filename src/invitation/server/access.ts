import "server-only";

export const ACCESS_COOKIE = (slug: string) => `inv_access_${slug}`;

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Hachage du code d'accès d'une invitation (lié au slug). */
export const hashAccessCode = (slug: string, code: string) =>
  sha256(`${slug}:${code.trim().toLowerCase()}`);

/** Valeur du cookie posée après un bon code : dérivée du hachage, jamais le code lui-même. */
export const accessToken = (hash: string) => sha256(`cookie:${hash}`);
