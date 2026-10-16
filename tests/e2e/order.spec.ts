import { expect, test } from "@playwright/test";
import { fillWizard, orderToPayment, sendReceipt } from "./helpers";

test("commande : assistant → aperçu avec filigrane → pack → reçu → suivi", async ({ page }) => {
  await fillWizard(page);
  // Aperçu : vraie invitation avec filigrane, RSVP désactivé.
  await page.getByRole("button", { name: "Ouvrir l'invitation" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /Yacine/ })).toBeVisible();
  await expect(page.locator(".inv-watermark")).toHaveText("Aperçu");
  await expect(
    page.getByText("Aperçu : les réponses s'ouvriront à la publication."),
  ).toBeAttached();

  const code = await orderToPayment(page);
  await expect(page.getByText("5 000 DA")).toBeVisible();
  await sendReceipt(page);
  await expect(page).toHaveURL(/\/commander\/merci/);
  await expect(page.getByText("Reçu bien reçu. Nous le vérifions sous 2 h.")).toBeVisible();
  await expect(page.getByText(code)).toBeVisible();

  await page.getByRole("main").getByRole("link", { name: "Suivre ma commande" }).click();
  await expect(page.getByText("Reçu en cours de vérification (sous 2 h).")).toBeVisible();
  await expect(page.locator("[aria-current=step]")).toHaveText("Paiement en attente");
});

test("le brouillon est gardé si on recharge la page", async ({ page }) => {
  await page.goto("/fr/commander?modele=karakou");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Suivant" }).click();
  await page.getByRole("group", { name: "Premier prénom" }).getByLabel("En français").fill("Lina");
  await page.reload();
  await page.getByRole("button", { name: "Suivant" }).click();
  await expect(
    page.getByRole("group", { name: "Premier prénom" }).getByLabel("En français"),
  ).toHaveValue("Lina");
});

test("suivi : code inconnu", async ({ page }) => {
  await page.goto("/fr/suivi?code=LLA-AAAAAA");
  await expect(page.getByText("Aucune commande avec ce code.")).toBeVisible();
});
