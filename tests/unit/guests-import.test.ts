import { describe, expect, it } from "vitest";
import { normalizePhone, parseCsv, parseGuestRows } from "@/lib/guests/import";

describe("téléphones", () => {
  it("formats algériens", () => {
    expect(normalizePhone("0550 12 34 56")).toBe("+213550123456");
    expect(normalizePhone("550123456")).toBe("+213550123456");
    expect(normalizePhone("+213 661-12-34-56")).toBe("+213661123456");
    expect(normalizePhone("00213770123456")).toBe("+213770123456");
    expect(normalizePhone("+33612345678")).toBe("+33612345678");
  });
  it("vide ou invalide", () => {
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("12")).toBe(false);
  });
});

describe("import des invités", () => {
  it("ignore la ligne de titre, valide les lignes, signale les erreurs", () => {
    const { valid, errors } = parseGuestRows(
      [
        ["Nom", "Téléphone", "Groupe", "Places", "Langue"],
        ["Karim Benali", "0550123456", "Amis", 3, "fr"],
        ["", "0550123456"],
        ["Yamina", "abc"],
        ["Sofiane", "", "", 99],
        ["Nadia", "", "", "", "es"],
        ["karim benali"],
        ["عمي محمد", "0661 00 00 00", "عائلة العريس", "2", "ar"],
      ],
      [],
    );
    expect(valid.map((g) => g.name)).toEqual(["Karim Benali", "عمي محمد"]);
    expect(valid[0]).toMatchObject({
      phone: "+213550123456",
      groupLabel: "Amis",
      maxSeats: 3,
      locale: "fr",
    });
    expect(errors).toEqual([
      { line: 3, reason: "name" },
      { line: 4, reason: "phone" },
      { line: 5, reason: "seats" },
      { line: 6, reason: "lang" },
      { line: 7, reason: "duplicate" },
    ]);
  });

  it("300 lignes en moins de 50 ms", () => {
    const rows = Array.from({ length: 300 }, (_, i) => [
      `Invité ${i}`,
      `0550${String(i).padStart(6, "0")}`,
      "Amis",
      2,
    ]);
    const t = performance.now();
    const { valid } = parseGuestRows(rows);
    expect(valid).toHaveLength(300);
    expect(performance.now() - t).toBeLessThan(50);
  });

  it("CSV Excel français (point-virgule, guillemets)", () => {
    expect(parseCsv('Nom;Téléphone\n"Benali; Karim";0550123456\r\nSara;\n')).toEqual([
      ["Nom", "Téléphone"],
      ["Benali; Karim", "0550123456"],
      ["Sara", ""],
    ]);
  });
});
