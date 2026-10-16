/**
 * Écrans des trois invitations montrées par le téléphone du héro, dessinés sur un
 * canvas 2D (aucune image à télécharger). Couleurs : palettes Karakou, baie d'Alger.
 */
export const SCREEN_W = 540;
export const SCREEN_H = 1140;

export type ScreenText = {
  lang: "fr" | "ar";
  date: Date;
};

function roundRect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

const fmt = (d: Date, lang: "fr" | "ar") =>
  d.toLocaleDateString(lang === "ar" ? "ar-DZ-u-nu-latn" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export function drawScreen(g: CanvasRenderingContext2D, index: number, { lang, date }: ScreenText) {
  const ar = lang === "ar";
  const W = SCREEN_W;
  const H = SCREEN_H;
  const display = ar ? '700 64px "Reem Kufi", sans-serif' : '64px "Marcellus", serif';
  const body = ar ? "500 30px Tajawal, sans-serif" : "500 28px Tajawal, sans-serif";
  g.save();
  g.clearRect(0, 0, W, H);
  g.textAlign = "center";
  g.direction = ar ? "rtl" : "ltr";

  if (index === 0) {
    // Mariage · Karakou : velours bordeaux, or fetla
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#4D1919");
    gr.addColorStop(1, "#381111");
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    g.strokeStyle = "#B49068";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(70, H - 120);
    g.lineTo(70, 360);
    g.arc(W / 2, 360, W / 2 - 70, Math.PI, 0);
    g.lineTo(W - 70, H - 120);
    g.stroke();
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(90, H - 140);
    g.lineTo(90, 370);
    g.arc(W / 2, 370, W / 2 - 90, Math.PI, 0);
    g.lineTo(W - 90, H - 140);
    g.stroke();
    g.save();
    g.translate(W / 2, 250);
    g.lineWidth = 2;
    for (let k = 0; k < 2; k++) {
      g.save();
      g.rotate((k * Math.PI) / 4);
      g.strokeRect(-34, -34, 68, 68);
      g.restore();
    }
    g.restore();
    g.fillStyle = "#E3D3C2";
    g.font = "500 28px Tajawal, sans-serif";
    g.fillText("بسم الله الرحمن الرحيم", W / 2, 390);
    g.fillStyle = "#F6EDE3";
    g.font = display;
    g.fillText(ar ? "أمين" : "Amine", W / 2, 520);
    g.fillStyle = "#B49068";
    g.font = '44px "Marcellus", serif';
    g.fillText(ar ? "و" : "&", W / 2, 590);
    g.fillStyle = "#F6EDE3";
    g.font = display;
    g.fillText(ar ? "سارة" : "Sara", W / 2, 680);
    g.fillStyle = "#E3D3C2";
    g.font = body;
    g.fillText(fmt(date, lang), W / 2, 770);
    g.fillText(ar ? "قاعة الجزيرة · 19:00" : "Salle El Djazira · 19h00", W / 2, 815);
    roundRect(g, 150, 900, 240, 64, 32);
    g.fillStyle = "#B49068";
    g.fill();
    g.fillStyle = "#381111";
    g.font = "700 26px Tajawal, sans-serif";
    g.fillText(ar ? "أؤكّد حضوري" : "Je confirme", W / 2, 942);
  } else if (index === 1) {
    // Anniversaire · Ciel
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#A8C7DE");
    gr.addColorStop(1, "#EEF5FB");
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#fff";
    for (const [x, y, r] of [
      [120, 220, 60],
      [180, 200, 50],
      [400, 300, 70],
      [460, 290, 50],
      [350, 960, 80],
      [420, 950, 60],
    ]) {
      g.beginPath();
      g.arc(x, y, r, 0, 7);
      g.fill();
    }
    g.fillStyle = "#274958";
    g.font = ar ? '700 58px "Reem Kufi", sans-serif' : 'italic 60px "Marcellus", serif';
    g.fillText(ar ? "عيد ميلاد سعيد" : "Joyeux anniversaire", W / 2, 260);
    roundRect(g, 110, 360, 320, 300, 26);
    g.fillStyle = "#045588";
    g.fill();
    g.fillStyle = "#fff";
    g.font = "700 30px Tajawal, sans-serif";
    g.fillText(date.toLocaleDateString(ar ? "ar-DZ" : "fr-FR", { month: "long" }), W / 2, 410);
    g.font = "500 22px Tajawal, sans-serif";
    g.direction = "ltr";
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 7; c++) {
        const n = r * 7 + c + 1;
        g.fillStyle = n === ((date.getDate() - 1) % 28) + 1 ? "#DB7456" : "#D2DBDE";
        g.fillText(String(n), 150 + c * 40, 460 + r * 50);
      }
    g.direction = ar ? "rtl" : "ltr";
    g.fillStyle = "#274958";
    g.font = ar ? '700 70px "Reem Kufi", sans-serif' : '70px "Marcellus", serif';
    g.fillText(ar ? "لينا" : "Lina", W / 2, 760);
    g.fillStyle = "#4F8DBB";
    g.font = body;
    g.fillText(ar ? "افتحي هديتك في الأسفل" : "Ouvre ton cadeau en bas", W / 2, 830);
    g.fillStyle = "#4F8DBB";
    g.fillRect(220, 880, 100, 80);
    g.fillStyle = "#DB7456";
    g.fillRect(262, 880, 16, 80);
    g.fillRect(210, 868, 120, 20);
  } else {
    // Naissance · Baie d'Alger
    g.fillStyle = "#F7F9FA";
    g.fillRect(0, 0, W, H);
    const sea = g.createLinearGradient(0, 520, 0, H);
    sea.addColorStop(0, "#A8C7DE");
    sea.addColorStop(1, "#4F8DBB");
    g.fillStyle = "#D2DBDE";
    g.beginPath();
    g.arc(W / 2, 400, 170, 0, 7);
    g.fill();
    g.fillStyle = "#FFFFFF";
    g.beginPath();
    g.arc(W / 2 - 55, 350, 40, 0, 7);
    g.fill();
    g.fillStyle = "#274958";
    g.font = body;
    g.fillText(ar ? "بكل فرح نعلن عن قدوم" : "Avec joie, nous accueillons", W / 2, 680);
    g.fillStyle = "#045588";
    g.font = ar ? '700 76px "Reem Kufi", sans-serif' : '78px "Marcellus", serif';
    g.fillText(ar ? "يانيس" : "Yanis", W / 2, 790);
    g.fillStyle = "#274958";
    g.font = body;
    g.fillText(`${ar ? "العقيقة" : "Aqiqa"} · ${fmt(date, lang)}`, W / 2, 860);
    roundRect(g, 150, 930, 240, 60, 30);
    g.strokeStyle = "#045588";
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = "#045588";
    g.font = "700 24px Tajawal, sans-serif";
    g.fillText(ar ? "اتركوا أمنية" : "Laisser un vœu", W / 2, 968);
    g.fillStyle = sea;
    g.globalAlpha = 0.35;
    g.beginPath();
    g.moveTo(0, 1040);
    g.quadraticCurveTo(W / 4, 1010, W / 2, 1040);
    g.quadraticCurveTo((3 * W) / 4, 1070, W, 1040);
    g.lineTo(W, H);
    g.lineTo(0, H);
    g.fill();
    g.globalAlpha = 1;
  }
  g.fillStyle = index === 0 ? "rgba(246,237,227,.8)" : "rgba(39,73,88,.7)";
  g.font = "600 22px Tajawal, sans-serif";
  g.textAlign = "left";
  g.direction = "ltr";
  g.fillText("19:00", 40, 50);
  roundRect(g, W / 2 - 70, H - 34, 140, 8, 4);
  g.fill();
  g.restore();
}
