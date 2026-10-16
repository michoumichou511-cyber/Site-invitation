import { expect, test } from "@playwright/test";

const PAGES = [
  "",
  "/modeles",
  "/modeles/c/mariage",
  "/modeles/karakou",
  "/tarifs",
  "/avis",
  "/faq",
  "/contact",
  "/legal/cgv",
  "/legal/confidentialite",
  "/legal/remboursement",
];

for (const locale of ["fr", "ar"] as const) {
  test(`toutes les pages publiques existent en ${locale}`, async ({ page }) => {
    for (const path of PAGES) {
      const res = await page.goto(`/${locale}${path}`);
      expect(res?.status(), path).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
      await expect(page.locator("h1").first()).toBeVisible();
      // Le titre est bien dans la langue de l'URL.
      const h1 = (await page.locator("h1").first().textContent()) ?? "";
      expect(/[\u0600-\u06FF]/.test(h1), `${path} : ${h1}`).toBe(locale === "ar");
      // Aucun défilement horizontal à 375 px.
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
}

test("accueil → catalogue → fiche modèle → démo", async ({ page }) => {
  await page.goto("/fr");
  await page.getByRole("link", { name: "Voir les modèles" }).first().click();
  await expect(page).toHaveURL(/\/fr\/modeles$/);
  await page.locator('main a[href="/fr/modeles/karakou"]').first().click();
  await expect(page).toHaveURL(/\/fr\/modeles\/karakou$/);
  await expect(page.getByRole("link", { name: "Personnaliser ce modèle" })).toHaveAttribute(
    "href",
    "/fr/commander?modele=karakou",
  );
  const demo = page.frameLocator("iframe");
  await expect(demo.getByRole("button", { name: "Ouvrir l'invitation" })).toBeVisible();
});

test("la démo plein écran redirige vers l'invitation démo", async ({ page }) => {
  await page.goto("/demo/karakou");
  await expect(page).toHaveURL(/\/i\/demo-karakou$/);
});

test("version sans animation (reduced-motion) : tout le contenu reste lisible", async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 375, height: 812 },
  });
  const page = await ctx.newPage();
  await page.goto("/fr");
  await expect(page.getByRole("heading", { name: "Trois étapes, livré en 24 h" })).toBeVisible();
  await ctx.close();
});
