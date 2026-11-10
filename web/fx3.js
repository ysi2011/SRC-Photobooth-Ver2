// Pack 3: beauty, fantasy + sci-fi, emotions
import { category, into, A, circle, ell, poly, rect, stroke, curve, star, heart, both, clipOval, combine, skin, tint, warp, BIG, glow, rad, lin, drop, noDrop, seeded, T, wing, sparkle, ears, pixelate, posterize,
  refilter, vignette, grain, label, wash, scanlines, tick, gemRow } from "./fxlib.js";

// ================= Beauty =================
const be = category("beauty", "Beauty", "💅");

be("glassskin", "Glass Skin", {
  draw: (c, f) => { c.save(); clipOval(c, f); c.globalCompositeOperation = "soft-light"; c.fillStyle = "#fff"; c.globalAlpha = 0.55; c.fillRect(-1, -1, 2, 2); c.globalCompositeOperation = "screen"; const a = A(f);
    [[a.nose[0], a.nose[1] - 0.2, 0.05, 0.16], [a.cL[0], a.cL[1] - 0.05, 0.1, 0.07], [a.cR[0], a.cR[1] - 0.05, 0.1, 0.07], [0, a.fore[1], 0.14, 0.06], [a.chin[0], a.chin[1] - 0.1, 0.08, 0.05]].forEach(([x, y, rx, ry]) => { c.globalAlpha = 0.35; ell(c, x, y, rx, ry, rad(c, x, y, 0.005, Math.max(rx, ry), [[0, "#fff"], [1, "rgba(255,255,255,0)"]])); }); c.restore(); },
  post: (c, w, h) => { c.save(); c.globalCompositeOperation = "soft-light"; c.globalAlpha = 0.25; c.fillStyle = "#fff4f0"; c.fillRect(0, 0, w, h); c.restore(); },
});
be("egirl", "E-Girl", {
  draw: (c, f) => { const a = A(f); c.save(); c.globalAlpha = 0.5; ell(c, 0, a.nose[1] - 0.12, 0.34, 0.08, "#ff6b9d"); c.restore();
    both((s) => { const [x, y] = s < 0 ? a.eL : a.eR; stroke(c, [[x - s * 0.12, y - 0.01], [x + s * 0.13, y - 0.04], [x + s * 0.24, y - 0.1]], "#111", 0.018); }); heart(c, a.eL[0] - 0.02, a.eL[1] + 0.13, 0.025, "#ff2e63"); star(c, a.cR[0] + 0.04, a.cR[1] - 0.04, 0.035, "#7fd7ff", 4, 0.35);
    blushRow(c, a); },
});
function blushRow(c, a) { c.save(); c.globalAlpha = 0.4; [a.cL, a.cR].forEach(([x, y]) => ell(c, x, y - 0.05, 0.1, 0.06, "#ff7ba6")); c.restore(); }
be("glitter", "Glitter", {
  draw: (c, f) => { const a = A(f), t = tick(); c.save(); glow(c, f, "#fff", 0.03);
    for (let i = 0; i < 38; i++) { const ang = seeded(i) * T, r = 0.1 + seeded(i + 40) * 0.3, [bx, by] = i % 2 ? a.eL : a.eR; const x = bx + Math.cos(ang) * r * 0.9, y = by + Math.sin(ang) * r * 0.55 + (i % 5 === 0 ? 0.2 : 0); const k = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.7); circle(c, x, y, 0.005 + k * 0.007, ["#ffe27a", "#fff", "#ff9ad5", "#9ad7ff"][i % 4]); if (k > 0.85) sparkle(c, x, y, 0.03, "#fff"); }
    c.restore(); },
});
be("y2k", "Y2K Gems", {
  draw: (c, f) => { const a = A(f); both((s) => { const [x, y] = s < 0 ? a.eL : a.eR; ell(c, x, y - 0.04, 0.14, 0.05, "rgba(130,200,255,.45)", s * 0.15); gemRow(c, [0, 1, 2, 3, 4].map((i) => [x - 0.1 + i * 0.05, y + 0.1 + Math.sin(i / 4 * Math.PI) * 0.03]), ["#9ad7ff", "#ff9ad5", "#fff", "#d7b3ff", "#ffe27a"], 0.013); butterfly(c, s * 0.4, -0.2, 0.07, s); });
    c.save(); c.globalAlpha = 0.6; ell(c, a.mouth[0], a.mouth[1], 0.1, 0.035, "#ff6fb1"); c.restore(); },
});
function butterfly(c, x, y, r, s) { c.save(); c.translate(x, y); c.rotate(s * 0.4); ell(c, -r * 0.7, -r * 0.4, r, r * 0.8, "#ff9ad5", 0.4); ell(c, r * 0.7, -r * 0.4, r, r * 0.8, "#ff9ad5", -0.4); ell(c, -r * 0.5, r * 0.5, r * 0.7, r * 0.6, "#9ad7ff", -0.3); ell(c, r * 0.5, r * 0.5, r * 0.7, r * 0.6, "#9ad7ff", 0.3); ell(c, 0, 0, r * 0.12, r * 0.8, "#4a2a60"); c.restore(); }
be("hollywood", "Old Hollywood", {
  draw: (c, f) => { const a = A(f); both((s) => { const [x, y] = s < 0 ? a.eL : a.eR; stroke(c, [[x - s * 0.12, y - 0.015], [x + s * 0.13, y - 0.045], [x + s * 0.22, y - 0.1]], "#0a0a0a", 0.02); });
    c.beginPath(); c.moveTo(a.mL[0] - 0.05, a.mouth[1]); c.quadraticCurveTo(-0.06, a.mouth[1] - 0.075, 0, a.mouth[1] - 0.04); c.quadraticCurveTo(0.06, a.mouth[1] - 0.075, a.mR[0] + 0.05, a.mouth[1]); c.quadraticCurveTo(0, a.mouth[1] + 0.1, a.mL[0] - 0.05, a.mouth[1]); c.fillStyle = "rgba(196,12,40,.85)"; c.fill(); circle(c, a.cR[0] - 0.02, a.cR[1] + 0.05, 0.01, "#201010"); },
  post: (c, w, h) => { refilter(c, w, h, "sepia(.35) contrast(1.1) saturate(1.1)"); vignette(c, w, h, 0.45); grain(c, w, h, 0.12); },
});
be("heartblush", "Heart Blush", {
  draw: (c, f) => { const a = A(f), t = tick(); [a.cL, a.cR].forEach(([x, y], i) => { c.save(); c.globalAlpha = 0.55; heart(c, x, y - 0.03, 0.07, "#ff5f8f"); c.restore(); });
    for (let i = 0; i < 5; i++) { const k = ((t * 0.4 + i * 0.2) % 1), x = (i - 2) * 0.22 + Math.sin(t + i) * 0.05; c.save(); c.globalAlpha = 1 - k; heart(c, x, f.top - 0.05 - k * 0.5, 0.04 + (i % 2) * 0.015, "#ff7aa8"); c.restore(); } },
});

