import { expect, test } from "@playwright/test";

test("la racine redirige vers /fr", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});

test("la pastille bascule FR → AR en droite-à-gauche, puis revient", async ({ page }) => {
  await page.goto("/fr");
  await page.getByRole("link", { name: "عرض الموقع بالعربية" }).click();
  await expect(page).toHaveURL(/\/ar$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.getByRole("link", { name: "Voir le site en français" }).click();
  await expect(page).toHaveURL(/\/fr$/);
});
