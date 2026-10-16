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
