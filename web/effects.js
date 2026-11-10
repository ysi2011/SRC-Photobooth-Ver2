import { MESH } from "./mesh.js";
// Face effects drawn on canvas. Every effect draws in "face space":
//   origin = midpoint between the eyes, 1 unit = face width, +x right, +y down, rotated with the head.
// f = { top, chin, noseY, mouthY, px }  (px = face width in canvas pixels, used for shadow blur)

const rrect = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
const lin = (c, x0, y0, x1, y1, stops) => {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
};
const rad = (c, x, y, r0, r1, stops, fx = x, fy = y) => {
  const g = c.createRadialGradient(fx, fy, r0, x, y, r1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
};
const drop = (c, f, a = 0.35) => { c.shadowColor = `rgba(0,0,0,${a})`; c.shadowBlur = f.px * 0.04; c.shadowOffsetY = f.px * 0.015; };
const noDrop = (c) => { c.shadowColor = "transparent"; c.shadowBlur = 0; c.shadowOffsetY = 0; };

// ---------------- Robot head (sits on top of the head) ----------------
function robot(c, f) {
  const hw = 1.3, hh = 1.05, x = -hw / 2, y = f.top + 0.25 - hh, cx = 0;
  c.save();
  // antenna
  c.lineCap = "round";
  drop(c, f);
  c.strokeStyle = lin(c, -0.02, 0, 0.02, 0, [[0, "#6d7683"], [0.5, "#e8edf2"], [1, "#59616d"]]);
  c.lineWidth = 0.035; c.beginPath(); c.moveTo(cx, y); c.lineTo(cx, y - 0.24); c.stroke();
  noDrop(c);
  c.shadowColor = "rgba(255,60,60,.9)"; c.shadowBlur = f.px * 0.08;
  c.fillStyle = rad(c, cx, y - 0.28, 0.005, 0.07, [[0, "#ffd0d0"], [0.35, "#ff4a4a"], [1, "#8c0a0a"]], cx - 0.02, y - 0.3);
  c.beginPath(); c.arc(cx, y - 0.28, 0.065, 0, 7); c.fill(); noDrop(c);
  // ears (side cylinders)
  for (const s of [-1, 1]) {
    const ex = s * (hw / 2) - (s > 0 ? 0 : 0.1);
    c.fillStyle = lin(c, ex, 0, ex + 0.1, 0, s < 0 ? [[0, "#4a525e"], [1, "#b9c1cc"]] : [[0, "#b9c1cc"], [1, "#4a525e"]]);
    rrect(c, ex, y + hh * 0.3, 0.1, hh * 0.38, 0.03); c.fill();
    c.fillStyle = "#2a2f36"; c.beginPath(); c.arc(ex + 0.05, y + hh * 0.49, 0.025, 0, 7); c.fill();
  }
  // head shell: brushed metal
  drop(c, f, 0.5);
  c.fillStyle = lin(c, x, 0, x + hw, 0, [[0, "#59616d"], [0.12, "#aeb7c3"], [0.3, "#e7ecf1"], [0.55, "#9aa4b1"], [0.82, "#d3d9e0"], [1, "#58606c"]]);
  rrect(c, x, y, hw, hh, 0.14); c.fill(); noDrop(c);
  // top/bottom shading
  c.fillStyle = lin(c, 0, y, 0, y + hh, [[0, "rgba(255,255,255,.35)"], [0.35, "rgba(255,255,255,0)"], [1, "rgba(0,0,0,.28)"]]);
  rrect(c, x, y, hw, hh, 0.14); c.fill();
  // bevel
  c.strokeStyle = "rgba(40,46,56,.9)"; c.lineWidth = 0.022; rrect(c, x, y, hw, hh, 0.14); c.stroke();
  c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 0.01; rrect(c, x + 0.03, y + 0.03, hw - 0.06, hh - 0.06, 0.11); c.stroke();
  // brushed lines
  c.strokeStyle = "rgba(255,255,255,.08)"; c.lineWidth = 0.004;
  for (let i = 0; i < 26; i++) { const yy = y + 0.05 + i * (hh - 0.1) / 26; c.beginPath(); c.moveTo(x + 0.05, yy); c.lineTo(x + hw - 0.05, yy); c.stroke(); }
  // rivets
  for (const [rx, ry] of [[x + 0.07, y + 0.07], [x + hw - 0.07, y + 0.07], [x + 0.07, y + hh - 0.07], [x + hw - 0.07, y + hh - 0.07]]) {
    c.fillStyle = rad(c, rx, ry, 0.002, 0.03, [[0, "#fff"], [0.5, "#8b94a1"], [1, "#3a4048"]], rx - 0.008, ry - 0.008);
    c.beginPath(); c.arc(rx, ry, 0.028, 0, 7); c.fill();
  }
  // visor strip
  const vy = y + hh * 0.2, vh = hh * 0.36;
  c.fillStyle = lin(c, 0, vy, 0, vy + vh, [[0, "#06090d"], [1, "#1b2530"]]);
  rrect(c, x + 0.1, vy, hw - 0.2, vh, 0.09); c.fill();
  c.strokeStyle = "#454d58"; c.lineWidth = 0.014; c.stroke();
  // eyes
  for (const ex of [-0.28, 0.28]) {
    const ey = vy + vh / 2;
    c.shadowColor = "rgba(60,230,255,.95)"; c.shadowBlur = f.px * 0.09;
    c.fillStyle = rad(c, ex, ey, 0.005, 0.105, [[0, "#ffffff"], [0.3, "#7df4ff"], [0.7, "#0aa9c4"], [1, "#04485a"]]);
    c.beginPath(); c.arc(ex, ey, 0.1, 0, 7); c.fill(); noDrop(c);
    c.strokeStyle = "#0b1015"; c.lineWidth = 0.012; c.beginPath(); c.arc(ex, ey, 0.105, 0, 7); c.stroke();
    c.fillStyle = "rgba(255,255,255,.85)"; c.beginPath(); c.ellipse(ex - 0.03, ey - 0.035, 0.028, 0.016, -0.5, 0, 7); c.fill();
  }
  // speaker grille
  const gy = y + hh * 0.66, gh = hh * 0.2, gw = 0.55;
  c.fillStyle = "#1a1f26"; rrect(c, -gw / 2, gy, gw, gh, 0.04); c.fill();
  c.strokeStyle = "#7d8794"; c.lineWidth = 0.012;
  for (let i = 1; i < 7; i++) { const lx = -gw / 2 + gw * i / 7; c.beginPath(); c.moveTo(lx, gy + 0.025); c.lineTo(lx, gy + gh - 0.025); c.stroke(); }
  c.strokeStyle = "#4a525e"; c.lineWidth = 0.014; rrect(c, -gw / 2, gy, gw, gh, 0.04); c.stroke();
  c.restore();
}

// ---------------- Sunglasses (black wayfarers, glossy lenses) ----------------
function sunglasses(c, f) {
  c.save();
  const lens = (sx) => {
    c.save(); c.scale(sx, 1);
    c.beginPath();
    c.moveTo(0.07, -0.1); c.lineTo(0.43, -0.12);
    c.quadraticCurveTo(0.47, -0.12, 0.465, -0.07);
    c.lineTo(0.43, 0.12); c.quadraticCurveTo(0.38, 0.2, 0.28, 0.18);
    c.quadraticCurveTo(0.12, 0.17, 0.09, 0.06); c.closePath();
    c.restore();
  };
  // temple arms
  c.strokeStyle = "#0d0d0f"; c.lineWidth = 0.04; c.lineCap = "round";
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 0.46, -0.09); c.lineTo(s * 0.56, -0.07); c.stroke(); }
  drop(c, f, 0.45);
  for (const s of [-1, 1]) {
    lens(s);
    c.fillStyle = lin(c, 0, -0.12, 0, 0.19, [[0, "rgba(10,12,18,.96)"], [0.6, "rgba(28,34,46,.93)"], [1, "rgba(70,84,104,.88)"]]);
    c.fill(); noDrop(c);
    c.lineJoin = "round"; c.strokeStyle = lin(c, 0, -0.14, 0, 0.2, [[0, "#2c2c31"], [0.4, "#08080a"], [1, "#1c1c20"]]);
    c.lineWidth = 0.045; c.stroke();
    // glossy reflections
    c.save(); lens(s); c.clip();
    c.fillStyle = "rgba(255,255,255,.2)";
    c.beginPath(); c.moveTo(s * 0.14, -0.12); c.lineTo(s * 0.26, -0.12); c.lineTo(s * 0.14, 0.17); c.lineTo(s * 0.09, 0.17); c.closePath(); c.fill();
    c.fillStyle = "rgba(255,255,255,.1)";
    c.beginPath(); c.moveTo(s * 0.3, -0.12); c.lineTo(s * 0.34, -0.12); c.lineTo(s * 0.24, 0.17); c.lineTo(s * 0.21, 0.17); c.closePath(); c.fill();
    c.restore();
    drop(c, f, 0.45);
  }
  noDrop(c);
  // bridge
  c.strokeStyle = "#0b0b0d"; c.lineWidth = 0.05; c.beginPath(); c.moveTo(-0.1, -0.08); c.quadraticCurveTo(0, -0.14, 0.1, -0.08); c.stroke();
  c.restore();
}

