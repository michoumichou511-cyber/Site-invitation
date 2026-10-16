"use client";

type Petal = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  vr: number;
  s: number;
  c: string;
};

/** Pétales / paillettes en canvas 2D. Rien ne s'anime si l'utilisateur demande moins de mouvement. */
export function createConfetti(canvas: HTMLCanvasElement, colors: string[]) {
  const cx = canvas.getContext("2d");
  let petals: Petal[] = [];
  let running = false;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Téléphones modestes : moins de pétales.
  const cores = navigator.hardwareConcurrency ?? 4;
  const count = cores <= 4 ? 40 : 70;

  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    cx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener("resize", size);

  const draw = () => {
    if (!cx) return;
    cx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of petals) {
      p.vy += 0.18;
      p.vx *= 0.99;
      p.x += p.vx + Math.sin(p.y / 40);
      p.y += p.vy * 0.6;
      p.r += p.vr;
      cx.save();
      cx.translate(p.x, p.y);
      cx.rotate(p.r);
      cx.fillStyle = p.c;
      cx.beginPath();
      cx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, 7);
      cx.fill();
      cx.restore();
    }
    petals = petals.filter((p) => p.y < innerHeight + 30);
    if (petals.length) requestAnimationFrame(draw);
    else {
      running = false;
      cx.clearRect(0, 0, innerWidth, innerHeight);
    }
  };

  return {
    burst(originY = 0.45) {
      if (reduce || !cx) return;
      for (let i = 0; i < count; i++) {
        petals.push({
          x: innerWidth / 2 + (Math.random() - 0.5) * 120,
          y: innerHeight * originY,
          vx: (Math.random() - 0.5) * 7,
          vy: -Math.random() * 9 - 3,
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.2,
          s: 6 + Math.random() * 7,
          c: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      if (!running) {
        running = true;
        requestAnimationFrame(draw);
      }
    },
    destroy() {
      removeEventListener("resize", size);
      petals = [];
    },
  };
}
