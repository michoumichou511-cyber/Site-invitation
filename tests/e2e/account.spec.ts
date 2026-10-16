import { expect, test } from "@playwright/test";
import { adminLogin, publishFlow } from "./admin-helpers";

test.describe.configure({ mode: "serial", timeout: 180_000 });

test("un client importe 100 invités, envoie les liens, voit les réponses et exporte", async ({
  page,
  browser,
}) => {
  const admin = await adminLogin(browser, "account");
  const first = `Walid${Date.now() % 100000}`;
  const { loginLink } = await publishFlow(page, admin, { first, second: "Meriem" });

  // Connexion par lien magique (transmis par l'admin, ici depuis le back-office).
  await page.goto(loginLink);
  await expect(page).toHaveURL(/\/fr\/compte$/);
  await page.getByRole("link", { name: new RegExp(first) }).click();

  // Invités : import CSV de 100 lignes.
  await page.getByRole("link", { name: "Invités" }).click();
  await expect(page.getByText("Ajoutez vos premiers invités")).toBeVisible();
  await page
    .locator('input[type=file][accept*=".csv"]')
    .setInputFiles("tests/fixtures/invites-100.csv");
  await expect(page.getByText("100 lignes valides")).toBeVisible();
  await expect(page.getByText("Aucune erreur")).toBeVisible();
  await page.getByRole("button", { name: "Importer les lignes valides" }).click();
  await expect(page.getByText("100 invités importés.")).toBeVisible();
  await expect(page.getByTestId("guest")).toHaveCount(100);

  // Lien nominatif + message WhatsApp prérempli (FR ou AR selon l'invité).
  const row = page.getByTestId("guest").filter({ hasText: "Invité 001" });
  const wa = row.getByRole("link", { name: "Envoyer sur WhatsApp" });
  const href = (await wa.getAttribute("href"))!;
  expect(href).toContain("https://wa.me/213550000001?text=");
  const guestLink = decodeURIComponent(href).match(/(https?:\/\/\S+\/i\/\S+\/[a-z2-9]{10})/)![1];
  expect(decodeURIComponent(href)).toContain("Bonjour Invité 001");

  // Un invité répond depuis son lien.
  const guestPage = await (
    await browser.newContext({ viewport: { width: 375, height: 812 } })
  ).newPage();
  await guestPage.goto(new URL(guestLink).pathname);
  await guestPage.getByRole("button", { name: "Ouvrir l'invitation" }).click();
  const rsvp = guestPage.locator("#rsvp");
  await rsvp.scrollIntoViewIfNeeded();
  await rsvp.getByRole("button", { name: "Je serai là" }).click();
  await rsvp.getByRole("button", { name: "Envoyer ma réponse" }).click();
  await expect(rsvp.getByText(/Votre présence/)).toBeVisible();

  // Réponses : compteurs, réponse ajoutée à la main, export Excel.
  await page.getByRole("link", { name: "Réponses" }).click();
  await expect(page.getByTestId("count-present")).toHaveText("1");
  await expect(page.getByTestId("count-pending")).toHaveText("99");
  await page.getByRole("button", { name: "Ajouter une réponse reçue par téléphone" }).click();
  await page.getByLabel("Invité", { exact: true }).selectOption({ label: "Invité 002" });
  await page.getByText("Absent", { exact: true }).click();
  await page.getByRole("button", { name: "Enregistrer la réponse" }).click();
  await expect(page.getByTestId("count-absent")).toHaveText("1");
  await expect(page.getByTestId("count-pending")).toHaveText("98");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exporter Excel" }).click();
  expect((await download).suggestedFilename()).toBe("reponses.xlsx");

  // Modifier : le titre change sur l'invitation publiée.
  await page.getByRole("link", { name: "Modifier" }).click();
  await page
    .getByRole("group", { name: "Premier prénom" })
    .getByLabel("En français")
    .fill(`${first} B.`);
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(page.getByText("Modifications enregistrées.")).toBeVisible();
  await guestPage.reload();
  await guestPage.getByRole("button", { name: "Ouvrir l'invitation" }).click();
  await expect(guestPage.getByRole("heading", { level: 1 })).toContainText(`${first} B.`);
});

test("un client ne voit pas l'invitation d'un autre", async ({ page }) => {
  await page.goto("/fr/compte/invitations/00000000-0000-0000-0000-000000000000");
  await expect(page).toHaveURL(/\/fr\/connexion$/);
});
