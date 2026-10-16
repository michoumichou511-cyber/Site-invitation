"use client";

import { useEffect, useRef } from "react";
import { useOpener, type OpenerProps } from "./useOpener";

/**
 * Ouverture « Porte de la Casbah » : deux battants en bois de cèdre à moucharabieh,
 * heurtoir en laiton aux initiales ; les battants s'ouvrent vers l'intérieur.
 */
export function Doors(props: OpenerProps) {
  const { t, cardText, initials, greeting } = props;
  const { open, gone, trigger, swipe } = useOpener(props, 1900);
  const knocker = useRef<HTMLButtonElement>(null);
  useEffect(() => knocker.current?.focus({ preventScroll: true }), []);
  return (
    <section
      className={`env-intro doors-intro${gone ? "is-gone" : ""}`}
      aria-label={t("closedLabel")}
      aria-hidden={gone}
      {...swipe}
    >
      <p className="env-greet">{greeting}</p>
      <div className="doors-stage">
        <div className={`doors${open ? "is-open" : ""}`} onClick={trigger}>
          <div className="doors-inside">
            <span>{cardText}</span>
          </div>
          <div className="door door-start" />
          <div className="door door-end" />
          <button
            ref={knocker}
            type="button"
            className="doors-knocker"
            aria-label={t("openLabel")}
            onClick={(e) => {
              e.stopPropagation();
              trigger();
            }}
          >
            <span dir="ltr">{initials}</span>
          </button>
        </div>
      </div>
      <p className="env-hint">{t("openHint")}</p>
    </section>
  );
}