// ---------------- Cat ears + nose + whiskers ----------------
function cat(c, f) {
  c.save();
  const by = f.top + 0.22;
  for (const s of [-1, 1]) {
    c.save(); c.translate(s * 0.3, by); c.rotate(s * 0.28);
    const ear = (k) => {
      c.beginPath(); c.moveTo(-0.2 * k, 0.04);
      c.quadraticCurveTo(-0.2 * k, -0.2 * k, 0.0, -0.5 * k);
      c.quadraticCurveTo(0.2 * k, -0.2 * k, 0.2 * k, 0.04); c.closePath();
    };
    drop(c, f);
    ear(1); c.fillStyle = lin(c, 0, -0.5, 0, 0.05, [[0, "#6b6f78"], [1, "#2f3238"]]); c.fill(); noDrop(c);
    c.save(); ear(1); c.clip();
    c.strokeStyle = "rgba(255,255,255,.18)"; c.lineWidth = 0.007;
    for (let i = 0; i < 24; i++) { const a = -0.19 + i * 0.016; c.beginPath(); c.moveTo(a, 0.04); c.lineTo(a * 0.7, -0.35 - (i % 3) * 0.04); c.stroke(); }
    c.restore();
    ear(0.62); c.translate(0, 0.045); c.fillStyle = lin(c, 0, -0.3, 0, 0.05, [[0, "#ffb3c4"], [1, "#e0708e"]]); c.fill();
    c.restore();
  }
  // nose
  const ny = f.noseY + 0.03;
  c.fillStyle = lin(c, 0, ny - 0.04, 0, ny + 0.05, [[0, "#ff9ab3"], [1, "#d5546f"]]);
  c.beginPath(); c.moveTo(-0.06, ny - 0.03); c.quadraticCurveTo(0, ny - 0.06, 0.06, ny - 0.03); c.quadraticCurveTo(0.05, ny + 0.03, 0, ny + 0.06); c.quadraticCurveTo(-0.05, ny + 0.03, -0.06, ny - 0.03); c.fill();
  c.fillStyle = "rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(-0.018, ny - 0.03, 0.02, 0.01, 0, 0, 7); c.fill();
  // whiskers
  c.lineCap = "round";
  for (const s of [-1, 1]) for (const [dy, ex, ey] of [[-0.03, 0.62, -0.1], [0.02, 0.66, 0.03], [0.07, 0.6, 0.15]]) {
    c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 0.014;
    c.beginPath(); c.moveTo(s * 0.17, ny + dy); c.quadraticCurveTo(s * 0.4, ny + dy + ey * 0.2, s * ex, ny + ey); c.stroke();
    c.strokeStyle = "#fff"; c.lineWidth = 0.008; c.stroke();
  }
  c.restore();
}

