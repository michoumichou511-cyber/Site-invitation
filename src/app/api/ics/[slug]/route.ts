import { buildIcs } from "@/invitation/engine/calendar";
import { loadInvitation } from "@/invitation/server/load";

/** Fichier calendrier (.ics) de l'invitation : iPhone, Outlook, Android. */
export async function GET(request: Request, ctx: RouteContext<"/api/ics/[slug]">) {
  const { slug } = await ctx.params;
  const inv = await loadInvitation(slug);
  if (!inv || inv.events.length === 0) return new Response("Not found", { status: 404 });
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang") === "ar" ? "ar" : "fr";
  const { first, second } = inv.config.names;
  const title = {
    fr: [first.fr, second?.fr].filter(Boolean).join(" & "),
    ar: [first.ar, second?.ar].filter(Boolean).join(" و "),
  };
  const ics = buildIcs({
    slug: inv.slug,
    title,
    lang,
    events: inv.events,
    url: `${url.origin}/i/${inv.slug}`,
  });
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${inv.slug}.ics"`,
      "Cache-Control": "private, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  });
}
