"use client";

import type { Lang } from "./config";
import { formatHijri, formatLongDate, formatTime } from "./dates";
import type { T } from "./i18n";
import type { ThemeDefinition } from "./theme";
import type { InvitationViewModel } from "./types";
import { BASMALA } from "./verses";

const W = 1080;
const H = 1350;

/** Police réduite jusqu'à ce que le texte tienne dans la largeur. */
function fit(
  g: CanvasRenderingContext2D,
  text: string,
  size: number,
  family: string,
  maxWidth: number,
) {
  let px = size;
  g.font = `${px}px ${family}`;
  while (px > 40 && g.measureText(text).width > maxWidth) {
    px -= 4;
    g.font = `${px}px ${family}`;
  }
}

function wrap(g: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * « Version image » : carte PNG 1080×1350 (format WhatsApp) avec noms, date, hégire,
 * lieu et QR code vers l'invitation, pour les personnes âgées.
 * `fonts` : familles CSS réelles des polices (lues sur l'élément qui porte les variables).
 */
export async function renderImageCard(input: {
  vm: InvitationViewModel;
  theme: ThemeDefinition;
  lang: Lang;
  link: string;
  t: T;
  fonts: { display: string; body: string; script: string };
}): Promise<Blob> {
  const { vm, theme, lang, link, t, fonts } = input;
  const p =
    theme.palettes[(vm.config as { variant?: string }).variant ?? theme.defaultPalette] ??
    theme.palettes[theme.defaultPalette];
  await document.fonts?.ready;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d")!;
  g.direction = lang === "ar" ? "rtl" : "ltr";
  g.textAlign = "center";

  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, p.ground);
  grad.addColorStop(1, p.groundDeep);
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);

  // Cadre en arche.
  g.strokeStyle = p.accent;
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(90, H - 70);
  g.lineTo(90, 470);
  g.arc(W / 2, 470, W / 2 - 90, Math.PI, 0);
  g.lineTo(W - 90, H - 70);
  g.closePath();
  g.stroke();

  let y = 200;
  const center = W / 2;
  if (vm.config.basmala) {
    g.fillStyle = p.accent;
    g.font = `44px ${fonts.script}`;
    g.fillText(BASMALA, center, y);
    y += 90;
  }
  const hosts = vm.config.hosts?.[lang];
  if (hosts) {
    g.fillStyle = p.soft;
    g.font = `34px ${fonts.display}`;
    for (const line of wrap(g, hosts, W - 280).slice(0, 3)) {
      g.fillText(line, center, y);
      y += 48;
    }
    y += 30;
  }
  g.fillStyle = p.bright;
  fit(g, vm.config.names.first[lang], lang === "ar" ? 110 : 128, fonts.script, W - 260);
  g.fillText(vm.config.names.first[lang], center, y + 100);
  y += 160;
  if (vm.config.names.second) {
    g.fillStyle = p.accent;
    g.font = `60px ${fonts.display}`;
    g.fillText(t("and"), center, y + 20);
    g.fillStyle = p.bright;
    fit(g, vm.config.names.second[lang], lang === "ar" ? 110 : 128, fonts.script, W - 260);
    g.fillText(vm.config.names.second[lang], center, y + 150);
    y += 200;
  }
  const first = vm.events[0];
  if (first) {
    y += 40;
    g.fillStyle = p.bright;
    g.font = `bold 44px ${fonts.body}`;
    g.fillText(
      `${formatLongDate(first.startsAt, lang)} · ${formatTime(first.startsAt, lang)}`,
      center,
      y,
    );
    const hijri = formatHijri(first.startsAt, lang);
    g.fillStyle = p.accent;
    g.font = `34px ${fonts.body}`;
    if (hijri) g.fillText(t("hijri", { date: hijri }), center, (y += 56));
    g.fillStyle = p.soft;
    g.font = `38px ${fonts.body}`;
    const place = [first.venueName, first.address].filter(Boolean).join(" — ");
    for (const line of wrap(g, place, W - 280).slice(0, 2)) g.fillText(line, center, (y += 58));
  }

  // QR code vers l'invitation.
  const QR = await import("qrcode");
  const qr = document.createElement("canvas");
  await QR.toCanvas(qr, link, {
    width: 240,
    margin: 1,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
  const qy = Math.min(H - 330, y + 50);
  g.fillStyle = "#FFFFFF";
  g.fillRect(center - 130, qy - 10, 260, 260);
  g.drawImage(qr, center - 120, qy);
  g.fillStyle = p.soft;
  g.font = `30px ${fonts.body}`;
  g.fillText(t("rsvpCta"), center, qy + 300);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("png"))), "image/png"),
  );
}
