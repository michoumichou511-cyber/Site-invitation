"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { events, invitations, media, orders, templates } from "@/db/schema";
import { hashAccessCode } from "@/invitation/server/access";
import { getThemeEntry } from "@/invitation/themes";
import { MediaError, mediaUrl, storeFile, deleteFiles } from "@/lib/media";
import { invitationSlug, trackingCode } from "@/lib/orders/codes";
import {
  algiersToUtc,
  contactSchema,
  normalizeDzPhone,
  orderDraftSchema,
} from "@/lib/orders/draft";
import { notifyCustomer, siteUrl } from "@/lib/orders/notify";
import { orderAmount, packAllowed, type Pack } from "@/lib/orders/pricing";
import { PACKS } from "@/db/schema";
import { rateLimit, verifyTurnstile } from "@/lib/security";

const SIX_MONTHS = 183 * 86_400_000;

export type CreateOrderResult =
  | { ok: true; trackingCode: string; amountDa: number }
  | { ok: false; error: "invalid" | "template" | "pack" | "files" | "rate" | "captcha" };

/**
 * Visiteur : crée la commande et son invitation (non publiée, avec filigrane) à partir
 * du brouillon de l'assistant. FormData : draft (JSON), contact (JSON), pack, locale,
 * turnstile, photo-0..2 (WebP), music (MP3 facultatif).
 */
export async function createOrder(form: FormData): Promise<CreateOrderResult> {
  if (!(await rateLimit("FORM_LIMITER", "order"))) return { ok: false, error: "rate" };
  if (!(await verifyTurnstile(form.get("turnstile") as string | null)))
    return { ok: false, error: "captcha" };

  let draftJson: unknown;
  let contactJson: unknown;
  try {
    draftJson = JSON.parse(String(form.get("draft")));
    contactJson = JSON.parse(String(form.get("contact")));
  } catch {
    return { ok: false, error: "invalid" };
  }
  const draft = orderDraftSchema.safeParse(draftJson);
  const contact = contactSchema.safeParse(contactJson);
  const pack = String(form.get("pack")) as Pack;
  const locale = form.get("locale") === "ar" ? "ar" : "fr";
  if (!draft.success || !contact.success || !PACKS.includes(pack))
    return { ok: false, error: "invalid" };

  const db = await getDb();
  const template = await db.query.templates.findFirst({
    where: eq(templates.slug, draft.data.templateSlug),
  });
  const entry = template?.isActive ? getThemeEntry(template.slug) : null;
  if (!template || !entry || !template.eventTypes.includes(draft.data.eventType)) {
    return { ok: false, error: "template" };
  }
  if (!packAllowed(pack, template.minPack)) return { ok: false, error: "pack" };

  const orderId = crypto.randomUUID();
  const invitationId = crypto.randomUUID();
  const stored: { key: string; mimeType: string; sizeBytes: number; kind: "photo" | "musique" }[] =
    [];

  try {
    // Photos (déjà compressées en WebP par le navigateur) et musique éventuelle.
    const photos = [0, 1, 2]
      .map((i) => form.get(`photo-${i}`))
      .filter((f): f is File => f instanceof File && f.size > 0);
    const gallery: { src: string; alt: { fr: string; ar: string } }[] = [];
    for (const photo of draft.data.discreet ? [] : photos) {
      const file = await storeFile(photo, "photo", `inv/${invitationId}`);
      stored.push({ ...file, kind: "photo" });
      gallery.push({ src: mediaUrl(file.key), alt: { fr: "", ar: "" } });
    }
    let music: { src: string } | "none" | null = draft.data.music === "none" ? "none" : null;
    const mp3 = form.get("music");
    if (draft.data.music === "upload" && mp3 instanceof File && mp3.size > 0) {
      const file = await storeFile(mp3, "musique", `inv/${invitationId}`);
      stored.push({ ...file, kind: "musique" });
      music = { src: mediaUrl(file.key) };
    }

    const parsed = entry.schema.safeParse({ ...draft.data.config, gallery, music });
    if (!parsed.success) {
      await deleteFiles(stored.map((s) => s.key));
      return { ok: false, error: "invalid" };
    }
    const config = parsed.data;

    const code = trackingCode();
    const amountDa = orderAmount(pack, template.basePriceDa);
    const slug = invitationSlug([config.names.first.fr, config.names.second?.fr ?? ""]);
    const eventRows = draft.data.events.map((e, i) => ({
      invitationId,
      type: e.type,
      title: { fr: e.title.fr, ar: e.title.ar || e.title.fr },
      startsAt: new Date(algiersToUtc(e.date, e.time)),
      venueName: e.venueName || null,
      address: e.address || null,
      mapsUrl: e.mapsUrl || null,
      sortOrder: i,
    }));
    const lastEvent = Math.max(...eventRows.map((e) => e.startsAt.getTime()));

    await db.batch([
      db.insert(orders).values({
        id: orderId,
        trackingCode: code,
        contactName: contact.data.name,
        contactWhatsapp: normalizeDzPhone(contact.data.whatsapp),
        contactEmail: contact.data.email || null,
        templateId: template.id,
        pack,
        amountDa,
        status: "nouvelle",
        source: String(form.get("source") ?? "") || null,
      }),
      db.insert(invitations).values({
        id: invitationId,
        orderId,
        templateId: template.id,
        slug,
        eventType: draft.data.eventType,
        config,
        // La langue du client en premier : elle sert aussi pour ses e-mails.
        languages: [...draft.data.languages].sort((a) => (a === locale ? -1 : 1)),
        discreetMode: draft.data.discreet,
        accessCodeHash: draft.data.accessCode
          ? await hashAccessCode(slug, draft.data.accessCode)
          : null,
        musicKey: stored.find((s) => s.kind === "musique")?.key ?? null,
        expiresAt: new Date(lastEvent + SIX_MONTHS),
      }),
      db.insert(events).values(eventRows),
      ...stored.map((s) =>
        db.insert(media).values({
          invitationId,
          kind: s.kind,
          r2Key: s.key,
          mimeType: s.mimeType,
          sizeBytes: s.sizeBytes,
        }),
      ),
    ]);

    await notifyCustomer(
      "order",
      { email: contact.data.email || null, locale },
      {
        name: contact.data.name,
        code,
        template: template.name[locale],
        pack,
        amount: amountDa,
        url: await siteUrl(`/${locale}/suivi?code=${code}`),
      },
    );
    return { ok: true, trackingCode: code, amountDa };
  } catch (e) {
    await deleteFiles(stored.map((s) => s.key)).catch(() => {});
    if (e instanceof MediaError) return { ok: false, error: "files" };
    throw e;
  }
}
