// Pack 1: characters, animals, memes
import { category, A, circle, ell, poly, rect, stroke, curve, star, heart, both, clipOval, combine, skin, tint, warp, ears, snout, whiskers, stripes, blush, glow, rad, lin, drop, noDrop, seeded, T,
  refilter, vignette, grain, label, speedLines, wash, sparkle } from "./fxlib.js";

// ================= Characters =================
const ch = category("chars", "Characters", "🧌");

ch("gru", "Gru", {
  morph: warp({ at: [0, 0.3], r: [0.16, 0.2], push: [0, 0.05], scale: [0.9, 0.9] }),
  draw: (c, f) => { const a = A(f);
    tint(c, f, "#e8d9c6", 0.55);
    ell(c, 0, f.top - 0.12, 0.54, 0.36, "#eadbc8");
    both((s) => { stroke(c, [[s * 0.07, -0.16], [s * 0.2, -0.2], [s * 0.34, -0.12]], "#1a1410", 0.05); });
    ell(c, a.nose[0], a.nose[1] - 0.02, 0.09, 0.12, "rgba(210,160,140,.55)"); },
});
ch("mike", "Mike Wazowski", {
  draw: (c, f) => { const a = A(f); tint(c, f, "#74d44c", 0.9);
    both((s) => poly(c, [[s * 0.12, f.top + 0.05], [s * 0.2, f.top - 0.17], [s * 0.27, f.top + 0.06]], "#f3efe0", "#b8b098", 0.008));
    drop(c, f, 0.35); circle(c, 0, -0.02, 0.31, "#fff", "#4a9a2e", 0.02); noDrop(c);
    circle(c, 0, 0, 0.14, "#3fa83a"); circle(c, 0, 0, 0.07, "#0a0f08"); circle(c, -0.03, -0.035, 0.022, "#fff");
    const [mx, my] = a.mouth; c.beginPath(); c.moveTo(mx - 0.2, my - 0.03); c.quadraticCurveTo(mx, my + 0.28, mx + 0.2, my - 0.03); c.quadraticCurveTo(mx, my + 0.06, mx - 0.2, my - 0.03); c.fillStyle = "#4a1020"; c.fill();
    c.save(); c.clip(); c.fillStyle = "#fff"; c.fillRect(mx - 0.2, my - 0.04, 0.4, 0.07); c.restore(); },
});
ch("stitch", "Stitch", {
  draw: (c, f) => { const a = A(f); tint(c, f, "#5b94e6", 0.85);
    both((s) => { const [x, y] = s < 0 ? a.tL : a.tR; poly(c, [[x, y + 0.1], [x + s * 0.5, y - 0.38], [x + s * 0.4, y + 0.05], [x + s * 0.12, y + 0.3]], "#3d6fc9", "#27498f", 0.01); poly(c, [[x + s * 0.08, y + 0.08], [x + s * 0.38, y - 0.24], [x + s * 0.3, y + 0.04]], "#e7a8c8"); });
    both((s) => ell(c, s * 0.2, 0, 0.085, 0.125, "#0a0a10", s * 0.25)); [-1, 1].forEach((s) => circle(c, s * 0.2 - 0.025, -0.04, 0.02, "#fff"));
    ell(c, a.nose[0], a.nose[1] - 0.05, 0.075, 0.05, "#14141c"); },
});
ch("yoda", "Yoda", {
  draw: (c, f) => { const a = A(f); tint(c, f, "#a8c883", 0.8);
    both((s) => { const [x, y] = s < 0 ? a.tL : a.tR; poly(c, [[x, y - 0.08], [x + s * 0.55, y - 0.2], [x + s * 0.5, y - 0.1], [x + s * 0.12, y + 0.14]], "#97b872", "#6d8c4e", 0.01); poly(c, [[x + s * 0.08, y - 0.04], [x + s * 0.42, y - 0.15], [x + s * 0.1, y + 0.06]], "#c7a07c"); });
    for (let i = 0; i < 3; i++) stroke(c, [[-0.2, -0.3 + i * 0.045], [0, -0.32 + i * 0.045], [0.2, -0.3 + i * 0.045]], "rgba(70,100,45,.6)", 0.012);
    for (let i = 0; i < 5; i++) stroke(c, [[(i - 2) * 0.04, f.top], [(i - 2) * 0.06, f.top - 0.1]], "#ece6d6", 0.014); },
});
ch("vader", "Darth Vader", {
  z: 3,
  draw: (c, f) => { const a = A(f); drop(c, f, 0.5);
    c.beginPath(); c.moveTo(-0.58, 0.45); c.bezierCurveTo(-0.72, -0.7, 0.72, -0.7, 0.58, 0.45); c.quadraticCurveTo(0.5, 0.95, 0, 1.02); c.quadraticCurveTo(-0.5, 0.95, -0.58, 0.45);
    c.fillStyle = lin(c, -0.6, 0, 0.6, 0, [[0, "#0a0a0d"], [0.35, "#2a2a32"], [0.5, "#17171c"], [1, "#050507"]]); c.fill(); noDrop(c);
    c.fillStyle = "rgba(255,255,255,.18)"; c.beginPath(); c.ellipse(-0.18, -0.38, 0.12, 0.2, 0.5, 0, T); c.fill();
    both((s) => { c.save(); c.translate(s * 0.2, 0.02); c.rotate(s * 0.25); ell(c, 0, 0, 0.17, 0.1, "#05050a", 0, "#2a2a32", 0.014); ell(c, -0.04, -0.03, 0.05, 0.02, "rgba(255,255,255,.35)"); c.restore(); });
    poly(c, [[-0.05, 0.2], [0.05, 0.2], [0.08, 0.36], [-0.08, 0.36]], "#0c0c10", "#2a2a32", 0.01);
    rect(c, -0.15, a.mouth[1] - 0.08, 0.3, 0.2, "#16161b", "#34343c", 0.012, 0.03); for (let i = -2; i <= 2; i++) stroke(c, [[i * 0.055, a.mouth[1] - 0.06], [i * 0.055, a.mouth[1] + 0.1]], "#3a3a44", 0.01);
    circle(c, -0.06, a.mouth[1] + 0.24, 0.018, "#d22"); circle(c, 0.0, a.mouth[1] + 0.24, 0.018, "#2d2"); circle(c, 0.06, a.mouth[1] + 0.24, 0.018, "#26f"); },
});
ch("spiderman", "Spider-Man", {
  z: 3,
  draw: (c, f) => { c.save(); ell(c, 0, -0.04, 0.56, 0.78, "#d3182a"); c.clip();
    c.strokeStyle = "rgba(20,0,0,.75)"; c.lineWidth = 0.008;
    for (let i = 0; i < 14; i++) { const t = (i / 14) * T; c.beginPath(); c.moveTo(0, 0.1); c.lineTo(Math.cos(t) * 1, 0.1 + Math.sin(t) * 1.1); c.stroke(); }
    for (let r = 0.12; r < 1; r += 0.13) { c.beginPath(); for (let i = 0; i <= 14; i++) { const t = (i / 14) * T, rr = r * (i % 2 ? 0.93 : 1); c.lineTo(Math.cos(t) * rr * 0.9, 0.1 + Math.sin(t) * rr * 1.1); } c.stroke(); }
    c.restore();
    c.save(); ell(c, 0, -0.04, 0.56, 0.78, null, 0, "#8a0f1c", 0.02); c.restore();
    both((s) => { c.save(); c.translate(s * 0.2, 0.0); c.rotate(s * 0.45); drop(c, f, 0.3); c.beginPath(); c.moveTo(-0.17, 0.02); c.quadraticCurveTo(0, -0.14, 0.17, -0.02); c.quadraticCurveTo(0.12, 0.1, -0.02, 0.1); c.quadraticCurveTo(-0.14, 0.09, -0.17, 0.02); c.fillStyle = "#f7f7f7"; c.fill(); c.strokeStyle = "#111"; c.lineWidth = 0.022; c.stroke(); c.restore(); }); },
});
ch("batman", "Batman", {
  z: 3,
  draw: (c, f) => { drop(c, f, 0.4);
    poly(c, [[-0.5, 0.3], [-0.54, -0.2], [-0.42, -0.78], [-0.28, -0.46], [0, -0.52], [0.28, -0.46], [0.42, -0.78], [0.54, -0.2], [0.5, 0.3], [0.3, 0.22], [0.2, 0.1], [0.1, 0.16], [0, 0.08], [-0.1, 0.16], [-0.2, 0.1], [-0.3, 0.22]], "#0d0d12", "#000"); noDrop(c);
    both((s) => { c.save(); c.translate(s * 0.2, -0.02); c.rotate(-s * 0.2); poly(c, [[-0.11, 0.02], [0.11, -0.04], [0.1, 0.03], [-0.1, 0.05]], "#f5f5f5"); c.restore(); });
    poly(c, [[-0.5, 0.3], [-0.4, 0.56], [0, 0.46], [0.4, 0.56], [0.5, 0.3], [0.3, 0.45], [-0.3, 0.45]], null, null);
    c.fillStyle = "rgba(0,0,0,.35)"; c.fillRect(-0.4, 0.34, 0.8, 0.02); },
});
ch("joker", "Joker", {
  draw: (c, f) => { const a = A(f); tint(c, f, "#f2f2e8", 0.8);
    ell(c, 0, f.top - 0.06, 0.55, 0.3, "#2f9e44"); for (let i = -4; i <= 4; i++) poly(c, [[i * 0.1 - 0.04, f.top - 0.12], [i * 0.11, f.top - 0.42 - (4 - Math.abs(i)) * 0.025], [i * 0.1 + 0.05, f.top - 0.12]], "#2f9e44");
    both((s) => { ell(c, s * 0.2, -0.04, 0.15, 0.1, "rgba(60,60,200,.6)", s * 0.2); });
    c.save(); c.lineCap = "round"; c.strokeStyle = "#c4161c"; c.lineWidth = 0.055; c.beginPath(); c.moveTo(-0.4, 0.34); c.quadraticCurveTo(-0.3, 0.7, 0, 0.66); c.quadraticCurveTo(0.3, 0.7, 0.4, 0.34); c.stroke(); c.restore(); },
});
ch("wednesday", "Wednesday", {
  z: 2,
  draw: (c, f) => { const a = A(f); tint(c, f, "#ebe5df", 0.5);
    both((s) => { for (let i = 0; i < 9; i++) ell(c, s * (0.5 - i * 0.012), 0.1 + i * 0.13, 0.065, 0.085, i % 2 ? "#0e0e12" : "#17171c", 0, "#000", 0.004); circle(c, s * 0.4, 1.3, 0.04, "#111"); });
    ell(c, 0, f.top - 0.04, 0.56, 0.28, "#0e0e12"); rect(c, -0.5, f.top - 0.04, 1, 0.19, "#0e0e12");
    ell(c, a.mouth[0], a.mouth[1], 0.08, 0.025, "#3a1620");
    poly(c, [[-0.5, a.chin[1] + 0.1], [0, a.chin[1] + 0.3], [0.5, a.chin[1] + 0.1], [0.65, a.chin[1] + 0.45], [-0.65, a.chin[1] + 0.45]], "#0d0d11");
    poly(c, [[-0.3, a.chin[1] + 0.12], [-0.02, a.chin[1] + 0.34], [-0.34, a.chin[1] + 0.4]], "#f4f4f4"); poly(c, [[0.3, a.chin[1] + 0.12], [0.02, a.chin[1] + 0.34], [0.34, a.chin[1] + 0.4]], "#f4f4f4"); },
});
ch("harry", "Harry Potter", {
  draw: (c, f) => { const a = A(f);
    for (let i = -5; i <= 5; i++) poly(c, [[i * 0.09 - 0.05, f.top + 0.05], [i * 0.1 + (i % 2 ? 0.05 : -0.04), f.top - 0.22 - seeded(i + 4) * 0.08], [i * 0.09 + 0.05, f.top + 0.05]], "#15110e");
    both((s) => { circle(c, s * 0.2, 0, 0.135, "rgba(255,255,255,.07)", "#14110f", 0.022); });
    stroke(c, [[-0.065, -0.01], [0.065, -0.01]], "#14110f", 0.02);
    stroke(c, [[0.1, -0.33], [0.06, -0.26], [0.1, -0.26], [0.05, -0.18]], "#c4161c", 0.016);
    const y = a.chin[1] + 0.06; rect(c, -0.5, y, 1, 0.2, "#a8161e", null, 0, 0.08); for (let i = 0; i < 5; i++) rect(c, -0.5 + i * 0.2 + 0.07, y, 0.045, 0.2, "#f0b323");
    rect(c, -0.3, y + 0.15, 0.2, 0.36, "#8f1219", null, 0, 0.04); },
});
ch("spongebob", "SpongeBob", {
  draw: (c, f) => { const a = A(f); tint(c, f, "#ffe14d", 0.9);
    [[-0.3, -0.25, 0.04], [0.28, -0.3, 0.035], [-0.36, 0.2, 0.045], [0.35, 0.15, 0.04], [0.1, -0.33, 0.03], [-0.1, 0.62, 0.03]].forEach(([x, y, r]) => ell(c, x, y, r, r * 0.8, "rgba(190,150,20,.6)"));
    both((s) => { circle(c, s * 0.19, 0, 0.145, "#fff", "#222", 0.015); circle(c, s * 0.19 - s * 0.01, 0.01, 0.062, "#3aa7e5"); circle(c, s * 0.19 - s * 0.01, 0.01, 0.03, "#0a0a10"); for (let i = 0; i < 3; i++) stroke(c, [[s * 0.19 + s * (i - 1) * 0.04, -0.14], [s * 0.19 + s * (i - 1) * 0.07, -0.21]], "#111", 0.01); });
    both((s) => ell(c, s * 0.3, 0.3, 0.07, 0.05, "rgba(255,120,120,.55)"));
    const [mx, my] = a.mouth; rect(c, mx - 0.09, my + 0.0, 0.08, 0.12, "#fff", "#444", 0.008, 0.01); rect(c, mx + 0.01, my + 0.0, 0.08, 0.12, "#fff", "#444", 0.008, 0.01); },
});
ch("pikachu", "Pikachu", {
  draw: (c, f) => { const a = A(f); tint(c, f, "#ffd93d", 0.8);
    both((s) => { const [x, y] = [s * 0.27, f.top + 0.08]; c.save(); c.translate(x, y); c.rotate(s * 0.28); poly(c, [[-0.09, 0], [-0.07, -0.55], [0.1, -0.6], [0.09, 0]], "#ffd93d", "#8a6a00", 0.01); poly(c, [[-0.07, -0.56], [0.1, -0.61], [0.095, -0.4], [-0.065, -0.4]], "#1a1410"); c.restore(); });
    both((s) => { circle(c, s * 0.33, 0.3, 0.085, "#ff3b3b", "#c42020", 0.008); circle(c, s * 0.33 - 0.02, 0.28, 0.02, "rgba(255,255,255,.5)"); });
    ell(c, a.nose[0], a.nose[1] - 0.06, 0.025, 0.018, "#2a1a10"); both((s) => circle(c, s * 0.2 - s * 0.01, -0.01, 0.045, "#0a0a10")); },
});

