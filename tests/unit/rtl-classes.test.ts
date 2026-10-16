import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// CLAUDE.md : propriétés logiques seulement (ms-, me-, ps-, pe-, start-, end-).
const FORBIDDEN =
  /(?<![\w-])-?(?:ml|mr|pl|pr|left|right|rounded-l|rounded-r|border-l|border-r)-[\w[\]./%-]+/g;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : /\.(tsx|ts)$/.test(name) ? [path] : [];
  });
}

describe("règle RTL", () => {
  it("aucune classe Tailwind physique gauche/droite dans src/", () => {
    const offenders: string[] = [];
    for (const file of files("src")) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
        const classes = match[1] ?? match[2] ?? "";
        const bad = classes.match(FORBIDDEN);
        if (bad) offenders.push(`${file}: ${bad.join(", ")}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
