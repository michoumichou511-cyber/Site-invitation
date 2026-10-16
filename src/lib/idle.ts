/** Lance `fn` quand le navigateur est libre (repli : petit délai). Renvoie la fonction d'annulation. */
export function onIdle(fn: () => void, timeout = 2500): () => void {
  const w = globalThis as typeof globalThis & {
    requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback && w.cancelIdleCallback) {
    const id = w.requestIdleCallback(fn, { timeout });
    return () => w.cancelIdleCallback!(id);
  }
  const id = setTimeout(fn, 300);
  return () => clearTimeout(id);
}

const GESTURES = ["scroll", "wheel", "touchstart", "pointerdown", "keydown"] as const;

/**
 * Lance `fn` au premier geste du visiteur (défilement, toucher, clavier), puis quand le
 * navigateur est libre. Les animations de scroll ne pèsent rien au chargement.
 */
export function onFirstInteraction(fn: () => void): () => void {
  let cancelIdle: (() => void) | undefined;
  const start = () => {
    GESTURES.forEach((e) => removeEventListener(e, start));
    cancelIdle = onIdle(fn, 800);
  };
  GESTURES.forEach((e) => addEventListener(e, start, { passive: true, once: true }));
  return () => {
    GESTURES.forEach((e) => removeEventListener(e, start));
    cancelIdle?.();
  };
}
