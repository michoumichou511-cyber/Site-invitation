// Sans 0/O, 1/I/l : lisible à l'oral et sur papier.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** Chaîne aléatoire cryptographique (codes invités : 10 caractères, ~49 bits). */
export function randomCode(length = 10): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

export const GUEST_CODE_RE = /^[a-z2-9]{10}$/;
