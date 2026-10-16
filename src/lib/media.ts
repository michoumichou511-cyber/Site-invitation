import "server-only";
import { getEnv } from "@/db";

export type MediaKind = "photo" | "musique" | "recu";

const LIMITS: Record<MediaKind, { maxBytes: number; types: string[] }> = {
  // Photos déjà compressées en WebP (1600 px) dans le navigateur.
  photo: { maxBytes: 2 * 1024 * 1024, types: ["image/webp", "image/jpeg", "image/png"] },
  musique: { maxBytes: 3 * 1024 * 1024, types: ["audio/mpeg"] },
  // Reçu BaridiMob / CCP : photo ou PDF, 5 Mo max.
  recu: {
    maxBytes: 5 * 1024 * 1024,
    types: ["image/webp", "image/jpeg", "image/png", "application/pdf"],
  },
};

const EXT: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
  "audio/mpeg": "mp3",
};

/** Type réel d'après les premiers octets (on ne croit pas l'extension ni le navigateur). */
export function sniffMime(bytes: Uint8Array): string | null {
  const b = bytes;
  const ascii = (from: number, len: number) => String.fromCharCode(...b.slice(from, from + len));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && ascii(1, 3) === "PNG") return "image/png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "image/webp";
  if (ascii(0, 5) === "%PDF-") return "application/pdf";
  if (ascii(0, 3) === "ID3" || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)) return "audio/mpeg";
  return null;
}

export type StoredFile = { key: string; mimeType: string; sizeBytes: number };

/**
 * Vérifie et range un fichier dans R2.
 * - public/… : photos et musiques des invitations, servies avec un cache d'un an.
 * - private/… : reçus de paiement, lisibles par l'admin seulement.
 */
export async function storeFile(file: File, kind: MediaKind, folder: string): Promise<StoredFile> {
  const limit = LIMITS[kind];
  if (file.size === 0 || file.size > limit.maxBytes) throw new MediaError("size");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffMime(bytes.subarray(0, 16));
  if (!mime || !limit.types.includes(mime)) throw new MediaError("type");
  const visibility = kind === "recu" ? "private" : "public";
  const key = `${visibility}/${folder}/${crypto.randomUUID()}.${EXT[mime]}`;
  const env = await getEnv();
  await env.R2.put(key, bytes, {
    httpMetadata: {
      contentType: mime,
      cacheControl:
        visibility === "public" ? "public, max-age=31536000, immutable" : "private, no-store",
    },
  });
  return { key, mimeType: mime, sizeBytes: bytes.byteLength };
}

export async function deleteFiles(keys: string[]) {
  if (keys.length === 0) return;
  const env = await getEnv();
  await env.R2.delete(keys);
}

/** URL publique d'un fichier R2 (servi par /api/media). */
export const mediaUrl = (key: string) => `/api/media/${key}`;

export class MediaError extends Error {
  constructor(public reason: "size" | "type") {
    super(`media:${reason}`);
  }
}
