"use client";

import { useEffect, useRef } from "react";
import { useOpener, type OpenerProps } from "./useOpener";

const BALLOONS = ["#DB7456", "#045588", "#A8C7DE", "#F2B8A8", "#4F8DBB"];

/** Ouverture « Cadeau » (anniversaire) : le couvercle saute, les ballons montent. */
export function Gift(props: OpenerProps) {
  const { t, cardText, greeting } = props;
  const { open, gone, trigger, swipe } = useOpener(props, 2000);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => button.current?.focus({ preventScroll: true }), []);
  return (
    <section
      className={`env-intro gift-intro ${gone ? "is-gone" : ""}`}
      aria-label={t("closedLabel")}
      aria-hidden={gone}
      {...swipe}
    >
      <p className="env-greet">{greeting}</p>
      <div className={`gift ${open ? "is-open" : ""}`}>
        {open && (
          <div className="gift-balloons" aria-hidden="true">
            {BALLOONS.map((c, i) => (
              <span key={c} style={{ "--c": c, "--i": i } as React.CSSProperties} />
            ))}
          </div>
        )}
        <p className="gift-card">{cardText}</p>
        <button
          ref={button}
          type="button"
          className="gift-box"
          aria-label={t("openLabel")}
          onClick={trigger}
        >
          <span className="gift-lid" />
          <span className="gift-body" />
        </button>
      </div>
      <p className="env-hint">{t("openHint")}</p>
    </section>
  );
}