// ================= Fantasy =================
const fa = category("fantasy", "Sci-Fi & Fantasy", "🧚");

fa("fairywings", "Fairy Wings", {
  z: 0,
  pre: (c, f) => { both((s) => { c.save(); c.globalAlpha = 0.85; wing(c, s, s * 0.4, f.chin + 0.3, "rgba(190,240,255,.65)", "#fff", 0.95, -0.25); wing(c, s, s * 0.4, f.chin + 0.45, "rgba(255,200,240,.6)", "#fff", 0.6, 0.2); c.restore(); }); },
  draw: (c, f) => { const t = tick(); for (let i = 0; i < 16; i++) { const k = (t * 0.3 + seeded(i)) % 1; sparkle(c, (seeded(i + 5) - 0.5) * 1.6, 0.8 - k * 1.6, 0.025, `rgba(255,240,170,${1 - k})`); } },
});
fa("elf", "Forest Elf", {
  draw: (c, f) => { const a = A(f); tint(c, f, "#f0d9a8", 0.2);
    both((s) => { const [x, y] = s < 0 ? a.tL : a.tR; poly(c, [[x, y - 0.06], [x + s * 0.4, y - 0.38], [x + s * 0.06, y + 0.14]], "#e0b88e", "#b08560", 0.008); poly(c, [[x + s * 0.02, y - 0.02], [x + s * 0.28, y - 0.27], [x + s * 0.03, y + 0.07]], "#f0c0a0"); });
    for (let i = -4; i <= 4; i++) { c.save(); c.translate(i * 0.12, f.top + 0.03 - Math.cos(i * 0.4) * 0.03); c.rotate(i * 0.18 + 0.4); ell(c, 0, -0.06, 0.04, 0.09, i % 2 ? "#4a9a3a" : "#68b84a", 0, "#2c6a22", 0.005); c.restore(); } },
});
fa("unicorn", "Unicorn", {
  draw: (c, f) => { const [x, y] = f.M([0, f.top + 0.06]); poly(c, [[x - 0.07, y], [x, y - 0.5], [x + 0.07, y]], "#fff1b8", "#d9b64a", 0.008); for (let i = 1; i < 5; i++) stroke(c, [[x - 0.07 + i * 0.012, y - i * 0.09], [x + 0.07 - i * 0.012, y - i * 0.09 + 0.03]], "#e0b64a", 0.012);
    ears("point", "#fff", "#ffc4e1", { x: 0.2, w: 0.09, h: 0.2, tilt: 0.2 })(c, f);
    ["#ff9ad5", "#9ad7ff", "#d7b3ff"].forEach((col, i) => both((s) => { c.save(); c.translate(s * (0.42 + i * 0.02), f.top + 0.1 + i * 0.12); ell(c, 0, 0.1, 0.07, 0.2, col, s * 0.2); c.restore(); })); },
});
fa("icequeen", "Ice Queen", {
  draw: (c, f) => { tint(c, f, "#cfe8ff", 0.45); const [x, y] = f.M([0, f.top + 0.03]); glow(c, f, "#8fd3ff", 0.05);
    [[-0.3, 0.18], [-0.2, 0.3], [-0.1, 0.42], [0, 0.5], [0.1, 0.42], [0.2, 0.3], [0.3, 0.18]].forEach(([dx, h], i) => poly(c, [[x + dx - 0.045, y], [x + dx, y - h], [x + dx + 0.045, y]], "rgba(200,235,255,.9)", "#fff", 0.006)); noDrop(c);
    const t = tick(); for (let i = 0; i < 18; i++) { const k = (t * 0.2 + seeded(i)) % 1; star(c, (seeded(i + 3) - 0.5) * 1.8 + Math.sin(t + i) * 0.05, -0.9 + k * 2.1, 0.02 + seeded(i + 9) * 0.02, "rgba(255,255,255,.9)", 6, 0.3); } },
});
fa("fire", "Fire Powers", {
  draw: (c, f) => { const t = tick(); c.save(); glow(c, f, "#ff7a1a", 0.12);
    for (let i = 0; i < 18; i++) { const ang = Math.PI * (1.05 + (i / 17) * 0.9) , bx = Math.cos(ang) * 0.58, by = 0.1 + Math.sin(ang) * 0.75, h = 0.22 + 0.1 * Math.sin(t * 9 + i * 2), a2 = ang + Math.sin(t * 6 + i) * 0.12;
      c.beginPath(); c.moveTo(bx - 0.05, by); c.quadraticCurveTo(bx - 0.06 + Math.cos(a2) * h * 0.4, by + Math.sin(a2) * h * 0.6, bx + Math.cos(a2) * h, by + Math.sin(a2) * h); c.quadraticCurveTo(bx + 0.06, by + Math.sin(a2) * h * 0.3, bx + 0.05, by); c.fillStyle = i % 2 ? "#ff7a1a" : "#ffc233"; c.fill(); }
    c.restore(); const a = A(f); [a.eL, a.eR].forEach(([x, y]) => { c.save(); glow(c, f, "#ff5a00", 0.09); circle(c, x, y, 0.042, "#ffb347"); c.restore(); }); },
});
fa("galaxy", "Galaxy Skin", {
  draw: (c, f) => { c.save(); clipOval(c, f); c.globalCompositeOperation = "color"; c.globalAlpha = 0.85; c.fillStyle = lin(c, -0.4, -0.5, 0.4, 0.8, [[0, "#3a1d8f"], [0.5, "#c23cc8"], [1, "#2a6bd6"]]); c.fillRect(-1, -1, 2, 2);
    c.globalCompositeOperation = "screen"; const t = tick(); for (let i = 0; i < 50; i++) { const k = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)); circle(c, (seeded(i) - 0.5) * 1.1, -0.5 + seeded(i + 60) * 1.4, 0.004 + seeded(i + 20) * 0.007, `rgba(255,255,255,${k})`); }
    [[-0.2, 0.2, "#ff5fd2"], [0.2, -0.1, "#5fa8ff"]].forEach(([x, y, col]) => { c.globalAlpha = 0.25; ell(c, x, y, 0.28, 0.16, col, 0.5); }); c.restore(); },
});
fa("lightning", "Lightning Eyes", {
  draw: (c, f) => { const a = A(f), t = Math.floor(tick() * 14); c.save(); glow(c, f, "#8fe0ff", 0.1); c.lineCap = "round"; c.lineJoin = "round";
    [a.eL, a.eR].forEach(([x, y], k) => { circle(c, x, y, 0.05, "#e8fbff"); for (let b = 0; b < 3; b++) { c.beginPath(); let px = x, py = y; c.moveTo(px, py); const dir = (k ? 1 : -1) * (0.6 + b * 0.5) + (b - 1) * 0.5; for (let j = 1; j <= 6; j++) { px += Math.cos(dir) * 0.09 + (seeded(t + j + b * 7 + k * 31) - 0.5) * 0.08; py += Math.sin(dir) * 0.09 + (seeded(t + j * 3 + b) - 0.5) * 0.08 - 0.01; c.lineTo(px, py); } c.strokeStyle = b ? "#8fe0ff" : "#fff"; c.lineWidth = b ? 0.012 : 0.02; c.stroke(); } });
    c.restore(); },
});

