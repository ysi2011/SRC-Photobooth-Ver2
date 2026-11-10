// Pack 2: face distortions, monsters, hats & wearables, hair
import { category, into, A, ears, circle, ell, poly, rect, stroke, curve, star, heart, both, clipOval, combine, skin, tint, warp, BIG, glow, rad, lin, drop, noDrop, seeded, T, HAT, wing, skinColor, sparkle } from "./fxlib.js";

// ================= Face distortions =================
const di = category("distort", "Funny Faces & Reactions", "🤣");

di("bignose", "Giant Nose", { morph: warp({ at: [0, 0.33], r: [0.17, 0.2], push: [0, 0.02], scale: [1.1, 1.1] }) });
di("hugelips", "Huge Lips", {
  morph: warp({ at: [0, 0.535], r: [0.2, 0.07], scale: [0.6, 1.3] }),
  draw: (c, f) => { const a = A(f); c.save(); c.globalAlpha = 0.55; ell(c, a.mouth[0], a.mouth[1], 0.17, 0.06, "#e0405e"); c.restore(); },
});
di("cheeks", "Inflated Cheeks", { morph: warp({ at: [-0.3, 0.3], r: [0.18, 0.18], scale: [0.7, 0.7] }, { at: [0.3, 0.3], r: [0.18, 0.18], scale: [0.7, 0.7] }) });
di("horse", "Long Face", {
  morph: warp({ at: [0, 0], r: BIG, scale: [0, 0.38] }, { at: [0, 0.5], r: [0.25, 0.3], scale: [0.3, 0.3] }),
  draw: (c, f) => { const a = A(f); both((s) => ell(c, a.nose[0] + s * 0.06, a.nose[1] + 0.02, 0.035, 0.05, "rgba(40,20,10,.55)", s * 0.3)); },
});
di("squish", "Squished", { morph: warp({ at: [0, 0.2], r: BIG, scale: [0.18, -0.25] }) });
di("forehead", "Big Forehead", { morph: warp({ at: [0, -0.28], r: [0.38, 0.24], push: [0, -0.12], scale: [0.45, 0.8] }) });
di("onee", "One Eye", {
  morph: warp({ at: [-0.2, 0], r: [0.14, 0.12], push: [0.19, 0], scale: [0.55, 0.55] }, { at: [0.2, 0], r: [0.14, 0.12], push: [-0.19, 0], scale: [0.55, 0.55] }),
});
di("eyesfar", "Far Apart Eyes", { morph: warp({ at: [-0.2, 0], r: [0.15, 0.13], push: [-0.16, 0], scale: [0.2, 0.2] }, { at: [0.2, 0], r: [0.15, 0.13], push: [0.16, 0], scale: [0.2, 0.2] }) });
di("melt", "Melting", {
  morph: ([x, y]) => { const k = Math.max(0, y - 0.05); const t = performance.now() / 700; return [x + Math.sin(y * 11 + t) * 0.035 * Math.min(1, k * 3), y + k * 0.75 + Math.max(0, Math.sin(x * 9 + t * 0.7)) * k * 0.2]; },
});
di("flip", "Upside-Down Face", {
  morph: ([x, y]) => { const cy = 0.26, dx = x, dy = y - cy, r = Math.hypot(dx, dy * 1.2), w = r < 0.22 ? 1 : r > 0.5 ? 0 : 1 - (r - 0.22) / 0.28, a = Math.PI * w * w * (3 - 2 * w), co = Math.cos(a), si = Math.sin(a); return [dx * co - dy * si, cy + dx * si + dy * co]; },
});

// ================= Monsters =================
const mo = category("monsters", "Monsters", "😈");

