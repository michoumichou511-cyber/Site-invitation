"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { uploadReceipt } from "@/actions/uploadReceipt";
import { useRouter } from "@/i18n/navigation";
import { Turnstile } from "@/invitation/engine/Turnstile";
import { Choice, primaryBtn } from "./fields";
import { compressPhoto } from "./image";
import { dataUrlToFile } from "./draft";

/** Envoi du reçu BaridiMob / CCP (photo compressée ou PDF). */
export function PaymentForm({
  code,
  turnstileSiteKey,
}: {
  code: string;
  turnstileSiteKey: string | null;
}) {
  const t = useTranslations("order");
  const locale = useLocale();
  const router = useRouter();
  const [method, setMethod] = useState<"baridimob" | "ccp">("baridimob");
  const [file, setFile] = useState<File | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const onToken = useCallback((tk: string | null) => setToken(tk), []);

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!file) {
          setError(t("receiptError"));
          return;
        }
        setBusy(true);
        setError("");
        try {
          const form = new FormData();
          form.set("code", code);
          form.set("method", method);
          // Photo du reçu compressée (2000 px) ; un PDF part tel quel.
          const upload = file.type.startsWith("image/")
            ? await dataUrlToFile(await compressPhoto(file, 2000, 0.85), "recu")
            : file;
          form.set("receipt", upload);
          if (token) form.set("turnstile", token);
          const res = await uploadReceipt(form);
          if (!res.ok) {
            setError(t(`receiptErrors.${res.error}`));
            return;
          }
          router.push(`/commander/merci?code=${code}`);
        } catch {
          setError(t("errors.server"));
        } finally {
          setBusy(false);
        }
      }}
    >
      <Choice
        legend={t("method")}
        options={[
          { value: "baridimob", label: t("methodBaridimob") },
          { value: "ccp", label: t("methodCcp") },
        ]}
        value={method}
        onChange={setMethod}
      />
      <div className="space-y-1.5">
        <label htmlFor="receipt" className="block font-bold">
          {t("receipt")}
        </label>
        <input
          id="receipt"
          type="file"
          accept="image/*,application/pdf"
          className="block w-full rounded-field border border-wall bg-surface p-3"
          aria-invalid={Boolean(error) && !file}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      {turnstileSiteKey && <Turnstile siteKey={turnstileSiteKey} lang={locale} onToken={onToken} />}
      {error && (
        <p role="alert" className="rounded-field bg-danger/10 p-3 text-danger">
          {error}
        </p>
      )}
      <button type="submit" className={`${primaryBtn} w-full`} disabled={busy}>
        {busy ? t("submitting") : t("sendReceipt")}
      </button>
    </form>
  );
}

export function CopyButton({ value }: { value: string }) {
  const t = useTranslations("order");
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="inline-flex min-h-12 items-center rounded-full border border-sea px-4 text-sm font-bold text-sea"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {}
      }}
    >
      {done ? t("copied") : t("copy")}
    </button>
  );
}
