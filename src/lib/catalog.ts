import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/db";
import { orders, reviews, templates, type EVENT_TYPES, type PACKS } from "@/db/schema";

export type CatalogItem = {
  slug: string;
  name: { fr: string; ar: string };
  description: { fr: string; ar: string } | null;
  eventTypes: (typeof EVENT_TYPES)[number][];
  style: string;
  tags: string[];
  previewImage: string;
  basePriceDa: number;
  minPack: (typeof PACKS)[number];
  badges: ("nouveau" | "populaire")[];
  demoSlug: string;
};

/** Modèles actifs du catalogue (lecture publique). */
export const getCatalog = cache(async (): Promise<CatalogItem[]> => {
  const db = await getDb();
  const rows = await db
    .select()
    .from(templates)
    .where(eq(templates.isActive, true))
    .orderBy(asc(templates.sortOrder), asc(templates.createdAt));
  return rows.map((t) => ({
    slug: t.slug,
    name: t.name,
    description: t.description ?? null,
    eventTypes: t.eventTypes,
    style: t.style,
    tags: t.tags,
    previewImage: t.previewImage,
    basePriceDa: t.basePriceDa,
    minPack: t.minPack,
    badges: t.badges,
    demoSlug: `demo-${t.slug}`,
  }));
});

export async function getCatalogItem(slug: string) {
  return (await getCatalog()).find((t) => t.slug === slug) ?? null;
}

export type PublicReview = {
  id: string;
  rating: number;
  text: string | null;
  screenshotKey: string | null;
};

/** Uniquement des avis réels, publiés avec l'accord du client. */
export const getPublishedReviews = cache(async (limit = 12): Promise<PublicReview[]> => {
  const db = await getDb();
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      text: reviews.text,
      screenshotKey: reviews.screenshotKey,
    })
    .from(reviews)
    .innerJoin(orders, eq(orders.id, reviews.orderId))
    .where(and(eq(reviews.isPublished, true), eq(reviews.consentToPublish, true)))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
});

export const formatDa = (amount: number, locale: string) =>
  new Intl.NumberFormat(locale === "ar" ? "ar-DZ-u-nu-latn" : "fr-FR").format(amount);
