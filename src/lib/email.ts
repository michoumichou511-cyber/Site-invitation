import "server-only";
import { getEnv } from "@/db";

type Email = { to: string; subject: string; html: string; text: string };

/** Envoie un e-mail via l'API Resend. Sans clé (développement), l'e-mail est affiché dans la console. */
export async function sendEmail(email: Email): Promise<void> {
  const env = await getEnv();
  if (!env.RESEND_API_KEY) {
    console.info(`[e-mail non envoyé — pas de RESEND_API_KEY]\nÀ : ${email.to}\n${email.text}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: env.EMAIL_FROM, ...email }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