// ================= Cute animals =================
const an = category("animals", "Animals", "🐰");

an("puppy", "Puppy", { z: 1, draw: combine(ears("floppy", "#8b5a2b", "#5a3a1a", { w: 0.14, h: 0.24 }), snout("#f0dcb8", "#1a1210", { tongue: true, w: 0.17, h: 0.12 })) });
an("fox", "Fox", {
  draw: combine(skin("#f08a3a", 0.35), ears("point", "#e8782a", "#fff1e0", { x: 0.28, w: 0.17, h: 0.34 }),
    (c, f) => both((s) => poly(c, [[s * 0.5, 0.2], [s * 0.18, 0.35], [s * 0.3, 0.55], [s * 0.5, 0.5]], "#fff6ec")),
    snout("#fff6ec", "#1a1210", { w: 0.12, h: 0.09 }), whiskers("#fff", 3, 0.28)),
});
an("panda", "Panda", {
  draw: combine(skin("#fafafa", 0.4), ears("round", "#15151a", "#2a2a30", { x: 0.36, w: 0.13, tilt: 0.1 }),
    (c, f) => both((s) => { c.save(); c.translate(s * 0.2, 0.01); c.rotate(s * 0.55); ell(c, 0, 0, 0.1, 0.14, "#15151a"); c.restore(); circle(c, s * 0.2, 0.0, 0.03, "#fff"); }),
    snout("rgba(255,255,255,0)", "#15151a", { w: 0.001, h: 0.001 })),
});
an("tiger", "Tiger", {
  draw: combine(skin("#f29b3d", 0.6), ears("round", "#f29b3d", "#fff", { x: 0.34, w: 0.12, tilt: 0.1 }), stripes("rgba(25,15,10,.8)", 4), snout("#fff3e0", "#e86a82", { w: 0.14, h: 0.1 }), whiskers("#fff", 3, 0.3)),
});
an("lion", "Lion", {
  z: 0,
  pre: (c, f) => { for (let i = 0; i < 26; i++) { const t = (i / 26) * T, r = 0.62 + (i % 2) * 0.08; c.save(); c.translate(Math.cos(t) * r * 0.9, 0.1 + Math.sin(t) * r * 1.05); c.rotate(t); ell(c, 0, 0, 0.14, 0.07, i % 2 ? "#a8621f" : "#c07a2c"); c.restore(); } circle(c, 0, 0.1, 0.55, "#b86f26"); },
  draw: combine(skin("#e8b25c", 0.45), ears("round", "#c9852f", "#f1c98a", { x: 0.38, w: 0.1, tilt: 0.1 }), snout("#f6e0b4", "#3a1c10", { w: 0.14, h: 0.1 }), whiskers("#fff", 2, 0.25)),
});
an("raccoon", "Raccoon", {
  draw: combine(skin("#9a9aa2", 0.45), ears("round", "#6a6a72", "#d8d8e0", { x: 0.34, w: 0.1, tilt: 0.1 }),
    (c, f) => { c.beginPath(); c.moveTo(-0.42, -0.05); c.quadraticCurveTo(-0.2, -0.2, 0, -0.06); c.quadraticCurveTo(0.2, -0.2, 0.42, -0.05); c.quadraticCurveTo(0.34, 0.14, 0.2, 0.1); c.quadraticCurveTo(0, 0.04, -0.2, 0.1); c.quadraticCurveTo(-0.34, 0.14, -0.42, -0.05); c.fillStyle = "rgba(20,20,24,.9)"; c.fill(); both((s) => circle(c, s * 0.2, 0.0, 0.032, "#fff")); }, snout("#e8e8ee", "#15151a", { w: 0.1, h: 0.07 })),
});
an("frog", "Frog", {
  draw: combine(skin("#6bc24a", 0.75), (c, f) => { both((s) => { circle(c, s * 0.22, f.top + 0.02, 0.15, "#6bc24a", "#3f8a2b", 0.012); circle(c, s * 0.22, f.top + 0.02, 0.1, "#fff"); circle(c, s * 0.22, f.top + 0.03, 0.05, "#0a0a10"); }); const a = A(f); curve(c, [a.mouth[0] - 0.3, a.mouth[1] - 0.02], [a.mouth[0], a.mouth[1] + 0.18], [a.mouth[0] + 0.3, a.mouth[1] - 0.02], "#2c5a1c", 0.016); both((s) => circle(c, a.nose[0] + s * 0.04, a.nose[1] - 0.04, 0.012, "#2c5a1c")); }),
});

