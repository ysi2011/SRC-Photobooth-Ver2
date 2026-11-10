// Pack 4: retro / social-media camera looks (whole-frame effects)
import { category, BIG, A, circle, ell, poly, rect, stroke, curve, star, heart, both, warp, glow, sparkle, T, seeded, tick, grab,
  refilter, vignette, grain, label, wash, scanlines, pixelate, posterize, sketch, halftone, stamp, dateText, timeText, speedLines } from "./fxlib.js";

// ================= Retro / social =================
const re = category("retro", "Retro Cam", "📸");

re("disposable", "Disposable Cam", {
  post: (c, w, h) => { refilter(c, w, h, "contrast(1.18) saturate(1.2) sepia(.12) brightness(1.05)"); const g = c.createRadialGradient(w / 2, h * 0.45, 20, w / 2, h / 2, w * 0.7); g.addColorStop(0, "rgba(255,245,220,.28)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h);
    vignette(c, w, h, 0.55); grain(c, w, h, 0.3); const l = c.createLinearGradient(w, 0, w * 0.8, 0); l.addColorStop(0, "rgba(255,120,30,.4)"); l.addColorStop(1, "rgba(255,120,30,0)"); c.fillStyle = l; c.fillRect(0, 0, w, h); stamp(c, w, h, `'${dateText("  ")}`); },
});
re("digicam", "Y2K Digicam", {
  post: (c, w, h) => { refilter(c, w, h, "saturate(1.5) contrast(1.15) brightness(1.1)"); const w2 = 3; c.save(); c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = w2;
    [[30, 30, 1, 1], [w - 30, 30, -1, 1], [30, h - 30, 1, -1], [w - 30, h - 30, -1, -1]].forEach(([x, y, sx, sy]) => { c.beginPath(); c.moveTo(x, y + sy * 40); c.lineTo(x, y); c.lineTo(x + sx * 40, y); c.stroke(); });
    c.strokeRect(w / 2 - 40, h / 2 - 30, 80, 60); c.restore(); label(c, "AUTO", 60, 66, 22, "#fff", "Courier New, monospace", 700); label(c, "▮▮▮▯", w - 90, 66, 22, "#fff", "Courier New, monospace", 700); label(c, "12M  ◉", w - 100, h - 72, 20, "#fff", "Courier New, monospace", 700); stamp(c, w, h, `${dateText("/")}  ${timeText().slice(0, 5)}`, "#ffb03a", 26); },
});
re("vhs", "VHS Camcorder", {
  post: (c, w, h) => { const s = grab(c), t = tick(); refilter(c, w, h, "saturate(1.35) contrast(1.1) blur(.6px)"); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "screen"; c.globalAlpha = 0.35; c.filter = "hue-rotate(60deg)"; c.drawImage(s, 5, 0); c.filter = "hue-rotate(-60deg)"; c.drawImage(s, -5, 0); c.restore();
    const y = ((t * 120) % (h + 80)) - 40; c.save(); c.globalAlpha = 0.28; c.fillStyle = "#fff"; c.fillRect(0, y, w, 26); c.restore(); scanlines(c, w, h, 0.22, 3); grain(c, w, h, 0.28);
    label(c, "● REC", 50, 52, 30, "#ff2a2a", "Courier New, monospace", 700); label(c, "PLAY ▶", 50, h - 70, 28, "#fff", "Courier New, monospace", 700, "left", "#000"); label(c, `${dateText("-")}  ${timeText()}`, w - 50, h - 70, 28, "#fff", "Courier New, monospace", 700, "right", "#000"); },
});
re("polaroid", "Polaroid", {
  post: (c, w, h) => { const s = grab(c); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = "#f4f1ea"; c.fillRect(0, 0, w, h); const m = 38, iw = w - m * 2, ih = h - m - 140; c.drawImage(s, 0, 0, w, h, m, m, iw, ih);
    c.globalCompositeOperation = "multiply"; c.fillStyle = "rgba(255,235,200,.25)"; c.fillRect(m, m, iw, ih); c.restore(); label(c, "photobooth ♡", w / 2, h - 66, 46, "#3a3a44", "'Segoe Script', 'Brush Script MT', cursive", 400, "center"); },
});
re("film", "Vintage Film", {
  post: (c, w, h) => { refilter(c, w, h, "sepia(.55) contrast(1.15) brightness(.98) saturate(.9)"); grain(c, w, h, 0.38); vignette(c, w, h, 0.65, "30,15,0"); c.save(); c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) { if (seeded(Math.floor(tick() * 10) + i) > 0.6) { const x = seeded(Math.floor(tick() * 10) * 3 + i) * w; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (seeded(i) - 0.5) * 20, h); c.stroke(); } } c.restore(); wash(c, w, h, "#fff", "overlay", 0.04 * (1 + Math.sin(tick() * 30))); },
});
re("nightclub", "Neon Nightclub", {
  post: (c, w, h) => { refilter(c, w, h, "contrast(1.2) saturate(1.5) brightness(.8)"); const t = tick(); wash(c, w, h, "#12002a", "multiply", 0.7);
    const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(255,0,200,.55)"); g.addColorStop(0.5, "rgba(120,0,255,.0)"); g.addColorStop(1, "rgba(0,220,255,.55)"); c.save(); c.globalCompositeOperation = "screen"; c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) { c.strokeStyle = ["rgba(255,0,200,.35)", "rgba(0,220,255,.35)"][i % 2]; c.lineWidth = 6; c.beginPath(); c.moveTo(w * (0.1 + i * 0.2), 0); c.lineTo(w * (0.1 + i * 0.2) + Math.sin(t * 2 + i) * 260, h); c.stroke(); } c.restore(); grain(c, w, h, 0.15); },
});
