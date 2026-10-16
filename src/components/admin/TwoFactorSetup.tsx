"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { primaryBtn, TextField } from "@/components/order/fields";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";

/** Activation obligatoire de la 2FA (TOTP) pour l'admin. */
export function TwoFactorSetup() {
  const t = useTranslations("admin.twofa");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [qr, setQr] = useState("");
  const [uri, setUri] = useState("");
  const [backup, setBackup] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="mx-auto mt-10 max-w-md space-y-5 rounded-card bg-surface p-6 shadow-float">
      <h1 className="text-2xl text-cedar">{t("title")}</h1>
      <p className="text-ink-soft">{t("help")}</p>
      {!uri ? (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await authClient.twoFactor.enable({ password });
            if (res.error || !res.data || !("totpURI" in res.data))
              return setError(res.error?.message ?? "");
            const data = res.data;
            setUri(data.totpURI);
            setBackup(data.backupCodes);
            const QR = await import("qrcode");
            setQr(await QR.toDataURL(data.totpURI, { margin: 1, width: 240 }));
          }}
        >
          <TextField
            label={t("password")}
            type="password"
            autoComplete="current-password"
            dir="ltr"
            value={password}
            onChange={setPassword}
          />
          <button className={`${primaryBtn} w-full`}>{t("start")}</button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await authClient.twoFactor.verifyTotp({ code: code.replace(/\s/g, "") });
            if (res.error) return setError(res.error.message ?? "");
            router.replace("/admin");
            router.refresh();
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- QR généré localement */}
          {qr && <img src={qr} alt="" width={240} height={240} className="mx-auto" />}
          <p className="text-xs break-all text-ink-soft" dir="ltr" data-testid="totp-uri">
            {uri}
          </p>
          <div>
            <p className="font-bold">{t("backup")}</p>
            <p className="font-mono text-sm" dir="ltr">
              {backup.join(" · ")}
            </p>
          </div>
          <TextField
            label={t("code")}
            inputMode="numeric"
            autoComplete="one-time-code"
            dir="ltr"
            value={code}
            onChange={setCode}
          />
          <button className={`${primaryBtn} w-full`}>{t("confirm")}</button>
        </form>
      )}
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
