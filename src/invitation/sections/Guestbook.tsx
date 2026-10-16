"use client";

import { useCallback, useState } from "react";
import { submitWish } from "@/actions/submitWish";
import { Turnstile } from "../engine/Turnstile";
import type { ViewWish } from "../engine/types";
import type { SectionProps } from "./types";

/** Livre d'or : vœux des invités (Turnstile chargé seulement au premier toucher du formulaire). */
export function Guestbook({ vm, lang, t }: SectionProps) {
  const [wishes, setWishes] = useState<ViewWish[]>(vm.wishes);
  const [name, setName] = useState(vm.guest?.name ?? "");
  const [message, setMessage] = useState("");
  const [engaged, setEngaged] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const onToken = useCallback((tk: string | null) => setToken(tk), []);

  if (!vm.config.sections.guestbook || vm.preview) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setStatus("sending");
    try {
      const res = await submitWish({
        slug: vm.slug,
        code: vm.guest?.code ?? null,
        name: name.trim(),
        message: message.trim(),
        turnstileToken: token,
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setWishes((w) => [res.wish, ...w]);
      setMessage("");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="inv-reveal inv-paper" aria-labelledby="h-wishes">
      <h2 id="h-wishes">{t("guestbookTitle")}</h2>
      <form onSubmit={submit} onFocus={() => setEngaged(true)}>
        <div className="inv-field">
          <label htmlFor="w-name">{t("yourName")}</label>
          <input
            id="w-name"
            autoComplete="name"
            value={name}
            maxLength={80}
            required
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="inv-field">
          <label htmlFor="w-msg">{t("wishPlaceholder")}</label>
          <textarea
            id="w-msg"
            value={message}
            maxLength={500}
            required
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        {engaged && vm.turnstileSiteKey && (
          <Turnstile siteKey={vm.turnstileSiteKey} lang={lang} onToken={onToken} />
        )}
        <button className="inv-btn is-solid" type="submit" disabled={status === "sending"}>
          {status === "sending" ? t("sending") : t("wishSend")}
        </button>
        {status === "done" && (
          <p className="inv-notice" role="status">
            {t("wishDone")}
          </p>
        )}
        {status === "error" && (
          <p className="inv-error" role="alert">
            {t("error")}
          </p>
        )}
      </form>
      {wishes.length === 0 ? (
        <p className="inv-notice">{t("guestbookEmpty")}</p>
      ) : (
        <ul className="inv-wishes">
          {wishes.map((w) => (
            <li key={w.id}>
              <b>{w.name}</b>
              <p>{w.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
