import { expect, test } from "@playwright/test";
import { adminLogin, visitorOrder } from "./admin-helpers";
import { sendReceipt } from "./helpers";

test.describe.configure({ mode: "serial", timeout: 120_000 });

test("une commande va de l'accueil à « Livrée » sans toucher à la base", async ({
  page,
  browser,
}) => {
  const code = await visitorOrder(page);

  const admin = await adminLogin(browser);
  await admin.getByRole("link", { name: /paiement.* à vérifier/ }).click();
  const card = admin.getByTestId("payment").filter({ hasText: code });
  await expect(card.getByText("Montant attendu : 5 000 DA")).toBeVisible();
  await card.getByRole("button", { name: "Valider" }).click();
  await expect(admin.getByTestId("payment").filter({ hasText: code })).toHaveCount(0, {
    timeout: 20_000,
  });

  await admin.getByRole("link", { name: "Commandes" }).click();
  await admin.getByRole("link", { name: new RegExp(code) }).click();
  await expect(admin.getByText("Payée").first()).toBeVisible();
  await admin.getByRole("button", { name: "Publier l'invitation" }).click();
  await expect(admin.getByText("Invitation publiée.")).toBeVisible({ timeout: 20_000 });
  await expect(
    admin.getByRole("link", { name: "Envoyer les liens au client sur WhatsApp" }),
  ).toHaveAttribute("href", /wa\.me\/213550123456/);
  await expect(admin.getByRole("img", { name: "QR code de l'invitation" })).toBeVisible();

  // Côté client : statut « Livrée » et invitation publiée, sans filigrane, RSVP ouvert.
  await page.goto(`/fr/suivi?code=${code}`);
  await expect(page.locator("[aria-current=step]")).toHaveText("Livrée");
  await page.getByRole("link", { name: "Voir mon invitation" }).click();
  await page.getByRole("button", { name: "Ouvrir l'invitation" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /Rayan/ })).toBeVisible();
  await expect(page.locator(".inv-watermark")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Envoyer ma réponse" })).toBeVisible();
});

test("un reçu refusé renvoie le client vers un nouvel envoi", async ({ page, browser }) => {
  const code = await visitorOrder(page);

  const admin = await adminLogin(browser);
  await admin.goto("/fr/admin/paiements");
  const card = admin.getByTestId("payment").filter({ hasText: code });
  await card.getByRole("button", { name: "Refuser" }).click();
  await card.getByLabel("Motif du refus (montré au client)").fill("Montant incorrect");
  await card.getByRole("button", { name: "Refuser le reçu" }).click();
  // Le reçu traité quitte la liste des paiements à vérifier.
  await expect(admin.getByTestId("payment").filter({ hasText: code })).toHaveCount(0, {
    timeout: 20_000,
  });

  await page.goto(`/fr/suivi?code=${code}`);
  await expect(page.getByText("Paiement refusé")).toBeVisible();
  await expect(page.getByText("Motif : Montant incorrect")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Envoyer un nouveau reçu" })).toBeVisible();
  await sendReceipt(page);
  await expect(page).toHaveURL(/\/commander\/merci/);

  await page.goto(`/fr/suivi?code=${code}`);
  await expect(page.getByText("Reçu en cours de vérification (sous 2 h).")).toBeVisible();
  await admin.goto("/fr/admin/paiements");
  await expect(admin.getByTestId("payment").filter({ hasText: code })).toHaveCount(1);
});

test("l'admin est protégé : sans connexion, retour à la page de connexion", async ({ page }) => {
  await page.goto("/fr/admin/paiements");
  await expect(page).toHaveURL(/\/fr\/admin\/connexion$/);
  const res = await page.request.get("/api/media/private/receipts/x/y.png");
  expect(res.status()).toBe(403);
});