// ---------------- Gold crown with gems ----------------
function crown(c, f) {
  c.save();
  const w = 0.92, base = f.top + 0.2, h = 0.34, tip = 0.3;
  const x = -w / 2;
  drop(c, f, 0.5);
  c.beginPath();
  c.moveTo(x, base);
  const n = 5;
  c.lineTo(x, base - h);
  for (let i = 0; i < n; i++) {
    const px = x + (w * (i + 0.5)) / n;
    const valley = x + (w * (i + 1)) / n;
    c.lineTo(px, base - h - tip * (i % 2 === 0 ? 1 : 0.8));
    c.lineTo(valley, base - h);
  }
  c.lineTo(x + w, base); c.closePath();
  c.fillStyle = lin(c, x, 0, x + w, 0, [[0, "#a8741a"], [0.2, "#ffe27a"], [0.45, "#d4a02c"], [0.7, "#fff0a8"], [1, "#9a6a14"]]);
  c.fill(); noDrop(c);
  c.strokeStyle = "#7a5410"; c.lineWidth = 0.014; c.lineJoin = "round"; c.stroke();
  // band
  c.fillStyle = lin(c, 0, base - 0.1, 0, base, [[0, "#ffe9a0"], [1, "#b8821f"]]);
  c.fillRect(x, base - 0.1, w, 0.1); c.strokeRect(x, base - 0.1, w, 0.1);
  // tip pearls
  for (let i = 0; i < n; i++) {
    const px = x + (w * (i + 0.5)) / n, py = base - h - tip * (i % 2 === 0 ? 1 : 0.8);
    c.fillStyle = rad(c, px, py, 0.003, 0.035, [[0, "#fff"], [1, "#d8d8e8"]], px - 0.01, py - 0.01);
    c.beginPath(); c.arc(px, py - 0.01, 0.033, 0, 7); c.fill();
  }
  // gems
  const gem = (gx, col1, col2) => {
    c.save(); c.translate(gx, base - 0.2);
    c.fillStyle = rad(c, 0, 0, 0.005, 0.08, [[0, col1], [1, col2]], -0.02, -0.03);
    c.beginPath(); c.moveTo(0, -0.07); c.lineTo(0.055, 0); c.lineTo(0, 0.07); c.lineTo(-0.055, 0); c.closePath(); c.fill();
    c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 0.008; c.stroke();
    c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.arc(-0.015, -0.025, 0.012, 0, 7); c.fill();
    c.restore();
  };
  gem(-0.28, "#ff8a8a", "#a50f1e"); gem(0, "#9ad6ff", "#0e4fa8"); gem(0.28, "#ff8a8a", "#a50f1e");
  c.restore();
}

// ---------------- Party hat ----------------
function partyHat(c, f) {
  c.save();
  c.translate(0.22, f.top + 0.15); c.rotate(0.3);
  const bw = 0.3, h = 0.85;
  const cone = () => { c.beginPath(); c.moveTo(-bw, 0); c.lineTo(0, -h); c.lineTo(bw, 0); c.quadraticCurveTo(0, 0.05, -bw, 0); c.closePath(); };
  drop(c, f, 0.45);
  cone(); c.fillStyle = lin(c, -bw, 0, bw, 0, [[0, "#d12e83"], [0.5, "#ff5fb0"], [1, "#9c1b62"]]); c.fill(); noDrop(c);
  c.save(); cone(); c.clip();
  c.strokeStyle = "#ffe14d"; c.lineWidth = 0.07;
  for (let i = -3; i < 6; i++) { c.beginPath(); c.moveTo(-bw - 0.2, i * 0.2 - 0.1); c.lineTo(bw + 0.2, i * 0.2 - 0.5); c.stroke(); }
  c.fillStyle = "#4fd3ff";
  for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(-0.2 + (i * 0.173) % 0.4, -0.1 - (i * 0.067) % 0.6, 0.018, 0, 7); c.fill(); }
  c.fillStyle = lin(c, -bw, 0, bw, 0, [[0, "rgba(0,0,0,.3)"], [0.35, "rgba(255,255,255,.25)"], [1, "rgba(0,0,0,.35)"]]);
  c.fillRect(-bw, -h, bw * 2, h + 0.1);
  c.restore();
  // pompom
  for (let i = 0; i < 28; i++) {
    const a = i * 2.4, r = 0.055 * Math.sqrt(i / 28) * 1.6;
    c.fillStyle = i % 2 ? "#ffd84d" : "#fff4b3";
    c.beginPath(); c.arc(Math.cos(a) * r, -h + Math.sin(a) * r, 0.03, 0, 7); c.fill();
  }
  c.restore();
}

// ---------------- Handlebar moustache ----------------
const moustache = (c, f) => moustacheWith(c, f, "#4a2c17", "#1e0f06", "rgba(190,140,90,.35)");
function moustacheWith(c, f, c0, c1, hair) {
  c.save();
  const y = f.noseY + (f.mouthY - f.noseY) * 0.42;
  c.translate(0, y);
  for (const s of [-1, 1]) {
    c.save(); c.scale(s, 1);
    const path = () => {
      c.beginPath(); c.moveTo(0, -0.03);
      c.bezierCurveTo(0.08, -0.08, 0.22, -0.06, 0.33, 0.0);
      c.bezierCurveTo(0.42, 0.04, 0.5, 0.0, 0.52, -0.07);   // curl up
      c.bezierCurveTo(0.5, 0.06, 0.38, 0.12, 0.26, 0.08);
      c.bezierCurveTo(0.14, 0.06, 0.06, 0.07, 0, 0.05); c.closePath();
    };
    drop(c, f, 0.4);
    path(); c.fillStyle = lin(c, 0, -0.08, 0, 0.12, [[0, c0], [1, c1]]); c.fill(); noDrop(c);
    c.save(); path(); c.clip();
    c.strokeStyle = hair; c.lineWidth = 0.005;
    for (let i = 0; i < 22; i++) { const x0 = i * 0.024; c.beginPath(); c.moveTo(x0, -0.07 + (i % 4) * 0.01); c.quadraticCurveTo(x0 + 0.05, 0.02, x0 + 0.1, 0.07 + (i % 3) * 0.01); c.stroke(); }
    c.restore();
    c.restore();
  }
  c.restore();
}

