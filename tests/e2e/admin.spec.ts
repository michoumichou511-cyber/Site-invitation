import { expect, test, type Browser, type Page } from "@playwright/test";
import { ADMIN } from "./global-setup";
import { fillWizard, orderToPayment, sendReceipt } from "./helpers";
import { secretFromUri, totp } from "./totp";

test.describe.configure({ mode: "serial", timeout: 120_000 });

let secret = "";

async function adminLogin(browser: Browser): Promise<Page> {
  const page = await (
    await browser.newContext({ viewport: { width: 1280, height: 900 } })
  ).newPage();
  await page.goto("/fr/admin/connexion");
  await page.getByLabel("E-mail").fill(ADMIN.email);
  await page.getByLabel("Mot de passe").fill(ADMIN.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  if (!secret) {
    // Première connexion : activation obligatoire de la 2FA.
    await expect(page).toHaveURL(/\/fr\/admin\/2fa$/, { timeout: 30_000 });
    await page.getByLabel("Votre mot de passe").fill(ADMIN.password);
    await page.getByRole("button", { name: "Générer le QR code" }).click();
    secret = secretFromUri((await page.getByTestId("totp-uri").textContent())!);
    await page.getByLabel("Code à 6 chiffres").fill(totp(secret));
    await page.getByRole("button", { name: "Activer" }).click();
  } else {
    await page.getByLabel(/Code à 6 chiffres/).fill(totp(secret));
    await page.getByRole("button", { name: "Vérifier" }).click();
  }
  await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible({
    timeout: 30_000,
  });
  return page;
}

async function visitorOrder(page: Page) {
  await fillWizard(page, { first: "Rayan", second: "Ines" });
  const code = await orderToPayment(page);
  await sendReceipt(page);
  await expect(page).toHaveURL(/\/commander\/merci/);
  return code;
}

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
  await expect(admin.getByTestId("payment").filter({ hasText: code })).toHaveCount(0);

  await admin.getByRole("link", { name: "Commandes" }).click();
  await admin.getByRole("link", { name: new RegExp(code) }).click();
  await expect(admin.getByText("Payée").first()).toBeVisible();
  await admin.getByRole("button", { name: "Publier l'invitation" }).click();
  await expect(admin.getByText("Invitation publiée.")).toBeVisible();
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
  await expect(admin.getByTestId("payment").filter({ hasText: code })).toHaveCount(0);

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