mo("vampire", "Vampire", {
  pre: (c, f) => { poly(c, [[-0.55, f.chin - 0.3], [-0.8, f.chin + 0.5], [0.8, f.chin + 0.5], [0.55, f.chin - 0.3], [0.3, f.chin + 0.1], [-0.3, f.chin + 0.1]], "#1a0a12"); poly(c, [[-0.5, f.chin - 0.25], [-0.62, f.chin + 0.3], [-0.3, f.chin + 0.15]], "#8e1228"); poly(c, [[0.5, f.chin - 0.25], [0.62, f.chin + 0.3], [0.3, f.chin + 0.15]], "#8e1228"); },
  draw: (c, f) => { const a = A(f); tint(c, f, "#e8dfe8", 0.55);
    both((s) => { const [x, y] = s < 0 ? a.eL : a.eR; c.save(); glow(c, f, "#ff2030", 0.07); circle(c, x, y, 0.045, "rgba(255,40,50,.7)"); c.restore(); ell(c, x, y - 0.05, 0.14, 0.05, "rgba(60,20,60,.35)"); });
    both((s) => { const [x, y] = s < 0 ? a.mL : a.mR; poly(c, [[x - 0.02, y + 0.01], [x + 0.02, y + 0.01], [x, y + 0.11]], "#fff", "#ccc", 0.004); });
    c.fillStyle = "#b3001e"; c.beginPath(); c.moveTo(a.mR[0], a.mR[1] + 0.1); c.quadraticCurveTo(a.mR[0] + 0.01, a.mR[1] + 0.22, a.mR[0], a.mR[1] + 0.3); c.quadraticCurveTo(a.mR[0] + 0.03, a.mR[1] + 0.2, a.mR[0] + 0.03, a.mR[1] + 0.08); c.fill(); },
});
mo("werewolf", "Werewolf", {
  morph: warp({ at: [0, 0.45], r: [0.25, 0.25], push: [0, 0.08], scale: [0.5, 0.5] }),
  draw: (c, f) => { const a = A(f); tint(c, f, "#7a5a3c", 0.7);
    both((s) => { const [x, y] = s < 0 ? a.tL : a.tR; for (let i = 0; i < 6; i++) poly(c, [[x, y + i * 0.1 - 0.05], [x + s * (0.12 + seeded(i) * 0.08), y + i * 0.1 + 0.08], [x - s * 0.02, y + i * 0.1 + 0.13]], "#5a3f26"); });
    ears("point", "#6a4a2e", "#c9a07a", { x: 0.3, w: 0.15, h: 0.3 })(c, f);
    both((s) => { const [x, y] = s < 0 ? a.eL : a.eR; c.save(); glow(c, f, "#ffd23a", 0.05); circle(c, x, y, 0.035, "#ffd23a"); c.restore(); circle(c, x, y, 0.014, "#000"); });
    ell(c, a.nose[0], a.nose[1] - 0.04, 0.07, 0.05, "#14100c");
    [a.mL, a.mR].forEach(([x, y]) => poly(c, [[x - 0.02, y + 0.02], [x + 0.02, y + 0.02], [x, y + 0.11]], "#fff", "#ccc", 0.004)); },
});
mo("skeleton", "Skeleton", {
  z: 2,
  draw: (c, f) => { const a = A(f); tint(c, f, "#f2eee2", 0.92);
    both((s) => { ell(c, s * 0.2, 0.01, 0.12, 0.14, "#08080c", s * 0.2); ell(c, s * 0.2, 0.01, 0.12, 0.14, null, s * 0.2, "rgba(120,110,90,.6)", 0.01); });
    poly(c, [[0, a.nose[1] - 0.17], [-0.05, a.nose[1] - 0.04], [0, a.nose[1] - 0.07], [0.05, a.nose[1] - 0.04]], "#08080c");
    rect(c, -0.2, a.mouth[1] - 0.05, 0.4, 0.14, "#f7f4ea", "#2a2620", 0.012, 0.03); for (let i = -3; i <= 3; i++) stroke(c, [[i * 0.057, a.mouth[1] - 0.05], [i * 0.057, a.mouth[1] + 0.09]], "#2a2620", 0.008); stroke(c, [[-0.2, a.mouth[1] + 0.02], [0.2, a.mouth[1] + 0.02]], "#2a2620", 0.008);
    both((s) => curve(c, [s * 0.46, 0.15], [s * 0.34, 0.32], [s * 0.2, 0.42], "rgba(120,110,90,.55)", 0.014)); },
});
mo("clown", "Evil Clown", {
  draw: (c, f) => { const a = A(f); tint(c, f, "#ffffff", 0.9);
    ["#ff3b3b", "#ffb43c", "#ffe23c", "#3bd16f", "#3b9eff", "#a35bff"].forEach((col, i) => { for (const s of [-1, 1]) circle(c, s * (0.28 + i * 0.045), f.top - 0.04 - Math.sin(i * 0.55) * 0.12 + i * 0.08, 0.13, col); });
    both((s) => { poly(c, [[s * 0.2, -0.17], [s * 0.3, -0.05], [s * 0.2, 0.08], [s * 0.1, -0.05]], "#2a6bff"); });
    c.save(); c.lineCap = "round"; c.strokeStyle = "#e0162b"; c.lineWidth = 0.06; c.beginPath(); c.moveTo(a.mouth[0] - 0.36, a.mouth[1] - 0.12); c.quadraticCurveTo(a.mouth[0], a.mouth[1] + 0.3, a.mouth[0] + 0.36, a.mouth[1] - 0.12); c.stroke(); c.restore();
    drop(c, f, 0.3); circle(c, a.nose[0], a.nose[1] - 0.04, 0.085, "#e0162b"); noDrop(c); circle(c, a.nose[0] - 0.025, a.nose[1] - 0.07, 0.02, "rgba(255,255,255,.7)"); },
});
mo("pumpkin", "Pumpkin Head", {
  z: 3,
  draw: (c, f) => { drop(c, f, 0.5); ell(c, 0, 0.1, 0.66, 0.62, rad(c, 0, 0.1, 0.05, 0.66, [[0, "#ff9a2e"], [1, "#d9560c"]]), 0, "#8a3205", 0.014); noDrop(c);
    [-0.4, -0.2, 0.2, 0.4].forEach((x) => curve(c, [x * 0.6, -0.46], [x * 1.35, 0.1], [x * 0.6, 0.66], "rgba(120,40,0,.45)", 0.014));
    rect(c, -0.05, -0.62, 0.1, 0.18, "#5a7a2a", "#3a5018", 0.01, 0.02);
    c.save(); glow(c, f, "#ffd24a", 0.1); c.fillStyle = "#ffe27a";
    both((s) => poly(c, [[s * 0.1, 0.07], [s * 0.34, 0.06], [s * 0.2, -0.16]], "#ffe27a")); poly(c, [[0, 0.2], [-0.07, 0.34], [0.07, 0.34]], "#ffe27a");
    c.beginPath(); c.moveTo(-0.34, 0.4); for (let i = 0; i <= 8; i++) c.lineTo(-0.34 + i * 0.085, 0.4 + (i % 2 ? 0.16 : 0)); c.lineTo(0.34, 0.5); c.quadraticCurveTo(0, 0.68, -0.34, 0.5); c.closePath(); c.fill(); c.restore(); },
});

