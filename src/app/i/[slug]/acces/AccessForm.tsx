"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { verifyAccessCode } from "@/actions/verifyAccessCode";
import type { Lang } from "@/invitation/engine/config";
import { translator, type Dicts } from "@/invitation/engine/i18n";
import { NoticeShell } from "@/invitation/server/Notices";

export function AccessForm({ slug, lang, dicts }: { slug: string; lang: Lang; dicts: Dicts }) {
  const t = translator(dicts, lang);
  const router = useRouter();
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <NoticeShell lang={lang}>
      <h1 className="inv-notice">{t("accessTitle")}</h1>
      <p className="inv-notice">{t("accessHelp")}</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const res = await verifyAccessCode({ slug, code });
          setBusy(false);
          if (res.ok) router.replace(`/i/${slug}`);
          else setWrong(true);
        }}
      >
        <div className="inv-field">
          <label htmlFor="code">{t("accessCode")}</label>
          <input
            id="code"
            value={code}
            autoComplete="off"
            onChange={(e) => setCode(e.target.value)}
            aria-invalid={wrong}
          />
          {wrong && (
            <p className="inv-error" role="alert">
              {t("accessWrong")}
            </p>
          )}
        </div>
        <button className="inv-btn is-solid" type="submit" disabled={busy}>
          {t("accessSubmit")}
        </button>
      </form>
    </NoticeShell>
  );
}
