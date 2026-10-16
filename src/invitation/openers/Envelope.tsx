"use client";

import { useEffect, useRef, useState } from "react";
import type { T } from "../engine/i18n";

/**
 * Ouverture « Enveloppe » : sceau de cire aux initiales du couple, rabat qui
 * s'ouvre en 3D, carte qui sort. S'ouvre au toucher du sceau, de l'enveloppe,
 * ou en tirant la carte vers le haut.
 */
export function Envelope({
  t,
  cardText,
  initials,
  greeting,
  onOpen,
  onGone,
}: {
  t: T;
  cardText: string;
  initials: string;
  greeting: string;
  onOpen: () => void;
  onGone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [gone, setGone] = useState(false);
  const startY = useRef<number | null>(null);
  const seal = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    seal.current?.focus({ preventScroll: true });
  }, []);

  const trigger = () => {
    if (open) return;
    setOpen(true);
    navigator.vibrate?.(30);
    onOpen();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(
      () => {
        setGone(true);
        onGone();
      },
      reduce ? 0 : 1700,
    );
  };

  return (
    <section
      className={`env-intro${gone ? "is-gone" : ""}`}
      aria-label={t("closedLabel")}
      aria-hidden={gone}
      onPointerDown={(e) => (startY.current = e.clientY)}
      onPointerUp={(e) => {
        if (startY.current !== null && startY.current - e.clientY > 40) trigger();
        startY.current = null;
      }}
    >
      <p className="env-greet">{greeting}</p>
      <div className="env-stage">
        <div className={`env${open ? "is-open" : ""}`} onClick={trigger}>
          <div className="env-back env-paper" />
          <div className="env-card env-paper">
            <span>{cardText}</span>
          </div>
          <div className="env-pocket env-paper" />
          <div className="env-flap" />
          <button
            ref={seal}
            type="button"
            className="env-seal"
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
