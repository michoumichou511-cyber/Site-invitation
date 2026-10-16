"use client";

import { useState } from "react";
import type { SectionProps } from "./types";

/** Bougie à souffler (anniversaire) : on touche la flamme, elle s'éteint, confettis. */
export function Candle({ t, onBlow }: SectionProps & { onBlow: () => void }) {
  const [out, setOut] = useState(false);
  return (
    <section className="inv-reveal inv-candle" aria-labelledby="h-candle">
      <h2 id="h-candle">{t("candleTitle")}</h2>
      <button
        type="button"
        className={`candle${out ? "is-out" : ""}`}
        aria-pressed={out}
        aria-label={out ? t("candleDone") : t("candleBlow")}
        onClick={() => {
          if (out) return;
          setOut(true);
          navigator.vibrate?.(20);
          onBlow();
        }}
      >
        <span className="candle-flame" aria-hidden="true" />
        <span className="candle-smoke" aria-hidden="true" />
        <span className="candle-stick" aria-hidden="true" />
      </button>
      <p className="inv-notice">{out ? t("candleDone") : t("candleBlow")}</p>
    </section>
  );
}
