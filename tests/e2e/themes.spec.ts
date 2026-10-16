import { expect, test } from "@playwright/test";

const THEMES = ["karakou", "zellige-tlemcen", "casbah", "bijoux-kabyles", "ciel", "baie-alger"];
const OPEN = /Ouvrir l'invitation|افتح الدعوة/;

for (const slug of THEMES) {
  for (const lang of ["fr", "ar"] as const) {
    test(`modèle ${slug} (${lang}) : s'ouvre, date future, RSVP`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(`/i/demo-${slug}?lang=${lang}`);
      await expect(page.locator(".inv")).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr");
      await page.getByRole("button", { name: OPEN }).click();
      // L'écran d'ouverture disparaît vraiment (il ne doit plus couvrir l'invitation).
      await expect(page.locator(".env-intro")).toBeHidden({ timeout: 5000 });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("timer")).toBeVisible();
      await expect(page.locator("#rsvp form")).toBeAttached();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }
}

test("anniversaire Ciel : on souffle la bougie", async ({ page }) => {
  await page.goto("/i/demo-ciel");
  await page.getByRole("button", { name: OPEN }).click();
  const candle = page.getByRole("button", { name: "Touchez la flamme pour souffler la bougie" });
  // Au centre de l'écran : la barre « Je confirme » est collée en bas.
  await candle.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await candle.click();
  await expect(page.getByText("Vœu envoyé ! Joyeux anniversaire !")).toBeVisible();
});
