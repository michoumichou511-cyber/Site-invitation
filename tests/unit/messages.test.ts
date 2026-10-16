import { describe, expect, it } from "vitest";
import fr from "../../messages/fr.json";
import ar from "../../messages/ar.json";

function keys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe("traductions", () => {
  it("fr.json et ar.json ont exactement les mêmes clés", () => {
    expect(keys(ar).sort()).toEqual(keys(fr).sort());
  });

  it("aucun texte vide", () => {
    const empty = [...keys(fr), ...keys(ar)].filter((k) => {
      const get = (o: unknown) => k.split(".").reduce<unknown>((a, p) => (a as never)?.[p], o);
      return get(fr) === "" || get(ar) === "";
    });
    expect(empty).toEqual([]);
  });
});
