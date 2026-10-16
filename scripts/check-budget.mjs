/**
 * Budget de performance d'une invitation (CLAUDE.md, bloquant) :
 * JavaScript < 150 Ko compressé, polices < 150 Ko, images du premier écran < 400 Ko.
 *   node scripts/check-budget.mjs http://localhost:8787/i/demo-karakou
 */
import { chromium } from "@playwright/test";
import { gzipSync } from "node:zlib";

const url = process.argv[2] ?? "http://localhost:8787/i/demo-karakou";
const BUDGET = { script: 150, font: 150, image: 400 };
const browser = await chromium.launch(
  process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
);
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
const sizes = { script: 0, font: 0, image: 0 };
page.on("response", async (res) => {
  const type = res.request().resourceType();
  if (!(type in sizes)) return;
  try {
    const body = await res.body();
    // Polices et images sont déjà compressées ; JS : taille gzip.
    sizes[type] += type === "script" ? gzipSync(body).length : body.length;
  } catch {}
});
await page.goto(url, { waitUntil: "networkidle" });
await browser.close();
let ok = true;
for (const [type, max] of Object.entries(BUDGET)) {
  const kb = sizes[type] / 1024;
  const pass = kb <= max;
  ok &&= pass;
  console.log(`${pass ? "✓" : "✗"} ${type.padEnd(6)} ${kb.toFixed(1)} Ko / ${max} Ko`);
}
process.exit(ok ? 0 : 1);