// ---------------- Flower crown ----------------
function flowerCrown(c, f) {
  c.save();
  const cy = f.top + 0.5, rx = 0.56, ry = 0.5;
  const pos = (a) => [Math.cos(a) * rx, cy + Math.sin(a) * ry];
  // vine + leaves
  c.strokeStyle = "#3e7a35"; c.lineWidth = 0.035; c.lineCap = "round";
  c.beginPath(); c.ellipse(0, cy, rx, ry, 0, Math.PI * 1.02, Math.PI * 1.98); c.stroke();
  const N = 9, cols = [["#ff9ec2", "#d94f87"], ["#ffffff", "#d8d4e8"], ["#ffd3a1", "#e8894a"], ["#c9b4ff", "#7a54d6"]];
  for (let i = 0; i <= N; i++) {
    const a = Math.PI * (1.03 + (0.94 * i) / N), [x, y] = pos(a);
    // leaf
    c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2 + (i % 2 ? 0.8 : -0.8));
    c.fillStyle = lin(c, 0, 0, 0, -0.16, [[0, "#2f6b2a"], [1, "#78c260"]]);
    c.beginPath(); c.ellipse(0, -0.08, 0.04, 0.09, 0, 0, 7); c.fill(); c.restore();
  }
  for (let i = 0; i <= N; i += 1) {
    if (i % 2 === 1 && i % 3 === 0) continue;
    const a = Math.PI * (1.03 + (0.94 * i) / N), [x, y] = pos(a);
    const [c1, c2] = cols[i % cols.length], r = i % 2 ? 0.075 : 0.095;
    c.save(); c.translate(x, y); c.rotate(i);
    drop(c, f, 0.3);
    for (let p = 0; p < 6; p++) {
      c.rotate(Math.PI / 3);
      c.fillStyle = rad(c, 0, -r * 0.7, 0.005, r, [[0, c1], [1, c2]]);
      c.beginPath(); c.ellipse(0, -r * 0.75, r * 0.45, r * 0.8, 0, 0, 7); c.fill();
    }
    noDrop(c);
    c.fillStyle = rad(c, 0, 0, 0.002, r * 0.4, [[0, "#fff1a0"], [1, "#e3a21b"]]);
    c.beginPath(); c.arc(0, 0, r * 0.38, 0, 7); c.fill();
    c.restore();
  }
  c.restore();
}

// ---------------- Bunny ears ----------------
function bunny(c, f) {
  c.save();
  for (const s of [-1, 1]) {
    c.save(); c.translate(s * 0.2, f.top + 0.22); c.rotate(s * 0.2);
    drop(c, f);
    c.fillStyle = lin(c, -0.12, 0, 0.12, 0, [[0, "#cfd0d6"], [0.5, "#ffffff"], [1, "#c4c6cf"]]);
    c.beginPath(); c.ellipse(0, -0.4, 0.12, 0.42, 0, 0, 7); c.fill(); noDrop(c);
    c.fillStyle = lin(c, 0, -0.7, 0, -0.05, [[0, "#ffc6d6"], [1, "#ee8aa8"]]);
    c.beginPath(); c.ellipse(0, -0.38, 0.062, 0.3, 0, 0, 7); c.fill();
    c.restore();
  }
  c.restore();
}

// ---------------- Devil horns ----------------
function horns(c, f) {
  c.save();
  for (const s of [-1, 1]) {
    c.save(); c.translate(s * 0.28, f.top + 0.22); c.scale(s, 1); c.rotate(0.35);
    drop(c, f, 0.45);
    c.beginPath(); c.moveTo(-0.09, 0.02); c.quadraticCurveTo(-0.1, -0.25, -0.14, -0.5);
    c.quadraticCurveTo(0.1, -0.3, 0.09, 0.02); c.closePath();
    c.fillStyle = lin(c, -0.1, 0, 0.1, 0, [[0, "#6d0000"], [0.4, "#ff3b2f"], [1, "#7a0505"]]); c.fill(); noDrop(c);
    c.strokeStyle = "rgba(255,200,190,.5)"; c.lineWidth = 0.012; c.beginPath(); c.moveTo(-0.03, -0.02); c.quadraticCurveTo(-0.04, -0.25, -0.1, -0.44); c.stroke();
    c.restore();
  }
  c.restore();
}

// ---------------- Angel halo ----------------
function halo(c, f) {
  c.save();
  const y = f.top - 0.12;
  c.shadowColor = "rgba(255,220,90,.95)"; c.shadowBlur = f.px * 0.1;
  c.strokeStyle = lin(c, -0.4, 0, 0.4, 0, [[0, "#c8921c"], [0.3, "#fff2a6"], [0.6, "#e8b93a"], [1, "#b57d10"]]);
  c.lineWidth = 0.055; c.beginPath(); c.ellipse(0, y, 0.4, 0.1, 0, 0, 7); c.stroke();
  noDrop(c);
  c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 0.012; c.beginPath(); c.ellipse(0, y - 0.01, 0.4, 0.1, 0, Math.PI * 1.1, Math.PI * 1.8); c.stroke();
  c.restore();
}

// ---------------- Heart-shaped sunglasses ----------------
function heartGlasses(c, f) {
  c.save();
  const heart = (k) => { c.beginPath(); c.moveTo(0, 0.4 * k); c.bezierCurveTo(-0.62 * k, -0.04 * k, -0.45 * k, -0.62 * k, 0, -0.3 * k); c.bezierCurveTo(0.45 * k, -0.62 * k, 0.62 * k, -0.04 * k, 0, 0.4 * k); };
  c.strokeStyle = "#7a0f2e"; c.lineWidth = 0.03; c.lineCap = "round";
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 0.5, -0.08); c.lineTo(s * 0.58, -0.06); c.stroke(); }
  for (const s of [-1, 1]) {
    c.save(); c.translate(s * 0.26, 0.04);
    drop(c, f, 0.4); heart(0.78);
    c.fillStyle = rad(c, 0, -0.05, 0.01, 0.4, [[0, "rgba(255,120,150,.88)"], [1, "rgba(160,10,60,.92)"]], -0.1, -0.15); c.fill(); noDrop(c);
    c.strokeStyle = "#8d1236"; c.lineWidth = 0.04; c.lineJoin = "round"; c.stroke();
    c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.ellipse(-0.12, -0.14, 0.07, 0.035, -0.6, 0, 7); c.fill();
    c.restore();
  }
  c.strokeStyle = "#8d1236"; c.lineWidth = 0.035; c.beginPath(); c.moveTo(-0.06, -0.05); c.quadraticCurveTo(0, -0.1, 0.06, -0.05); c.stroke();
  c.restore();
}

// ---------------- Headphones ----------------
function headphones(c, f) {
  c.save();
  const ry = -(f.top) + 0.1;
  drop(c, f, 0.45);
  c.strokeStyle = lin(c, 0, -ry, 0, 0, [[0, "#4a4f58"], [1, "#16181c"]]); c.lineWidth = 0.075; c.lineCap = "round";
  c.beginPath(); c.ellipse(0, 0.06, 0.66, ry, 0, Math.PI, Math.PI * 2); c.stroke();
  noDrop(c);
  c.strokeStyle = "rgba(255,255,255,.25)"; c.lineWidth = 0.012; c.beginPath(); c.ellipse(0, 0.06, 0.66, ry, 0, Math.PI * 1.15, Math.PI * 1.6); c.stroke();
  for (const s of [-1, 1]) {
    c.save(); c.translate(s * 0.67, 0.08);
    drop(c, f, 0.5);
    c.fillStyle = lin(c, -0.12, 0, 0.12, 0, [[0, "#2a2d33"], [0.4, "#555b66"], [1, "#16181c"]]);
    rrect(c, -0.12, -0.2, 0.24, 0.4, 0.1); c.fill(); noDrop(c);
    c.fillStyle = "#e0302f"; rrect(c, -0.045, -0.12, 0.09, 0.24, 0.045); c.fill();
    c.fillStyle = "rgba(255,255,255,.3)"; rrect(c, -0.1, -0.17, 0.05, 0.12, 0.03); c.fill();
    c.restore();
  }
  c.restore();
}