// ================= Hats & accessories =================
const wr = category("wear", "Hats, Props & Hair", "👑");

wr("graduation", "Graduation Cap", { z: 3, draw: HAT.grad });
wr("cowboy", "Cowboy Hat", { z: 3, draw: HAT.cowboy });
wr("witch", "Witch Hat", { z: 3, draw: HAT.witch });
wr("wizard", "Wizard Hat", { z: 3, draw: HAT.wizard });
wr("pirate", "Pirate Hat", { z: 3, draw: HAT.pirate });
wr("clownnose", "Clown Nose", { z: 3, draw: (c, f) => { const a = A(f); drop(c, f, 0.35); circle(c, a.nose[0], a.nose[1] - 0.05, 0.1, rad(c, a.nose[0], a.nose[1] - 0.05, 0.01, 0.1, [[0, "#ff7b7b"], [1, "#d11a2a"]], a.nose[0] - 0.03, a.nose[1] - 0.09)); } });
wr("dealwithit", "Deal With It", {
  z: 3,
  draw: (c, f) => { const y = -0.07, h = 0.14; c.fillStyle = "#08080a"; const blocks = [[-0.46, y + 0.04, 0.92, h - 0.04], [-0.42, y, 0.38, 0.04], [0.04, y, 0.38, 0.04], [-0.38, y + h, 0.3, 0.04], [0.08, y + h, 0.3, 0.04], [-0.04, y + 0.04, 0.08, 0.04]];
    blocks.forEach(([x, yy, w, hh]) => c.fillRect(x, yy, w, hh)); c.fillStyle = "rgba(255,255,255,.85)"; c.fillRect(-0.36, y + 0.06, 0.06, 0.03); c.fillRect(0.12, y + 0.06, 0.06, 0.03); },
});
wr("angelwings", "Angel Wings", {
  z: 0,
  pre: (c, f) => both((s) => wing(c, s, s * 0.5, f.chin + 0.35, "rgba(255,255,255,.92)", "#cfd6e6", 0.9, -0.35)),
  draw: (c, f) => { const [x, y] = f.M([0, f.top - 0.02]); glow(c, f, "#ffe27a", 0.06); ell(c, x, y - 0.1, 0.22, 0.05, null, 0, "#ffe27a", 0.03); },
});

