import { expect, test } from "@playwright/test";

// Démo seedée par `pnpm db:seed:local` (src/invitation/demos.ts).
const OPEN = /Ouvrir l'invitation|افتح الدعوة/;

test.describe("invitation démo Karakou", () => {
  test("s'ouvre, affiche prénoms, date future et hégire (fr)", async ({ page }) => {
    await page.goto("/i/demo-karakou");
    await expect(page.locator("meta[name=robots]")).toHaveAttribute("content", /noindex/);
    await page.getByRole("button", { name: OPEN }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Amine");
    await expect(page.getByText(/Hégire/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Couper le son" })).toBeVisible();
    // Date démo toujours future : le compte à rebours tourne.
    await expect(page.getByRole("timer")).toBeVisible();
  });

  test("RSVP nominatif : places limitées, réponse enregistrée et rappelée (fr)", async ({
    page,
  }) => {
    await page.goto("/i/demo-karakou/karimdemo2");
    await expect(page.getByText("Cher·e Karim,")).toBeVisible();
    await page.getByRole("button", { name: OPEN }).click();
    const rsvp = page.locator("#rsvp");
    await rsvp.scrollIntoViewIfNeeded();
    const change = rsvp.getByRole("button", { name: "Modifier ma réponse" });
    if (await change.isVisible()) await change.click();
    await rsvp.getByRole("button", { name: "Je serai là" }).click();
    const plus = rsvp.getByRole("button", { name: "Une personne de plus" });
    while (await plus.isEnabled()) await plus.click();
    await expect(rsvp.locator("output")).toHaveText("3");
    await expect(rsvp.getByText("Votre invitation est prévue pour 3 personnes")).toBeVisible();
    await rsvp.getByRole("button", { name: "Envoyer ma réponse" }).click();
    await expect(rsvp.getByText("Votre présence (3 personnes) est bien notée.")).toBeVisible();

    // Revenir sur le lien : la réponse est rappelée depuis D1.
    await page.reload();
    await page.getByRole("button", { name: OPEN }).click();
    await expect(
      page.locator("#rsvp").getByText("Merci ! Votre réponse est bien notée."),
    ).toBeVisible();
  });

  test("RSVP en arabe, droite-à-gauche", async ({ page }) => {
    await page.goto("/i/demo-karakou/yaminademo");
    await expect(page.locator(".inv")).toHaveAttribute("dir", "rtl");
    await page.getByRole("button", { name: OPEN }).click();
    const rsvp = page.locator("#rsvp");
    await rsvp.scrollIntoViewIfNeeded();
    const change = rsvp.getByRole("button", { name: "تعديل ردّي" });
    if (await change.isVisible()) await change.click();
    await rsvp.getByRole("button", { name: "لن أتمكّن" }).click();
    await rsvp.getByRole("button", { name: "أرسل ردّي" }).click();
    await expect(rsvp.getByText("تم تسجيل ردّكم. سنفتقدكم.")).toBeVisible();
  });

  test("bascule FR → ع dans l'invitation", async ({ page }) => {
    await page.goto("/i/demo-karakou");
    await page.getByRole("button", { name: OPEN }).click();
    await page.getByRole("button", { name: "ع" }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("أمين");
  });

  test("lien invité inconnu", async ({ page }) => {
    await page.goto("/i/demo-karakou/zzzzzzzzzz");
    await expect(page.getByText(/Ce lien n'est pas valide/)).toBeVisible();
  });
});
