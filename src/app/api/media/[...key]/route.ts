import { getEnv } from "@/db";
import { getViewer } from "@/lib/auth/viewer";
import type { FileMeta } from "@/lib/media";

/** Sert les fichiers stockés (KV). public/… à tous (cache 1 an) ; private/… aux admins seulement. */
export async function GET(_req: Request, ctx: RouteContext<"/api/media/[...key]">) {
  const { key: parts } = await ctx.params;
  const key = parts.join("/");
  if (!/^(public|private)\/[\w./-]+$/.test(key) || key.includes("..")) {
    return new Response("Not found", { status: 404 });
  }
  if (key.startsWith("private/")) {
    const viewer = await getViewer();
    if (viewer?.role !== "admin") return new Response("Forbidden", { status: 403 });
  }
  const env = await getEnv();
  const { value, metadata } = await env.FILES.getWithMetadata<FileMeta>(key, "arrayBuffer");
  if (!value) return new Response("Not found", { status: 404 });
  const headers = new Headers({
    "Content-Type": metadata?.contentType ?? "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    // Nom de fichier unique à chaque envoi : cache d'un an pour les fichiers publics.
    "Cache-Control": key.startsWith("private/")
      ? "private, no-store"
      : "public, max-age=31536000, immutable",
  });
  return new Response(value, { headers });
}
