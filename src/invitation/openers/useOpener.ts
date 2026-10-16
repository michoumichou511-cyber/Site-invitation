"use client";

import { useRef, useState } from "react";

export type OpenerProps = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  cardText: string;
  initials: string;
  greeting: string;
  onOpen: () => void;
  onGone: () => void;
};

/** Logique commune des ouvertures : un seul déclenchement, vibration, durée, geste vers le haut. */
export function useOpener(
  { onOpen, onGone }: Pick<OpenerProps, "onOpen" | "onGone">,
  duration = 1700,
) {
  const [open, setOpen] = useState(false);
  const [gone, setGone] = useState(false);
  const startY = useRef<number | null>(null);

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
      reduce ? 0 : duration,
    );
  };

  const swipe = {
    onPointerDown: (e: React.PointerEvent) => (startY.current = e.clientY),
    onPointerUp: (e: React.PointerEvent) => {
      if (startY.current !== null && startY.current - e.clientY > 40) trigger();
      startY.current = null;
    },
  };

  return { open, gone, trigger, swipe };
}