// ================= Hair & beards =================
const ha = into("wear");

ha("handlebar", "Handlebar Moustache", {
  z: 2,
  draw: (c, f) => { const a = A(f), [x, y] = [a.nose[0], a.nose[1] + 0.07]; c.fillStyle = "#2a1608"; c.strokeStyle = "#140a02"; c.lineWidth = 0.008;
    both((s) => { c.beginPath(); c.moveTo(x, y - 0.03); c.bezierCurveTo(x + s * 0.12, y - 0.08, x + s * 0.3, y + 0.1, x + s * 0.4, y - 0.02); c.bezierCurveTo(x + s * 0.5, y - 0.14, x + s * 0.5, y - 0.26, x + s * 0.4, y - 0.26); c.bezierCurveTo(x + s * 0.44, y - 0.2, x + s * 0.4, y - 0.1, x + s * 0.33, y + 0.0); c.bezierCurveTo(x + s * 0.22, y + 0.14, x + s * 0.08, y + 0.05, x, y + 0.04); c.closePath(); c.fill(); c.stroke(); }); },
});
ha("gandalf", "Wizard Beard", {
  z: 2,
  draw: (c, f) => { const a = A(f); c.beginPath(); c.moveTo(-0.46, 0.3); c.bezierCurveTo(-0.56, 0.9, -0.3, 1.5, 0, 1.6); c.bezierCurveTo(0.3, 1.5, 0.56, 0.9, 0.46, 0.3); c.quadraticCurveTo(0.3, a.mouth[1] + 0.06, 0, a.mouth[1] + 0.12); c.quadraticCurveTo(-0.3, a.mouth[1] + 0.06, -0.46, 0.3); c.fillStyle = lin(c, 0, 0.3, 0, 1.6, [[0, "#f0f0f4"], [1, "#c9ccd6"]]); c.fill();
    for (let i = -3; i <= 3; i++) curve(c, [i * 0.1, a.mouth[1] + 0.15], [i * 0.14, 1.0], [i * 0.1, 1.5 - Math.abs(i) * 0.08], "rgba(150,155,170,.5)", 0.01);
    both((s) => ell(c, s * 0.2, -0.13, 0.15, 0.045, "#f4f4f8", s * 0.15)); },
});
ha("mohawk", "Rainbow Mohawk", {
  z: 2,
  draw: (c, f) => { const cols = ["#ff3b3b", "#ff9a2e", "#ffe23c", "#3bd16f", "#3b9eff", "#a35bff", "#ff4fd8"]; for (let i = 0; i < 7; i++) { const x = (i - 3) * 0.075, y = f.top + 0.03; poly(c, [[x - 0.05, y], [x + (i - 3) * 0.015, y - 0.4 - (3 - Math.abs(i - 3)) * 0.07], [x + 0.05, y]], cols[i], "rgba(0,0,0,.25)", 0.006); } },
});
ha("bald", "Bald", {
  z: 2,
  draw: (c, f) => { const col = skinColor(c, f), cy = f.top - 0.14; ell(c, 0, cy, 0.56, 0.42, col); ell(c, 0, f.top - 0.02, 0.44, 0.06, col); c.save(); c.globalAlpha = 0.5; ell(c, -0.14, cy - 0.12, 0.14, 0.08, "#fff", -0.4); c.restore(); },
});

