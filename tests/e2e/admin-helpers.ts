import { expect, type Browser, type Page } from "@playwright/test";
import { ADMINS } from "./global-setup";
import { fillWizard, orderToPayment, sendReceipt } from "./helpers";
import { secretFromUri, totp } from "./totp";

const secrets: Record<string, string> = {};

export async function adminLogin(
  browser: Browser,
  who: keyof typeof ADMINS = "admin",
): Promise<Page> {
  const ADMIN = ADMINS[who];
  let secret = secrets[who] ?? "";
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
    secrets[who] = secret;
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

export async function visitorOrder(page: Page, names = { first: "Rayan", second: "Ines" }) {
  await fillWizard(page, names);
  const code = await orderToPayment(page);
  await sendReceipt(page);
  await expect(page).toHaveURL(/\/commander\/merci/);
  return code;
}

/** Commande visiteur → paiement validé → invitation publiée ; renvoie le lien de connexion du client. */
export async function publishFlow(
  page: Page,
  admin: Page,
  names: { first: string; second: string },
) {
  const code = await visitorOrder(page, names);
  await admin.goto("/fr/admin/paiements");
  await admin
    .getByTestId("payment")
    .filter({ hasText: code })
    .getByRole("button", { name: "Valider" })
    .click();
  await expect(admin.getByTestId("payment").filter({ hasText: code })).toHaveCount(0);
  await admin.goto("/fr/admin/commandes");
  await admin.getByRole("link", { name: new RegExp(code) }).click();
  await admin.getByRole("button", { name: "Publier l'invitation" }).click();
  await expect(admin.getByText("Invitation publiée.")).toBeVisible();
  const text = (await admin.getByText(/Lien de connexion du client/).textContent())!;
  return {
    code,
    loginLink:
      new URL(text.match(/https?:\/\/\S+/)![0]).pathname +
      new URL(text.match(/https?:\/\/\S+/)![0]).search,
  };
}
