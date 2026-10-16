"use client";

import { useEffect, useState } from "react";
import { submitRsvp } from "@/actions/submitRsvp";
import type { SectionProps } from "./types";

type Pending = Parameters<typeof submitRsvp>[0];
const QUEUE_KEY = "louloua-rsvp-queue";

function readQueue(): Pending[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as Pending[];
  } catch {
    return [];
  }
}
function writeQueue(q: Pending[]) {
  try {
    if (q.length) localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    else localStorage.removeItem(QUEUE_KEY);
  } catch {}
}

/** Renvoie les réponses gardées hors ligne dès que le réseau revient. */
async function flushQueue() {
  const queue = readQueue();
  if (!queue.length || !navigator.onLine) return;
  const left: Pending[] = [];
  for (const item of queue) {
    try {
      await submitRsvp(item);
    } catch {
      left.push(item);
    }
  }
  writeQueue(left);
}

/** RSVP en 2 gestes : présent / absent, nombre de places (limité par le lien), message. */
export function Rsvp({
  vm,
  t,
  onAnswered,
}: SectionProps & { onAnswered: (answer: "oui" | "non") => void }) {
  const existing = vm.existingRsvp;
  const [name, setName] = useState(existing?.name ?? vm.guest?.name ?? "");
  const [yes, setYes] = useState(existing ? existing.answer !== "non" : true);
  const [seats, setSeats] = useState(Math.max(1, existing?.seats || Math.min(2, vm.maxSeats)));
  const [message, setMessage] = useState(existing?.message ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "queued" | "error">(
    existing ? "done" : "idle",
  );
  const [result, setResult] = useState<{ answer: "oui" | "non"; seats: number } | null>(
    existing ? { answer: existing.answer === "non" ? "non" : "oui", seats: existing.seats } : null,
  );
  const [nameError, setNameError] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    void flushQueue();
    const onOnline = () => void flushQueue();
    addEventListener("online", onOnline);
    return () => removeEventListener("online", onOnline);
  }, []);

  const state = vm.rsvp;
  if (state.kind === "off") return null;

  const closedText =
    state.kind === "preview"
      ? t("rsvpPreview")
      : state.kind === "deadline"
        ? t("rsvpClosedDeadline")
        : state.kind === "past"
          ? t("rsvpClosedPast")
          : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    const payload: Pending = {
      slug: vm.slug,
      code: vm.guest?.code ?? null,
      name: name.trim(),
      answer: yes ? "oui" : "non",
      seats: yes ? seats : 0,
      message: message.trim() || null,
    };
    setStatus("sending");
    try {
      if (!navigator.onLine) throw new TypeError("offline");
      const res = await submitRsvp(payload);
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setResult({ answer: res.answer, seats: res.seats });
      setStatus("done");
      setCelebrate(res.answer === "oui");
      onAnswered(res.answer);
    } catch {
      writeQueue([...readQueue(), payload]);
      setResult({ answer: payload.answer, seats: payload.seats });
      setStatus("queued");
    }
  };

  return (
    <section className="inv-reveal inv-paper" id="rsvp" aria-labelledby="h-rsvp">
      <h2 id="h-rsvp">{t("rsvpTitle")}</h2>
      {closedText ? (
        <p className="inv-notice">{closedText}</p>
      ) : status === "done" || status === "queued" ? (
        <div className="inv-done" role="status">
          <strong>{t("done")}</strong>
          {celebrate && <span className="inv-youyou">{t("youyou")}</span>}
          <p>{result?.answer === "oui" ? t("doneYes", { seats: result.seats }) : t("doneNo")}</p>
          {status === "queued" && <p>{t("queued")}</p>}
          <button
            type="button"
            className="inv-btn is-ghost"
            onClick={() => {
              setStatus("idle");
              setCelebrate(false);
            }}
          >
            {t("change")}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="inv-field">
            <label htmlFor="r-name">{t("yourName")}</label>
            <input
              id="r-name"
              autoComplete="name"
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={nameError}
              aria-describedby={nameError ? "r-name-err" : undefined}
            />
            {nameError && (
              <p className="inv-error" id="r-name-err">
                {t("nameRequired")}
              </p>
            )}
          </div>
          <div className="inv-choice" role="group" aria-label={t("rsvpTitle")}>
            <button type="button" aria-pressed={yes} onClick={() => setYes(true)}>
              {t("yes")}
            </button>
            <button type="button" aria-pressed={!yes} onClick={() => setYes(false)}>
              {t("no")}
            </button>
          </div>
          {yes && (
            <div className="inv-field">
              <span className="label" id="r-seats-label">
                {t("seats")}
              </span>
              <div className="inv-stepper" role="group" aria-labelledby="r-seats-label">
                <button
                  type="button"
                  aria-label={t("less")}
                  disabled={seats <= 1}
                  onClick={() => setSeats((s) => Math.max(1, s - 1))}
                >
                  −
                </button>
                <output aria-live="polite">{seats}</output>
                <button
                  type="button"
                  aria-label={t("more")}
                  disabled={seats >= vm.maxSeats}
                  onClick={() => setSeats((s) => Math.min(vm.maxSeats, s + 1))}
                >
                  +
                </button>
                <small>{t("seatsMax", { max: vm.maxSeats })}</small>
              </div>
            </div>
          )}
          <div className="inv-field">
            <label htmlFor="r-msg">{t("message")}</label>
            <textarea
              id="r-msg"
              value={message}
              maxLength={500}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button className="inv-btn is-solid" type="submit" disabled={status === "sending"}>
            {status === "sending" ? t("sending") : t("send")}
          </button>
          {status === "error" && (
            <p className="inv-error" role="alert">
              {t("error")}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
