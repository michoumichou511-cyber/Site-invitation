import { z } from "zod";

export const guestInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^\+?\d{8,15}$/)
    .nullable(),
  groupLabel: z.string().trim().max(60).nullable(),
  maxSeats: z.number().int().min(1).max(50),
  locale: z.enum(["fr", "ar"]).nullable(),
});

export type GuestInput = z.infer<typeof guestInputSchema>;
export type ImportError = {
  line: number;
  reason: "name" | "phone" | "seats" | "lang" | "duplicate";
};

const HEADER = /^(nom|nom complet|name|invités?|guests?|الاسم|اسم)$/i;

/** Téléphone algérien (05…, 06…, 07…, 02…) ou international → format +… ; null si vide ; false si invalide. */
export function normalizePhone(raw: unknown): string | null | false {
  if (raw === null || raw === undefined) return null;
  let s = String(raw).replace(/[\s.\-()]/g, "");
  if (!s) return null;
  // Excel peut avoir mangé le 0 initial (550123456).
  if (/^[5-7]\d{8}$/.test(s)) s = `0${s}`;
  if (/^0[2-7]\d{8}$/.test(s)) return `+213${s.slice(1)}`;
  if (/^00\d{8,15}$/.test(s)) s = `+${s.slice(2)}`;
  if (/^213\d{9}$/.test(s)) s = `+${s}`;
  return /^\+\d{8,15}$/.test(s) ? s : false;
}

/**
 * Lignes d'un fichier Excel/CSV → invités valides + erreurs ligne par ligne.
 * Colonnes : Nom, Téléphone, Groupe, Places, Langue. Une ligne de titre est ignorée.
 */
export function parseGuestRows(
  rows: unknown[][],
  existingNames: string[] = [],
): { valid: GuestInput[]; errors: ImportError[] } {
  const valid: GuestInput[] = [];
  const errors: ImportError[] = [];
  const seen = new Set(existingNames.map((n) => n.trim().toLowerCase()));
  rows.forEach((row, i) => {
    const line = i + 1;
    const cells = row.map((c) => (c === null || c === undefined ? "" : String(c).trim()));
    if (cells.every((c) => !c)) return;
    if (i === 0 && HEADER.test(cells[0] ?? "")) return;
    const [name = "", phoneRaw = "", group = "", seatsRaw = "", langRaw = ""] = cells;
    if (!name) return errors.push({ line, reason: "name" });
    const phone = normalizePhone(phoneRaw);
    if (phone === false) return errors.push({ line, reason: "phone" });
    const seats = seatsRaw === "" ? 1 : Number(seatsRaw);
    if (!Number.isInteger(seats) || seats < 1 || seats > 50)
      return errors.push({ line, reason: "seats" });
    const lang = langRaw.toLowerCase();
    const locale =
      lang === ""
        ? null
        : lang === "fr" || lang.startsWith("fran")
          ? "fr"
          : lang === "ar" || lang.startsWith("arab") || lang === "عربية"
            ? "ar"
            : undefined;
    if (locale === undefined) return errors.push({ line, reason: "lang" });
    const key = name.toLowerCase();
    if (seen.has(key)) return errors.push({ line, reason: "duplicate" });
    seen.add(key);
    valid.push({
      name: name.slice(0, 80),
      phone,
      groupLabel: group.slice(0, 60) || null,
      maxSeats: seats,
      locale,
    });
  });
  return { valid, errors };
}

/** CSV simple (séparateur , ou ; comme Excel en français, guillemets gérés). */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, "");
  const sep =
    (clean.split("\n")[0].match(/;/g)?.length ?? 0) >
    (clean.split("\n")[0].match(/,/g)?.length ?? 0)
      ? ";"
      : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