// ---------------- Santa hat + beard ----------------
function santa(c, f) {
  c.save();
  // beard: soft white arc around the jaw, below the mouth
  const my = f.mouthY - 0.03, by = f.chin + 0.28;
  const jaw = (a) => [Math.cos(a) * 0.56, my + Math.sin(a) * (by - my)];
  drop(c, f, 0.3);
  c.beginPath();
  for (let i = 0; i <= 30; i++) { const [x, y] = jaw((i / 30) * Math.PI); i ? c.lineTo(x, y) : c.moveTo(x, y); }
  c.lineTo(-0.56, my - 0.02); c.quadraticCurveTo(0, my - 0.1, 0.56, my - 0.02); c.closePath();
  c.fillStyle = lin(c, 0, my, 0, by, [[0, "#ffffff"], [1, "#dcdfe8"]]); c.fill(); noDrop(c);
  for (let i = 0; i < 46; i++) {
    const [x, y] = jaw((i / 45) * Math.PI);
    c.fillStyle = rad(c, x, y, 0.005, 0.1, [[0, "#ffffff"], [1, "#d9dce6"]]);
    c.beginPath(); c.arc(x, y, 0.075 + (i % 3) * 0.015, 0, 7); c.fill();
  }
  moustacheWith(c, f, "#ffffff", "#d3d6e2", "rgba(150,150,170,.35)");
  // hat
  c.save(); c.translate(0.04, f.top + 0.2);
  drop(c, f, 0.45);
  c.beginPath(); c.moveTo(-0.5, 0); c.bezierCurveTo(-0.5, -0.55, 0.05, -0.85, 0.5, -0.5); c.lineTo(0.52, 0); c.closePath();
  c.fillStyle = lin(c, -0.5, 0, 0.5, 0, [[0, "#9a0f14"], [0.5, "#e8262c"], [1, "#8c0b10"]]); c.fill(); noDrop(c);
  for (let i = 0; i < 26; i++) {
    const x = -0.56 + i * 0.043;
    c.fillStyle = rad(c, x, -0.02, 0.005, 0.08, [[0, "#fff"], [1, "#dfe2ec"]]);
    c.beginPath(); c.arc(x, -0.02 + (i % 2) * 0.02, 0.07, 0, 7); c.fill();
  }
  c.fillStyle = rad(c, 0.5, -0.45, 0.005, 0.12, [[0, "#fff"], [1, "#d6d9e4"]]); c.beginPath(); c.arc(0.5, -0.42, 0.1, 0, 7); c.fill();
  c.restore();
  c.restore();
}

// ---------------- Character faces (recolour the face + add features) ----------------
const OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

function tint(c, f, color, a = 0.9) {
  c.save();
  c.beginPath(); f.oval.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  c.globalCompositeOperation = "color"; c.globalAlpha = a; c.fillStyle = color; c.fillRect(-1, -1.5, 2, 3);
  c.globalCompositeOperation = "soft-light"; c.globalAlpha = 0.5; c.fillRect(-1, -1.5, 2, 3);
  c.restore();
}

function shrek(c, f) {
  c.save();
  // trumpet ears behind/beside the face
  for (const s of [-1, 1]) {
    c.save(); c.translate(s * 0.5, 0.0); c.scale(s, 1);
    const ear = (k) => { c.beginPath(); c.moveTo(0, 0.14 * k); c.bezierCurveTo(0.1, 0.0, 0.22, -0.14 * k, 0.4, -0.24 * k); c.bezierCurveTo(0.48, -0.05, 0.4, 0.2 * k, 0.12, 0.3 * k); c.closePath(); };
    drop(c, f, 0.4); ear(1);
    c.fillStyle = lin(c, 0, 0, 0.45, 0, [[0, "#6fa22e"], [1, "#a6d450"]]); c.fill(); noDrop(c);
    ear(0.55); c.translate(0.12, 0.02); c.fillStyle = "#b9835a"; c.fill();
    c.restore();
  }
  tint(c, f, "#7fbf3a", 0.92);
  // heavy brow ridge
  c.lineCap = "round"; c.strokeStyle = "rgba(50,85,18,.85)"; c.lineWidth = 0.06;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 0.08, -0.15); c.quadraticCurveTo(s * 0.25, -0.22, s * 0.4, -0.12); c.stroke(); }
  c.strokeStyle = "rgba(255,255,255,.12)"; c.lineWidth = 0.015;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 0.1, -0.18); c.quadraticCurveTo(s * 0.25, -0.25, s * 0.38, -0.15); c.stroke(); }
  c.restore();
}

function minion(c, f) {
  c.save();
  tint(c, f, "#ffd62e", 0.95);
  // goggle strap
  c.fillStyle = "#26262a"; c.fillRect(-0.62, -0.09, 1.24, 0.18);
  c.fillStyle = "rgba(255,255,255,.12)"; c.fillRect(-0.62, -0.09, 1.24, 0.03);
  // goggle ring
  drop(c, f, 0.45);
  c.fillStyle = lin(c, -0.36, -0.36, 0.36, 0.36, [[0, "#f4f6fa"], [0.4, "#8e949e"], [0.7, "#d5d9e0"], [1, "#6b7079"]]);
  c.beginPath(); c.arc(0, 0, 0.36, 0, 7); c.fill(); noDrop(c);
  c.fillStyle = "#4a4f58"; c.beginPath(); c.arc(0, 0, 0.3, 0, 7); c.fill();
  c.fillStyle = rad(c, 0, 0, 0.02, 0.28, [[0, "#ffffff"], [1, "#e4e6ea"]]); c.beginPath(); c.arc(0, 0, 0.27, 0, 7); c.fill();
  c.fillStyle = rad(c, 0, 0, 0.01, 0.11, [[0, "#3a2210"], [0.6, "#7a4b22"], [1, "#4e2f14"]]); c.beginPath(); c.arc(0, 0.01, 0.11, 0, 7); c.fill();
  c.fillStyle = "#000"; c.beginPath(); c.arc(0, 0.01, 0.055, 0, 7); c.fill();
  c.fillStyle = "#fff"; c.beginPath(); c.arc(-0.035, -0.03, 0.025, 0, 7); c.fill();
  c.fillStyle = "rgba(255,255,255,.4)"; c.beginPath(); c.ellipse(-0.12, -0.14, 0.09, 0.04, -0.6, 0, 7); c.fill();
  // wispy hair
  c.strokeStyle = "#1a1a1a"; c.lineWidth = 0.014; c.lineCap = "round";
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.07; c.beginPath(); c.moveTo(x, f.top + 0.08);
    c.quadraticCurveTo(x + i * 0.05, f.top - 0.1, x * 1.8 + (i % 2 ? 0.05 : -0.04), f.top - 0.2 - (3 - Math.abs(i)) * 0.03); c.stroke();
  }
  c.restore();
}

