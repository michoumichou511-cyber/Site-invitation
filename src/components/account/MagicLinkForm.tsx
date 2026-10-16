"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { primaryBtn, TextField } from "@/components/order/fields";
import { SITE, waLink } from "@/config/site";
import { authClient } from "@/lib/auth/client";

/** Connexion sans mot de passe : lien magique envoyé par e-mail. */
export function MagicLinkForm() {
  const t = useTranslations("account");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  return (
    <form
      className="mx-auto max-w-md space-y-5 px-4 py-12"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("sending");
        const res = await authClient.signIn.magicLink({ email, callbackURL: `/${locale}/compte` });
        setStatus(res.error ? "error" : "sent");
      }}
    >
      <h1 className="text-[32px] text-cedar">{t("loginTitle")}</h1>
      <p className="text-ink-soft">{t("loginHelp")}</p>
      {status === "sent" ? (
        <p role="status" className="rounded-card bg-zellige/10 p-4 font-bold text-zellige">
          {t("sent")}
        </p>
      ) : (
        <>
          <TextField
            label={t("email")}
            type="email"
            autoComplete="email"
            dir="ltr"
            value={email}
            onChange={setEmail}
            required
          />
          <button className={`${primaryBtn} w-full`} disabled={status === "sending"}>
            {t("send")}
          </button>
        </>
      )}
      {status === "error" && (
        <p role="alert" className="text-danger">
          {t("error")}
        </p>
      )}
      <a
        href={waLink(SITE.whatsapp)}
        target="_blank"
        rel="noopener"
        className="block text-center font-bold text-zellige"
      >
        {t("noEmail")}
      </a>
    </form>
  );
}
