import type { MetadataRoute } from "next";
import { publicBaseUrl } from "@/lib/url";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const PAGES = [
  "",
  "/modeles",
  "/tarifs",
  "/avis",
  "/faq",
  "/contact",
  "/legal/cgv",
  "/legal/confidentialite",
  "/legal/remboursement",
];

/** Pages publiques en fr et ar (avec leurs alternatives de langue) + fiches modèles. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await publicBaseUrl();
  const models = (await getCatalog()).map((m) => `/modeles/${m.slug}`);
  return [...PAGES, ...models].flatMap((path) =>
    (["fr", "ar"] as const).map((lang) => ({
      url: `${base}/${lang}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: { languages: { fr: `${base}/fr${path}`, ar: `${base}/ar${path}` } },
    })),
  );
}
