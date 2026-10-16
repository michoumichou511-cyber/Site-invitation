"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { primaryBtn, TextField } from "@/components/order/fields";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";

/** Connexion admin : e-mail + mot de passe, puis code TOTP si la 2FA est active. */
export function AdminLogin() {
  const t = useTranslations("admin.login");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needCode, setNeedCode] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const done = () => {
    router.replace("/admin");
    router.refresh();
  };

  return (
    <form
      className="mx-auto mt-16 max-w-sm space-y-5 rounded-card bg-surface p-6 shadow-float"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          if (!needCode) {
            const res = await authClient.signIn.email({ email, password });
            if (res.error) return setError(t("error"));
            if ((res.data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect)
              return setNeedCode(true);
            return done();
          }
          const res = await authClient.twoFactor.verifyTotp({ code: code.replace(/\s/g, "") });
          if (res.error) return setError(t("codeError"));
          done();
        } finally {
          setBusy(false);
        }
      }}
    >
      <h1 className="text-2xl text-cedar">{t("title")}</h1>
      {!needCode ? (
        <>
          <TextField
            label={t("email")}
            type="email"
            autoComplete="username"
            dir="ltr"
            value={email}
            onChange={setEmail}
            required
          />
          <TextField
            label={t("password")}
            type="password"
            autoComplete="current-password"
            dir="ltr"
            value={password}
            onChange={setPassword}
            required
          />
        </>
      ) : (
        <TextField
          label={t("code")}
          inputMode="numeric"
          autoComplete="one-time-code"
          dir="ltr"
          value={code}
          onChange={setCode}
          autoFocus
        />
      )}
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      <button className={`${primaryBtn} w-full`} disabled={busy}>
        {needCode ? t("verify") : t("submit")}
      </button>
    </form>
  );
}