// ================= Sci-fi =================
const sf = into("fantasy");

sf("alien", "Grey Alien", {
  morph: warp({ at: [0, -0.2], r: [0.42, 0.3], scale: [0.35, 0.35] }, { at: [0, 0.7], r: [0.3, 0.22], scale: [-0.35, -0.25] }),
  draw: (c, f) => { const a = A(f); tint(c, f, "#b4c0c8", 0.85);
    both((s) => { const [x, y] = s < 0 ? a.eL : a.eR; c.save(); c.translate(x, y); c.rotate(s * 0.4); drop(c, f, 0.3); ell(c, 0, 0, 0.1, 0.17, "#05060a"); noDrop(c); ell(c, -0.03, -0.06, 0.025, 0.04, "rgba(255,255,255,.55)"); c.restore(); });
    both((s) => ell(c, a.nose[0] + s * 0.02, a.nose[1] - 0.02, 0.008, 0.016, "#5a666e")); stroke(c, [[a.mouth[0] - 0.05, a.mouth[1]], [a.mouth[0] + 0.05, a.mouth[1]]], "#5a666e", 0.01); },
});
sf("astronaut", "Astronaut", {
  z: 3,
  draw: (c, f) => { c.save(); c.beginPath(); c.arc(0, 0.12, 0.74, 0, T); c.arc(0, 0.12, 0.6, 0, T, true); c.fillStyle = lin(c, -0.7, -0.5, 0.7, 0.7, [[0, "#fff"], [0.5, "#dfe4ea"], [1, "#a8b0bb"]]); c.fill("evenodd"); c.restore();
    c.save(); c.beginPath(); c.arc(0, 0.12, 0.6, 0, T); c.clip(); c.fillStyle = "rgba(120,170,255,.16)"; c.fillRect(-1, -1, 2, 2); c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 0.03; c.lineCap = "round"; c.beginPath(); c.arc(0, 0.12, 0.5, Math.PI * 1.12, Math.PI * 1.45); c.stroke(); c.restore();
    c.beginPath(); c.arc(0, 0.12, 0.74, 0, T); c.strokeStyle = "#8b94a2"; c.lineWidth = 0.014; c.stroke();
    rect(c, 0.58, -0.18, 0.1, 0.18, "#c33", null, 0, 0.02); stroke(c, [[0.42, f.chin + 0.35], [0.5, 1.2]], "#8b94a2", 0.03); },
});
sf("cyborg", "Cyborg", {
  draw: (c, f) => { const a = A(f); c.save(); clipOval(c, f); c.beginPath(); c.rect(-1, -1, 1, 2); c.clip(); c.fillStyle = lin(c, -0.5, -0.4, 0, 0.8, [[0, "#c9d1da"], [0.5, "#8c96a3"], [1, "#59626e"]]); c.globalAlpha = 0.93; c.fillRect(-1, -1, 1, 2); c.globalAlpha = 1;
    c.strokeStyle = "rgba(30,36,44,.8)"; c.lineWidth = 0.01; stroke(c, [[-0.5, -0.2], [-0.1, -0.2], [-0.05, 0.1]], "rgba(30,36,44,.8)", 0.01); stroke(c, [[-0.5, 0.35], [-0.2, 0.35], [-0.12, 0.6]], "rgba(30,36,44,.8)", 0.01); stroke(c, [[-0.03, -0.4], [-0.03, 0.8]], "rgba(30,36,44,.8)", 0.012);
    [[-0.4, -0.1], [-0.3, 0.3], [-0.14, 0.5]].forEach(([x, y]) => circle(c, x, y, 0.012, "#333")); c.restore();
    c.save(); glow(c, f, "#ff2a2a", 0.09); circle(c, a.eL[0], a.eL[1], 0.07, "#1a0505", "#ff2a2a", 0.012); circle(c, a.eL[0], a.eL[1], 0.025, "#ff4a4a"); c.restore(); },
});
sf("laser", "Laser Eyes", {
  draw: (c, f) => { const a = A(f), flick = 0.75 + 0.25 * Math.sin(tick() * 40); c.save(); c.lineCap = "round";
    [[a.eL, -1], [a.eR, 1]].forEach(([[x, y], s]) => { glow(c, f, "#ff1a1a", 0.14); c.strokeStyle = `rgba(255,40,40,${flick})`; c.lineWidth = 0.05; c.beginPath(); c.moveTo(x, y); c.lineTo(x + s * 4, y + 0.55 * 4 * 0.12 - 0.2); c.stroke(); c.shadowBlur = 0; c.strokeStyle = "#fff"; c.lineWidth = 0.016; c.stroke(); circle(c, x, y, 0.05, "#ffdede"); });
    c.restore(); },
});
sf("hologram", "Hologram", {
  draw: (c, f) => { c.save(); clipOval(c, f); c.globalCompositeOperation = "color"; c.globalAlpha = 0.9; c.fillStyle = "#19e3ff"; c.fillRect(-1, -1, 2, 2); c.globalCompositeOperation = "screen"; c.globalAlpha = 0.5; const t = tick();
    for (let y = -0.5; y < 0.9; y += 0.035) { c.fillStyle = `rgba(120,255,255,${0.15 + 0.15 * Math.sin(y * 60 + t * 6)})`; c.fillRect(-0.6, y, 1.2, 0.012); } c.restore();
    c.save(); glow(c, f, "#19e3ff", 0.07); c.beginPath(); f.oval.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.strokeStyle = "rgba(120,255,255,.9)"; c.lineWidth = 0.012; c.stroke(); c.restore(); },
  post: (c, w, h) => { scanlines(c, w, h, 0.12, 4); wash(c, w, h, "#0a3a5a", "multiply", 0.25); },
});
sf("glitch", "Glitch", {
  post: (c, w, h) => { const s = refSnap(c); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const t = Math.floor(tick() * 12);
    for (let i = 0; i < 7; i++) { const y = seeded(t * 7 + i) * h, hh = 10 + seeded(t * 3 + i) * 60, dx = (seeded(t * 5 + i) - 0.5) * 80; c.drawImage(s, 0, y, w, hh, dx, y, w, hh); }
    c.globalCompositeOperation = "screen"; c.globalAlpha = 0.35; c.filter = "hue-rotate(90deg)"; c.drawImage(s, 6, 0); c.filter = "hue-rotate(-90deg)"; c.drawImage(s, -6, 0); c.restore(); scanlines(c, w, h, 0.1); },
});
import { grab } from "./fxlib.js";
const refSnap = (c) => grab(c);

