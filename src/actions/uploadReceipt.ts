"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { media, orders, payments } from "@/db/schema";
import { MediaError, storeFile } from "@/lib/media";
import { TRACKING_RE } from "@/lib/orders/codes";
import { customerLocale, findOrderByTracking } from "@/lib/orders/lookup";
import { notifyCustomer, siteUrl } from "@/lib/orders/notify";
import { rateLimit, verifyTurnstile } from "@/lib/security";

export type UploadReceiptResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "notfound" | "state" | "files" | "rate" | "captcha" };

/** Visiteur : envoie le reçu BaridiMob / CCP de sa commande (accès par le code de suivi). */
export async function uploadReceipt(form: FormData): Promise<UploadReceiptResult> {
  if (!(await rateLimit("FORM_LIMITER", "receipt"))) return { ok: false, error: "rate" };
  if (!(await verifyTurnstile(form.get("turnstile") as string | null)))
    return { ok: false, error: "captcha" };
  const code = String(form.get("code") ?? "")
    .trim()
    .toUpperCase();
  const method = form.get("method") === "ccp" ? "ccp" : "baridimob";
  const file = form.get("receipt");
  if (!TRACKING_RE.test(code) || !(file instanceof File)) return { ok: false, error: "invalid" };

  const db = await getDb();
  const found = await findOrderByTracking(db, code);
  if (!found) return { ok: false, error: "notfound" };
  const { order, invitation } = found;
  // Un reçu n'est accepté qu'avant validation (nouvelle commande ou reçu refusé).
  const refused = found.lastPayment?.status === "refuse";
  if (!(order.status === "nouvelle" || (order.status === "paiement_en_attente" && refused))) {
    return { ok: false, error: "state" };
  }

  try {
    const stored = await storeFile(file, "recu", `receipts/${order.id}`);
    await db.batch([
      db.insert(payments).values({
        orderId: order.id,
        method,
        amountDa: order.amountDa - order.discountDa,
        receiptKey: stored.key,
      }),
      db.insert(media).values({
        kind: "recu",
        r2Key: stored.key,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
      }),
      db.update(orders).set({ status: "paiement_en_attente" }).where(eq(orders.id, order.id)),
    ]);
  } catch (e) {
    if (e instanceof MediaError) return { ok: false, error: "files" };
    throw e;
  }

  const locale = customerLocale(invitation.languages);
  await notifyCustomer(
    "receipt",
    { email: order.contactEmail, locale },
    { name: order.contactName, code, url: await siteUrl(`/${locale}/suivi?code=${code}`) },
  );
  return { ok: true };
}