function smurf(c, f) {
  c.save();
  tint(c, f, "#2f8fe0", 0.92);
  // white cap
  c.save(); c.translate(0, f.top + 0.2);
  drop(c, f, 0.4);
  c.beginPath(); c.moveTo(-0.5, 0); c.bezierCurveTo(-0.55, -0.5, -0.1, -0.7, 0.15, -0.55); c.bezierCurveTo(0.3, -0.5, 0.42, -0.42, 0.5, -0.3);
  c.bezierCurveTo(0.35, -0.4, 0.3, -0.3, 0.52, 0); c.closePath();
  c.fillStyle = lin(c, -0.5, 0, 0.5, 0, [[0, "#d7dbea"], [0.5, "#ffffff"], [1, "#cfd4e6"]]); c.fill(); noDrop(c);
  c.strokeStyle = "rgba(0,0,0,.15)"; c.lineWidth = 0.01; c.stroke();
  c.restore();
  c.restore();
}

// ================= face warp engine =================
// A filter may define: pre(c,f) (before the warp), morph([x,y],f) -> [x,y] (reshapes the face),
// draw(c,f) (after the warp; f.M(p) gives where a face point ended up), post(ctx,w,h,faces) (whole frame).
const snapC = document.createElement("canvas");
function grab(c) {
  const cv = c.canvas;
  if (snapC.width !== cv.width || snapC.height !== cv.height) { snapC.width = cv.width; snapC.height = cv.height; }
  const g = snapC.getContext("2d"); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.drawImage(cv, 0, 0);
  return snapC;
}
// Bowyer-Watson Delaunay, run once on the landmark layout of the first face we see
function delaunay(P) {
  const n = P.length, pts = [...P, [-30, -30], [30, -30], [0, 40]];
  const mk = (a, b, c) => {
    const [ax, ay] = pts[a], [bx, by] = pts[b], [cx, cy] = pts[c];
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) || 1e-12;
    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
    return { v: [a, b, c], ux, uy, r2: (ax - ux) ** 2 + (ay - uy) ** 2 };
  };
  let tris = [mk(n, n + 1, n + 2)];
  for (let i = 0; i < n; i++) {
    const [px, py] = pts[i], bad = [], keep = [];
    for (const t of tris) ((px - t.ux) ** 2 + (py - t.uy) ** 2 < t.r2 ? bad : keep).push(t);
    const edges = new Map();
    for (const t of bad) for (const [p, q] of [[t.v[0], t.v[1]], [t.v[1], t.v[2]], [t.v[2], t.v[0]]]) {
      const k = p < q ? `${p},${q}` : `${q},${p}`; edges.set(k, edges.has(k) ? null : [p, q]);
    }
    tris = keep;
    for (const e of edges.values()) if (e) tris.push(mk(e[0], e[1], i));
  }
  return tris.map((t) => t.v).filter((v) => v.every((i) => i < n));
}
export const inPoly = (poly, x, y) => {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
};
let TRIS = null;

