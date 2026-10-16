import { getEnv } from "@/db";
import { getViewer } from "@/lib/auth/viewer";

/** Sert les fichiers R2. public/… à tous (cache 1 an) ; private/… aux admins seulement. */
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
  const object = await env.R2.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("X-Content-Type-Options", "nosniff");
  if (key.startsWith("private/")) headers.set("Cache-Control", "private, no-store");
  return new Response(object.body, { headers });
}
