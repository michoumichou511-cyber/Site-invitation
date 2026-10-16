"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { addManualRsvp } from "@/actions/client/answers";
import {
  Choice,
  Field,
  inputClass,
  primaryBtn,
  secondaryBtn,
  TextField,
} from "@/components/order/fields";
import { useRouter } from "@/i18n/navigation";
import { guestWhatsapp, type ShareTexts } from "@/lib/guests/share";

export type AnswerRow = {
  key: string;
  guestId: string | null;
  name: string;
  phone: string | null;
  locale: string | null;
  code: string | null;
  group: string | null;
  maxSeats: number | null;
  answer: "oui" | "non" | "peut_etre" | null;
  seats: number;
  message: string | null;
  source: "lien" | "manuel" | null;
};

type Filter = "all" | "oui" | "non" | "none";

export function AnswersBoard({
  invitationId,
  rows,
  linkBase,
  title,
  defaultLang,
  texts,
}: {
  invitationId: string;
  rows: AnswerRow[];
  linkBase: string;
  title: { fr: string; ar: string };
  defaultLang: "fr" | "ar";
  texts: ShareTexts;
}) {
  const t = useTranslations("account.answers");
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();
  const [manual, setManual] = useState({
    guestId: "",
    name: "",
    answer: "oui" as "oui" | "non" | "peut_etre",
    seats: "1",
    message: "",
  });
  const [msg, setMsg] = useState("");

  const counts = useMemo(() => {
    const present = rows.filter((r) => r.answer === "oui");
    return {
      present: present.length,
      absent: rows.filter((r) => r.answer === "non").length,
      pending: rows.filter((r) => r.answer === null).length,
      people: present.reduce((s, r) => s + r.seats, 0),
    };
  }, [rows]);

  const visible = rows.filter(
    (r) =>
      (filter === "all" || (filter === "none" ? r.answer === null : r.answer === filter)) &&
      (!query.trim() || r.name.toLowerCase().includes(query.trim().toLowerCase())),
  );

  const label = (a: AnswerRow["answer"]) =>
    a === "oui" ? t("yes") : a === "non" ? t("no") : a === "peut_etre" ? t("maybe") : t("none");

  const exportExcel = async () => {
    const { default: write } = await import("write-excel-file/browser");
    await write([
      [t("guest"), "Tel", "Groupe", t("answer"), t("seats"), t("message")],
      ...rows.map((r) => [
        r.name,
        r.phone ?? "",
        r.group ?? "",
        label(r.answer),
        r.answer === "oui" ? r.seats : 0,
        r.message ?? "",
      ]),
    ]).toFile("reponses.xlsx");
  };

  const guestOptions = rows.filter((r) => r.guestId);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h1 className="text-[28px] text-cedar">{t("title")}</h1>
        <div className="flex flex-wrap gap-2">
          <button className={secondaryBtn} onClick={exportExcel}>
            {t("export")}
          </button>
          <button className={secondaryBtn} onClick={() => print()}>
            {t("print")}
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(
          [
            ["present", counts.present, "text-zellige"],
            ["absent", counts.absent, "text-danger"],
            ["pending", counts.pending, "text-ink-soft"],
            ["people", counts.people, "text-sea"],
          ] as const
        ).map(([k, v, c]) => (
          <div key={k} className="rounded-card bg-surface p-4">
            <dt className="text-sm text-ink-soft">{t(k)}</dt>
            <dd className={`text-3xl font-bold ${c}`} data-testid={`count-${k}`}>
              {v}
            </dd>
          </div>
        ))}
      </dl>

      <div className="space-y-3 print:hidden">
        <Choice
          legend={t("title")}
          options={[
            { value: "all", label: t("all") },
            { value: "oui", label: t("present") },
            { value: "non", label: t("absent") },
            { value: "none", label: t("pending") },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <input
          className={inputClass}
          type="search"
          placeholder={t("search")}
          aria-label={t("search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className={secondaryBtn} onClick={() => setAdding((a) => !a)}>
          {t("addManual")}
        </button>
      </div>

      {adding && (
        <form
          className="grid gap-4 rounded-card bg-surface p-4 md:grid-cols-2 print:hidden"
          onSubmit={(e) => {
            e.preventDefault();
            const guest = guestOptions.find((g) => g.guestId === manual.guestId);
            const name = guest?.name ?? manual.name.trim();
            if (!name) return;
            start(async () => {
              const r = await addManualRsvp({
                invitationId,
                guestId: guest?.guestId ?? null,
                name,
                answer: manual.answer,
                seats: Number(manual.seats) || 1,
                message: manual.message.trim() || null,
              });
              setMsg(r.ok ? t("saved") : "");
              if (r.ok) setAdding(false);
              router.refresh();
            });
          }}
        >
          <Field label={t("guest")}>
            {(p) => (
              <select
                {...p}
                className={inputClass}
                value={manual.guestId}
                onChange={(e) => setManual({ ...manual, guestId: e.target.value })}
              >
                <option value="">—</option>
                {guestOptions.map((g) => (
                  <option key={g.key} value={g.guestId!}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          {!manual.guestId && (
            <TextField
              label={t("newName")}
              value={manual.name}
              onChange={(name) => setManual({ ...manual, name })}
              maxLength={80}
            />
          )}
          <Choice
            legend={t("answer")}
            options={[
              { value: "oui", label: t("yes") },
              { value: "non", label: t("no") },
              { value: "peut_etre", label: t("maybe") },
            ]}
            value={manual.answer}
            onChange={(answer) => setManual({ ...manual, answer })}
          />
          <TextField
            label={t("seats")}
            type="number"
            min={1}
            max={50}
            value={manual.seats}
            onChange={(seats) => setManual({ ...manual, seats })}
          />
          <TextField
            label={t("message")}
            value={manual.message}
            onChange={(message) => setManual({ ...manual, message })}
            maxLength={500}
          />
          <div className="flex items-end">
            <button className={`${primaryBtn} w-full`} disabled={pending}>
              {t("save")}
            </button>
          </div>
        </form>
      )}
      {msg && (
        <p role="status" className="font-bold text-zellige">
          {msg}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="rounded-card border border-dashed border-brass bg-surface p-8 text-center text-ink-soft">
          {t("empty")}
        </p>
      ) : (
        <table className="w-full rounded-card bg-surface text-start">
          <thead>
            <tr className="border-b border-wall text-sm text-ink-soft">
              <th className="p-3 text-start">{t("guest")}</th>
              <th className="p-3 text-start">{t("answer")}</th>
              <th className="p-3 text-start">{t("seats")}</th>
              <th className="p-3 text-start print:hidden">
                <span className="sr-only">WhatsApp</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.key} className="border-b border-wall align-top" data-testid="answer-row">
                <td className="p-3">
                  <b>{r.name}</b>
                  {r.group && <span className="block text-sm text-ink-soft">{r.group}</span>}
                  {!r.guestId && (
                    <span className="block text-sm text-ink-soft">{t("generic")}</span>
                  )}
                  {r.source === "manuel" && (
                    <span className="block text-sm text-ink-soft">{t("manual")}</span>
                  )}
                  {r.message && <span className="mt-1 block text-sm italic">« {r.message} »</span>}
                </td>
                <td
                  className={`p-3 font-bold ${r.answer === "oui" ? "text-zellige" : r.answer === "non" ? "text-danger" : "text-ink-soft"}`}
                >
                  {label(r.answer)}
                </td>
                <td className="p-3">{r.answer === "oui" ? r.seats : "—"}</td>
                <td className="p-3 print:hidden">
                  {r.answer === null && r.code && (
                    <a
                      href={guestWhatsapp(r, {
                        link: `${linkBase}/${r.code}`,
                        title,
                        defaultLang,
                        texts,
                        reminder: true,
                      })}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex min-h-12 items-center rounded-full bg-whatsapp px-4 text-sm font-bold text-white"
                    >
                      {t("remind")}
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