export function warpFace(c, f, M) {
  if (!f.pts || !f.src) return;
  if (!TRIS) {
    const P = f.pts.slice(0, 468);
    TRIS = delaunay(P).filter(([i, j, k]) => inPoly(f.oval0 || f.oval, (P[i][0] + P[j][0] + P[k][0]) / 3, (P[i][1] + P[j][1] + P[k][1]) / 3));
  }
  const snap = grab(c), D = f.pts.map((p) => M(p));
  // a blurred copy of the old face goes underneath so a shrunken face never leaves a ghost
  c.save();
  c.beginPath(); (f.oval0 || f.oval).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  c.resetTransform(); c.filter = `blur(${f.px * 0.07}px)`; c.drawImage(snap, 0, 0);
  c.restore();
  c.imageSmoothingQuality = "high";
  for (const [i, j, k] of TRIS) {
    const [s0, s1, s2] = [f.src[i], f.src[j], f.src[k]], [d0, d1, d2] = [D[i], D[j], D[k]];
    const det = (s1[0] - s0[0]) * (s2[1] - s0[1]) - (s2[0] - s0[0]) * (s1[1] - s0[1]);
    if (Math.abs(det) < 1e-3) continue;
    const A = ((d1[0] - d0[0]) * (s2[1] - s0[1]) - (d2[0] - d0[0]) * (s1[1] - s0[1])) / det;
    const C = ((d2[0] - d0[0]) * (s1[0] - s0[0]) - (d1[0] - d0[0]) * (s2[0] - s0[0])) / det;
    const B = ((d1[1] - d0[1]) * (s2[1] - s0[1]) - (d2[1] - d0[1]) * (s1[1] - s0[1])) / det;
    const Dd = ((d2[1] - d0[1]) * (s1[0] - s0[0]) - (d1[1] - d0[1]) * (s2[0] - s0[0])) / det;
    const E = d0[0] - A * s0[0] - C * s0[1], F = d0[1] - B * s0[0] - Dd * s0[1];
    const gx = (d0[0] + d1[0] + d2[0]) / 3, gy = (d0[1] + d1[1] + d2[1]) / 3;
    const grow = (d) => [d[0] + Math.sign(d[0] - gx) * 0.004, d[1] + Math.sign(d[1] - gy) * 0.004];
    c.save();
    c.beginPath(); [d0, d1, d2].map(grow).forEach(([x, y], n) => (n ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
    c.transform(A, B, C, Dd, E, F);
    const x0 = Math.max(0, Math.min(s0[0], s1[0], s2[0]) - 3), y0 = Math.max(0, Math.min(s0[1], s1[1], s2[1]) - 3);
    const x1 = Math.min(snap.width, Math.max(s0[0], s1[0], s2[0]) + 3), y1 = Math.min(snap.height, Math.max(s0[1], s1[1], s2[1]) + 3);
    if (x1 > x0 && y1 > y0) c.drawImage(snap, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
    c.restore();
  }
}

// ---------------- Monkey: reshapes the face (bigger muzzle, closer bigger eyes, sloping forehead) ----------------
function monkeyMorph([x, y], f) {
  const my = (f.noseY + f.mouthY) / 2;
  let dx = 0, dy = 0;
  const gm = Math.exp(-((x / 0.32) ** 2 + ((y - my - 0.03) / 0.3) ** 2));
  dx += x * 0.42 * gm; dy += (y - my) * 0.3 * gm + 0.07 * gm;
  for (const s of [-1, 1]) {
    const ex = s * 0.22, ge = Math.exp(-(((x - ex) / 0.17) ** 2 + (y / 0.13) ** 2));
    dx += ((x - ex) * 0.45 - s * 0.03) * ge; dy += (y * 0.45 - 0.01) * ge;
  }
  if (y < -0.12) dy += (-0.12 - y) * 0.3;
  if (y > my + 0.25) dy += (y - my - 0.25) * 0.15;
  dx += x * 0.06;
  return [x + dx, y + dy];
}
function monkeyPre(c, f) {
  for (const s of [-1, 1]) {   // big round ears behind the head
    const ex = s * 0.55, ey = 0;
    drop(c, f, 0.4);
    c.fillStyle = rad(c, ex, ey, 0.02, 0.22, [[0, "#9a6a3e"], [1, "#4f2f15"]], ex - s * 0.04, ey - 0.05);
    c.beginPath(); c.arc(ex, ey, 0.2, 0, 7); c.fill(); noDrop(c);
    c.fillStyle = rad(c, ex, ey, 0.01, 0.17, [[0, "#f3cfab"], [1, "#d89f78"]]);
    c.beginPath(); c.arc(ex - s * 0.03, ey, 0.13, 0, 7); c.fill();
  }
  tint(c, f, "#8a5a30", 0.93);
}
function monkeyDraw(c, f) {
  const oval = f.oval;
  c.save();
  c.beginPath(); oval.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  const my = f.M([0, (f.noseY + f.mouthY) / 2])[1];
  c.beginPath();
  for (const s of [-1, 1]) { c.moveTo(s * 0.17 + 0.23, 0); c.ellipse(s * 0.17, -0.01, 0.23, 0.19, s * 0.15, 0, 7); }
  c.moveTo(0.36, my + 0.03); c.ellipse(0, my + 0.03, 0.36, 0.27, 0, 0, 7);
  c.filter = `blur(${f.px * 0.012}px)`;
  c.globalCompositeOperation = "color"; c.globalAlpha = 0.75; c.fillStyle = "#f1c9a0"; c.fill();
  c.globalCompositeOperation = "soft-light"; c.globalAlpha = 0.7; c.fill();
  c.restore();
  c.save(); c.lineCap = "round"; c.lineWidth = 0.009;
  oval.forEach(([x, y], i) => {
    const l = Math.hypot(x, y - 0.1) || 1, ox = x / l, oy = (y - 0.1) / l;
    for (let k = 0; k < 2; k++) {
      c.strokeStyle = k % 2 ? "#6b4121" : "#4a2a12";
      const o = (k - 0.5) * 0.02, len = 0.022 + ((i * 7 + k * 3) % 5) * 0.007;
      c.beginPath(); c.moveTo(x - oy * o - ox * 0.015, y + ox * o - oy * 0.015); c.lineTo(x - oy * o + ox * len, y + ox * o + oy * len); c.stroke();
    }
  });
  const [nx, ny] = f.M([0.04, f.noseY]);
  c.fillStyle = "rgba(50,24,10,.85)";
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * nx * 1.1, ny + 0.01, 0.024, 0.034, s * 0.4, 0, 7); c.fill(); }
  c.strokeStyle = "rgba(55,28,12,.85)"; c.lineWidth = 0.045;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 0.04, -0.17); c.quadraticCurveTo(s * 0.2, -0.24, s * 0.38, -0.14); c.stroke(); }
  c.strokeStyle = "#4a2a12"; c.lineWidth = 0.03;
  const tt = f.top + 0.12;
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.065; c.beginPath(); c.moveTo(x, tt);
    c.quadraticCurveTo(x + i * 0.03, tt - 0.12, x * 1.5, tt - 0.18 - (4 - Math.abs(i)) * 0.025); c.stroke();
  }
  c.restore();
}

function zombie(c, f) {
  c.save();
  tint(c, f, "#8da56e", 0.85);
  // sunken dark eyes
  for (const s of [-1, 1]) {
    c.fillStyle = rad(c, s * 0.24, 0.02, 0.01, 0.17, [[0, "rgba(10,5,10,.85)"], [1, "rgba(30,15,30,0)"]]);
    c.beginPath(); c.arc(s * 0.24, 0.02, 0.17, 0, 7); c.fill();
  }
  // stitched scar
  c.strokeStyle = "#5a1a1a"; c.lineWidth = 0.02; c.lineCap = "round";
  c.beginPath(); c.moveTo(-0.3, f.top + 0.22); c.lineTo(0.06, f.top + 0.34); c.stroke();
  c.strokeStyle = "#1c1210"; c.lineWidth = 0.012;
  for (let i = 0; i < 6; i++) { const x = -0.3 + i * 0.07, y = f.top + 0.22 + i * 0.02; c.beginPath(); c.moveTo(x, y - 0.045); c.lineTo(x + 0.01, y + 0.045); c.stroke(); }
  // blood drip at mouth
  c.fillStyle = "rgba(150,10,15,.85)";
  c.beginPath(); c.moveTo(0.1, f.mouthY + 0.04); c.quadraticCurveTo(0.12, f.mouthY + 0.25, 0.14, f.mouthY + 0.3); c.quadraticCurveTo(0.17, f.mouthY + 0.28, 0.16, f.mouthY + 0.04); c.fill();
  c.restore();
}

