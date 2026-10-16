"use client";

import { useEffect, useState } from "react";
import { countdownParts, type CountdownParts } from "../engine/rules";
import type { SectionProps } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Compte à rebours ; devient un message de remerciement après la date. */
export function Countdown({ vm, t }: SectionProps) {
  const target = vm.events[0]?.startsAt;
  const [parts, setParts] = useState<CountdownParts | null | undefined>(undefined);

  useEffect(() => {
    if (!target) return;
    const tick = () => setParts(countdownParts(target, Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (!target) return null;
  const past = vm.isPast || parts === null;

  return (
    <section className="inv-reveal" aria-labelledby="h-cd">
      <h2 id="h-cd">{t("countdownTitle")}</h2>
      {past ? (
        <p className="inv-thanks">{t("thanks")}</p>
      ) : (
        <div className="inv-cd" role="timer" aria-live="off">
          {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
            <div key={unit}>
              <b suppressHydrationWarning>{parts ? pad(parts[unit]) : "--"}</b>
              <span>{t(unit)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
