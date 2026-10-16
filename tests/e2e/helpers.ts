import { expect, type Page } from "@playwright/test";

/** Remplit l'assistant de commande (6 étapes) jusqu'à l'aperçu. */
export async function fillWizard(page: Page, names = { first: "Yacine", second: "Nour" }) {
  await page.goto("/fr/commander?modele=karakou");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // 1. Événement + modèle
  await page.getByText("Mariage", { exact: true }).click();
  await page.getByRole("button", { name: "Suivant" }).click();
  // 2. Noms
  await page
    .getByRole("group", { name: "Premier prénom" })
    .getByLabel("En français")
    .fill(names.first);
  await page
    .getByRole("group", { name: "Second prénom" })
    .getByLabel("En français")
    .fill(names.second);
  await page.getByRole("button", { name: "Suivant" }).click();
  // 3. Dates et lieux
  await page.getByLabel("Salle ou lieu").fill("Salle Les Oliviers");
  await page.getByLabel("Adresse").fill("Bab Ezzouar, Alger");
  await expect(page.getByText(/Hégire :/)).toBeVisible();
  await page.getByRole("button", { name: "Suivant" }).click();
  // 4. Textes
  await page.getByRole("button", { name: "Suivant" }).click();
  // 5. Photos et musique
  await page
    .locator('input[type=file][accept="image/*"]')
    .setInputFiles("tests/fixtures/photo.jpg");
  await expect(page.locator('img[src^="data:image/"]')).toHaveCount(1);
  await page.getByRole("button", { name: "Suivant" }).click();
  // 6. Options
  await page.getByRole("button", { name: "Voir l'aperçu" }).click();
  await expect(page).toHaveURL(/\/fr\/commander\/apercu$/);
}

export async function orderToPayment(page: Page, pack = "Premium") {
  await page.getByRole("link", { name: "Choisir mon pack" }).click();
  await expect(page).toHaveURL(/\/commander\/pack$/);
  await page.getByText(pack, { exact: true }).click();
  await page.getByLabel("Votre nom").fill("Nour Haddad");
  await page.getByLabel("Numéro WhatsApp").fill("0550 12 34 56");
  await page.getByLabel(/J'accepte les conditions/).check();
  await page.getByRole("button", { name: "Valider ma commande" }).click();
  await expect(page).toHaveURL(/\/commander\/paiement\?code=LLA-/, { timeout: 15_000 });
  return new URL(page.url()).searchParams.get("code")!;
}

export async function sendReceipt(page: Page) {
  await page.getByLabel(/Photo ou PDF du reçu/).setInputFiles("tests/fixtures/recu.png");
  await page.getByRole("button", { name: "Envoyer mon reçu" }).click();
}