// z = draw order (face skin first, then face-level items, then head accessories)
export const EFFECTS = [
  { id: "shrek", name: "Shrek", z: 0, draw: shrek },
  { id: "minion", name: "Minion", z: 0, draw: minion },
  { id: "smurf", name: "Smurf", z: 0, draw: smurf },
  { id: "zombie", name: "Zombie", z: 0, draw: zombie },
  { id: "monkey", name: "Monkey", z: 0, pre: monkeyPre, morph: monkeyMorph, draw: monkeyDraw },
  { id: "robot", name: "Robot head", z: 3, draw: robot },
  { id: "sunglasses", name: "Sunglasses", z: 2, draw: sunglasses },
  { id: "heartglasses", name: "Heart glasses", z: 2, draw: heartGlasses },
  { id: "cat", name: "Cat ears", z: 1, draw: cat },
  { id: "bunny", name: "Bunny ears", z: 3, draw: bunny },
  { id: "horns", name: "Devil horns", z: 3, draw: horns },
  { id: "halo", name: "Angel halo", z: 3, draw: halo },
  { id: "crown", name: "Crown", z: 3, draw: crown },
  { id: "party", name: "Party hat", z: 3, draw: partyHat },
  { id: "santa", name: "Santa", z: 3, draw: santa },
  { id: "moustache", name: "Moustache", z: 1, draw: moustache },
  { id: "flowers", name: "Flower crown", z: 3, draw: flowerCrown },
  { id: "headphones", name: "Headphones", z: 3, draw: headphones },
];

const warned = new Set();
const safe = (e, fn) => { try { fn(); } catch (err) { if (!warned.has(e.id)) { warned.add(e.id); console.error("filter failed:", e.id, err); } } };

export function drawEffects(ctx, faces, ids) {
  const act = EFFECTS.filter((e) => ids.has(e.id)).sort((a, b) => a.z - b.z);
  if (!act.length) return;
  const morphs = act.filter((e) => e.morph);
  for (const f of faces) {
    ctx.save(); ctx.translate(f.cx, f.cy); ctx.rotate(f.roll); ctx.scale(f.px, f.px);
    for (const e of act) if (e.pre) { ctx.save(); safe(e, () => e.pre(ctx, f)); ctx.restore(); }
    let f2 = { ...f, oval0: f.oval, M: (p) => p };
    if (morphs.length) {
      const M = (p) => { let q = p; for (const e of morphs) q = e.morph(q, f); return q; };
      f2 = { ...f, oval0: f.oval, M, oval: f.oval.map(M) };
      ctx.save(); safe(morphs[0], () => warpFace(ctx, f2, M)); ctx.restore();
    }
    for (const e of act) if (e.draw) { ctx.save(); safe(e, () => e.draw(ctx, f2)); ctx.restore(); }
    ctx.restore();
  }
  for (const e of act) if (e.post) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); safe(e, () => e.post(ctx, ctx.canvas.width, ctx.canvas.height, faces)); ctx.restore(); }
}

// Turn MediaPipe landmarks into a face frame in canvas pixels (mirrored, cover-fit like the video).
export function faceFrame(lm, cw, ch, vw, vh) {
  const s = Math.max(cw / vw, ch / vh), ox = (cw - vw * s) / 2, oy = (ch - vh * s) / 2;
  const P = (i) => ({ x: cw - (ox + lm[i].x * vw * s), y: oy + lm[i].y * vh * s });
  const a = P(263), b = P(33), l = P(234), r = P(454);
  const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
  const roll = Math.atan2(b.y - a.y, b.x - a.x);
  const px = Math.hypot(r.x - l.x, r.y - l.y);
  const cos = Math.cos(roll), sin = Math.sin(roll);
  const xy = (i) => { const p = P(i), dx = p.x - cx, dy = p.y - cy; return [(dx * cos + dy * sin) / px, (-dx * sin + dy * cos) / px]; };
  const loc = (i) => xy(i)[1];
  const pts = Array.from({ length: 468 }, (_, i) => xy(i)), src = Array.from({ length: 468 }, (_, i) => { const p = P(i); return [p.x, p.y]; });
  return { cx, cy, roll, px, top: loc(10) - 0.06, chin: loc(152), noseY: loc(1), mouthY: loc(13), oval: OVAL.map(xy), pts, src };
}

// Small preview card for the effect picker: a cartoon face run through the real pipeline.
export function drawIcon(canvas, effect) {
  const w = (canvas.width = 150), h = (canvas.height = 130), c = canvas.getContext("2d");
  const px = 58, ox = w / 2, oy = h * 0.5;
  const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, "#2a1450"); bg.addColorStop(1, "#150a2c");
  c.fillStyle = bg; c.fillRect(0, 0, w, h);
  c.save(); c.translate(ox, oy); c.scale(px, px);
  const oval = MESH.oval;
  c.fillStyle = "#2a1c14"; c.beginPath(); c.ellipse(0, -0.12, 0.6, 0.62, 0, 0, 7); c.fill();                   // hair
  c.fillStyle = "#d9a37c"; c.beginPath(); oval.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); // face
  c.fillStyle = "#2a1c14"; c.beginPath(); c.ellipse(0, -0.28, 0.5, 0.2, 0, Math.PI, 0); c.fill();                // fringe
  for (const s of [-1, 1]) {
    c.fillStyle = "#fff"; c.beginPath(); c.ellipse(s * 0.2, 0, 0.075, 0.04, 0, 0, 7); c.fill();
    c.fillStyle = "#2a1c14"; c.beginPath(); c.arc(s * 0.2, 0, 0.034, 0, 7); c.fill();
    c.strokeStyle = "#2a1c14"; c.lineWidth = 0.02; c.beginPath(); c.moveTo(s * 0.1, -0.1); c.lineTo(s * 0.3, -0.09); c.stroke();
  }
  c.strokeStyle = "#b9805c"; c.lineWidth = 0.02; c.beginPath(); c.moveTo(0, 0.05); c.lineTo(-0.03, MESH.noseY - 0.03); c.lineTo(0.03, MESH.noseY - 0.01); c.stroke();
  c.strokeStyle = "#9c4a44"; c.lineWidth = 0.03; c.lineCap = "round"; c.beginPath(); c.arc(0, MESH.mouthY - 0.07, 0.1, 0.25, Math.PI - 0.25); c.stroke();
  c.restore();
  const f = { cx: ox, cy: oy, roll: 0, px, top: MESH.top, chin: MESH.chin, noseY: MESH.noseY, mouthY: MESH.mouthY, oval, pts: MESH.pts, src: MESH.pts.map(([x, y]) => [ox + x * px, oy + y * px]) };
  drawEffects(c, [f], new Set([effect.id]));
}

export { rrect, lin, rad, drop, noDrop, tint, grab, OVAL };