// ================= Emotions =================
const em = into("distort");

em("hearteyes", "Heart Eyes", {
  draw: (c, f) => { const a = A(f), k = 1 + 0.15 * Math.sin(tick() * 8); [a.eL, a.eR].forEach(([x, y]) => { c.save(); glow(c, f, "#ff2e63", 0.06); heart(c, x, y - 0.01, 0.07 * k, "#ff2e63"); c.restore(); heart(c, x - 0.025, y - 0.04, 0.012, "rgba(255,255,255,.7)"); });
    for (let i = 0; i < 6; i++) { const t = (tick() * 0.35 + i / 6) % 1; c.save(); c.globalAlpha = 1 - t; heart(c, Math.sin(i * 2.1 + tick()) * 0.5, f.top - t * 0.6, 0.04, "#ff5f8f"); c.restore(); } },
});
em("dollar", "Dollar Eyes", {
  draw: (c, f) => { const a = A(f), t = tick(); [a.eL, a.eR].forEach(([x, y]) => { circle(c, x, y, 0.1, "#fff", "#1c7a35", 0.012); label(c, "$", x, y + 0.005, 0.16, "#1fae45", "Inter, sans-serif", 900, "center"); });
    for (let i = 0; i < 8; i++) { const k = (t * 0.4 + i / 8) % 1; c.save(); c.globalAlpha = 1 - k; label(c, "$", (seeded(i) - 0.5) * 1.3, 0.9 - k * 1.3, 0.1, "#ffd23a", "Inter", 900, "center"); c.restore(); } },
});
em("cry", "Crying Waterfalls", {
  draw: (c, f) => { const a = A(f), t = tick(); [a.eL, a.eR].forEach(([x, y], i) => { c.save(); c.globalAlpha = 0.8; c.beginPath(); c.moveTo(x - 0.03, y + 0.04); c.bezierCurveTo(x - 0.1, y + 0.4, x - 0.05, y + 0.8, x - 0.07, 1.4); c.lineTo(x + 0.09, 1.4); c.bezierCurveTo(x + 0.06, y + 0.8, x + 0.12, y + 0.4, x + 0.05, y + 0.04); c.closePath(); c.fillStyle = lin(c, 0, y, 0, 1.4, [[0, "rgba(120,200,255,.85)"], [1, "rgba(80,150,255,.35)"]]); c.fill(); c.restore();
      for (let j = 0; j < 4; j++) { const k = (t * 0.8 + j / 4 + i * 0.3) % 1; ell(c, x + 0.01, y + 0.1 + k * 1.1, 0.012, 0.025, "rgba(255,255,255,.8)"); } stroke(c, [[x - s0(i) * 0.1, y - 0.14], [x + s0(i) * 0.14, y - 0.08]], "#2a1c14", 0.02); }); },
});
const s0 = (i) => (i ? 1 : -1);
em("angry", "Angry", {
  draw: (c, f) => { const a = A(f), t = tick(); tint(c, f, "#ff3030", 0.5);
    both((s) => { stroke(c, [[s * 0.05, -0.1], [s * 0.2, -0.17], [s * 0.36, -0.28]], "#1a0808", 0.05); });
    stroke(c, [[0.08, -0.34], [0.14, -0.3], [0.1, -0.26], [0.16, -0.22]], "rgba(120,0,0,.9)", 0.012);
    [a.tL, a.tR].forEach(([x, y], i) => { for (let j = 0; j < 4; j++) { const k = (t * 0.9 + j / 4) % 1; c.save(); c.globalAlpha = 1 - k; circle(c, x + (i ? 1 : -1) * (0.05 + k * 0.1), y - 0.1 - k * 0.5, 0.05 + k * 0.08, "#fff"); c.restore(); } }); },
});
em("spiral", "Hypnotized", {
  draw: (c, f) => { const a = A(f), t = tick(); [a.eL, a.eR].forEach(([x, y]) => { circle(c, x, y, 0.11, "#fff", "#111", 0.012); c.save(); c.translate(x, y); c.rotate(t * 5); c.beginPath(); for (let i = 0; i < 90; i++) { const r = (i / 90) * 0.1, ang = (i / 90) * 4 * T; c.lineTo(Math.cos(ang) * r, Math.sin(ang) * r); } c.strokeStyle = "#111"; c.lineWidth = 0.014; c.stroke(); c.restore(); }); },
});
