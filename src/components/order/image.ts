"use client";

/**
 * Compresse une photo dans le navigateur : WebP, 1600 px maximum, métadonnées (GPS)
 * supprimées puisqu'on redessine les pixels sur un canvas.
 */
export async function compressPhoto(file: File, maxSide = 1600, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  let out = canvas.toDataURL("image/webp", quality);
  // Safari ancien : pas d'encodeur WebP → JPEG.
  if (!out.startsWith("data:image/webp")) out = canvas.toDataURL("image/jpeg", quality);
  return out;
}
