"use client";

import { useEffect } from "react";

/**
 * Sections qui apparaissent au scroll. Le contenu reste visible si JS ou
 * IntersectionObserver manquent, ou si l'utilisateur demande moins de mouvement.
 */
export function useReveal(root: React.RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const el = root.current;
    if (!el || !active) return;
    const items = [...el.querySelectorAll<HTMLElement>(".inv-reveal")];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove("is-pre");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const item of items) {
      const rect = item.getBoundingClientRect();
      if (rect.top > innerHeight) {
        item.classList.add("is-pre");
        io.observe(item);
      }
    }
    return () => io.disconnect();
  }, [root, active]);
}