// ================= Memes =================
const me = category("memes", "Memes", "💀");

me("gigachad", "Gigachad", {
  morph: warp({ at: [-0.38, 0.55], r: [0.2, 0.25], push: [-0.07, 0] }, { at: [0.38, 0.55], r: [0.2, 0.25], push: [0.07, 0] }, { at: [0, 0.8], r: [0.3, 0.2], push: [0, 0.08], scale: [0.2, 0.1] }),
  draw: (c, f) => both((s) => stroke(c, [[s * 0.06, -0.14], [s * 0.2, -0.19], [s * 0.35, -0.13]], "rgba(15,10,8,.85)", 0.05)),
  post: (c, w, h) => { refilter(c, w, h, "grayscale(1) contrast(1.4) brightness(1.05)"); vignette(c, w, h, 0.6); },
});
me("trollface", "Trollface", {
  z: 2,
  draw: (c, f) => { const a = A(f); tint(c, f, "#ffffff", 0.97);
    c.save(); clipOval(c, f); c.lineCap = "round";
    stroke(c, [[-0.34, -0.14], [-0.12, -0.2], [-0.04, -0.12]], "#111", 0.02); stroke(c, [[0.3, -0.22], [0.12, -0.18], [0.05, -0.1]], "#111", 0.02);
    both((s) => { ell(c, s * 0.2, 0, 0.07, 0.05, "#fff", 0, "#111", 0.012); circle(c, s * 0.2, 0.0, 0.022, "#111"); });
    const [mx, my] = a.mouth; c.beginPath(); c.moveTo(mx - 0.42, my - 0.12); c.quadraticCurveTo(mx, my + 0.42, mx + 0.42, my - 0.12); c.quadraticCurveTo(mx, my + 0.0, mx - 0.42, my - 0.12); c.fillStyle = "#fff"; c.fill(); c.strokeStyle = "#111"; c.lineWidth = 0.02; c.stroke();
    c.clip(); for (let i = -4; i <= 4; i++) stroke(c, [[mx + i * 0.09, my - 0.12], [mx + i * 0.09, my + 0.3]], "#111", 0.01); c.restore();
    curve(c, [a.nose[0] - 0.1, a.nose[1] - 0.04], [a.nose[0], a.nose[1] + 0.03], [a.nose[0] + 0.1, a.nose[1] - 0.04], "#111", 0.012); },
});
me("wojak", "Crying Wojak", {
  draw: (c, f) => { const a = A(f); tint(c, f, "#e4e4e4", 0.75);
    both((s) => { c.save(); c.globalAlpha = 0.8; stroke(c, [[s * 0.2, 0.05], [s * 0.22, 0.3], [s * 0.24, 0.6]], "#4aa8ff", 0.04); c.restore(); ell(c, s * 0.2, 0.03, 0.035, 0.05, "rgba(120,200,255,.9)"); stroke(c, [[s * 0.07, -0.2], [s * 0.2, -0.13], [s * 0.34, -0.06]], "#222", 0.022); });
    curve(c, [a.mouth[0] - 0.1, a.mouth[1] + 0.05], [a.mouth[0], a.mouth[1] - 0.05], [a.mouth[0] + 0.1, a.mouth[1] + 0.05], "#222", 0.02); },
  post: (c, w, h) => refilter(c, w, h, "saturate(0.6) contrast(1.05)"),
});
me("deepfried", "Deep Fried", {
  post: (c, w, h) => { refilter(c, w, h, "saturate(3) contrast(1.8) brightness(1.1)"); grain(c, w, h, 0.5);
    [[0.15, 0.2, 90, "😂"], [0.82, 0.3, 70, "🔥"], [0.2, 0.78, 80, "💯"], [0.8, 0.8, 100, "😂"]].forEach(([x, y, s, e]) => label(c, e, w * x, h * y, s, "#fff", "sans-serif", 400, "center"));
    sparkle(c, w * 0.5, h * 0.15, 60, "rgba(255,255,255,.9)"); },
});
me("skibidi", "Skibidi Toilet", {
  z: 0,
  pre: (c, f) => { rect(c, -0.45, f.chin - 0.3, 0.9, 0.8, "#e9eef2", "#aab4bd", 0.012, 0.06); },
  draw: (c, f) => { const y = f.chin + 0.1; drop(c, f, 0.4); c.beginPath(); c.moveTo(-0.72, y); c.bezierCurveTo(-0.72, y + 0.7, 0.72, y + 0.7, 0.72, y); c.quadraticCurveTo(0, y + 0.2, -0.72, y); c.fillStyle = "#f3f6f9"; c.fill(); c.strokeStyle = "#aab4bd"; c.lineWidth = 0.014; c.stroke(); noDrop(c);
    ell(c, 0, y + 0.02, 0.7, 0.1, "#c8d2da", 0, "#aab4bd", 0.01); rect(c, -0.12, y + 0.7, 0.24, 0.18, "#e1e8ee", "#aab4bd", 0.01); },
});
me("bananacat", "Banana Cat", {
  draw: combine(skin("#ffe45c", 0.4), ears("point", "#ffd93d", "#fff3a8", { x: 0.3, w: 0.15, h: 0.28 }),
    (c, f) => { both((s) => { c.save(); c.translate(s * 0.46, 0.3); c.rotate(s * 0.15); c.beginPath(); c.moveTo(0, -0.5); c.quadraticCurveTo(s * 0.34, 0, s * 0.1, 0.55); c.quadraticCurveTo(-s * 0.1, 0, 0, -0.5); c.fillStyle = "#ffd93d"; c.fill(); c.strokeStyle = "#b8901a"; c.lineWidth = 0.015; c.stroke(); stroke(c, [[0, -0.4], [s * 0.1, 0.1]], "rgba(160,120,20,.6)", 0.01); c.restore(); });
      const y = f.chin + 0.05; c.beginPath(); c.moveTo(-0.5, y); c.quadraticCurveTo(0, y + 0.55, 0.5, y); c.quadraticCurveTo(0, y + 0.18, -0.5, y); c.fillStyle = "#ffd93d"; c.fill(); c.strokeStyle = "#b8901a"; c.lineWidth = 0.015; c.stroke(); },
    whiskers("#fff", 3, 0.3), snout("rgba(255,255,255,0)", "#e86a82", { w: 0.001, h: 0.001 })),
});
me("emotional", "Emotional Damage", {
  draw: combine(skin("#ff4a4a", 0.25), (c, f) => both((s) => { c.save(); c.globalAlpha = 0.85; stroke(c, [[s * 0.2, 0.05], [s * 0.24, 0.35], [s * 0.27, 0.7]], "#6cc4ff", 0.04); c.restore(); })),
  post: (c, w, h) => { speedLines(c, w, h, "rgba(255,40,40,.28)", 50); vignette(c, w, h, 0.55, "120,0,0"); const j = Math.sin(performance.now() / 40) * 4; label(c, "EMOTIONAL DAMAGE", w / 2 + j, h * 0.9, 56, "#ff3030", "Impact, Inter, sans-serif", 900, "center", "#000"); },
});
