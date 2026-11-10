// Shared building blocks for the filter packs. Everything draws in "face space" (1 unit = face width,
// origin between the eyes, +y down) unless it is a `post` effect, which works on the whole frame in pixels.
import { EFFECTS, rrect, lin, rad, drop, noDrop, tint, grab } from "./effects.js";
export { EFFECTS, rrect, lin, rad, drop, noDrop, tint, grab };

export const T = Math.PI * 2;
export const CATS = [];

// ---------- registry ----------
export function category(id, label, icon) {
  CATS.push({ id, label, icon });
  return (key, name, def) => EFFECTS.push({ id: key, name, cat: id, z: 1, ...def });
}

// add more filters to a category that already exists
export const into = (id) => (key, name, def) => EFFECTS.push({ id: key, name, cat: id, z: 1, ...def });

// ---------- drawing primitives ----------
const paint = (c, fill, line, lw = 0.012) => {
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (line) { c.strokeStyle = line; c.lineWidth = lw; c.lineJoin = "round"; c.stroke(); }
};
export const circle = (c, x, y, r, fill, line, lw) => { c.beginPath(); c.arc(x, y, r, 0, T); paint(c, fill, line, lw); };
export const ell = (c, x, y, rx, ry, fill, rot = 0, line, lw) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, T); paint(c, fill, line, lw); };
export const poly = (c, pts, fill, line, lw) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); paint(c, fill, line, lw); };
export const rect = (c, x, y, w, h, fill, line, lw, r = 0) => { c.beginPath(); c.roundRect(x, y, w, h, r); paint(c, fill, line, lw); };
export const stroke = (c, pts, col, lw = 0.02) => {
  c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.strokeStyle = col; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round"; c.stroke();
};
export const curve = (c, a, cp, b, col, lw = 0.02) => {
  c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(cp[0], cp[1], b[0], b[1]);
  c.strokeStyle = col; c.lineWidth = lw; c.lineCap = "round"; c.stroke();
};
export const star = (c, x, y, r, fill, n = 5, k = 0.45, rot = -Math.PI / 2) => {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rot + (i * Math.PI) / n, rr = i % 2 ? r * k : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); }
};
export const heart = (c, x, y, s, fill, line) => {
  c.beginPath(); c.moveTo(x, y + s * 0.9);
  c.bezierCurveTo(x - s * 1.5, y - s * 0.1, x - s * 0.7, y - s * 1.1, x, y - s * 0.4);
  c.bezierCurveTo(x + s * 0.7, y - s * 1.1, x + s * 1.5, y - s * 0.1, x, y + s * 0.9); c.closePath(); paint(c, fill, line);
};
export const glow = (c, f, col, k = 0.08) => { c.shadowColor = col; c.shadowBlur = f.px * k; };
export const R = (a, b) => a + Math.random() * (b - a);
const seeded = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export { seeded };
export const both = (fn) => { fn(-1); fn(1); };
export const clipOval = (c, f) => { c.beginPath(); f.oval.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip(); };
export const combine = (...fns) => (c, f) => fns.forEach((fn) => { c.save(); fn(c, f); c.restore(); });
export const skin = (col, a = 0.9) => (c, f) => tint(c, f, col, a);

// ---------- face anchors (follow the face when a warp has moved things) ----------
export const A = (f) => {
  const M = f.M;
  return {
    eL: M([-0.2, 0]), eR: M([0.2, 0]), nose: M([0, f.noseY]), mouth: M([0, f.mouthY]), chin: M([0, f.chin]),
    brL: M([-0.2, -0.11]), brR: M([0.2, -0.11]), cL: M([-0.3, 0.28]), cR: M([0.3, 0.28]), fore: M([0, -0.26]),
    top: M([0, f.top]), tL: M([-0.46, -0.05]), tR: M([0.46, -0.05]), jL: M([-0.36, 0.55]), jR: M([0.36, 0.55]),
    mL: M([-0.12, f.mouthY]), mR: M([0.12, f.mouthY]),
  };
};

// ---------- sample the person's skin colour (used to paint over hair etc.) ----------
let skinCache = { t: 0, col: "#d9a37c" };
export function skinColor(c, f) {
  const now = performance.now();
  if (now - skinCache.t < 400) return skinCache.col;
  try {
    const s = grab(c), [x, y] = f.src ? f.src[151] || f.src[10] : [s.width / 2, s.height / 2];
    const d = s.getContext("2d").getImageData(Math.max(0, x - 3), Math.max(0, y + 2), 6, 6).data;
    let r = 0, g = 0, b = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    const n = d.length / 4; skinCache = { t: now, col: `rgb(${(r / n) | 0},${(g / n) | 0},${(b / n) | 0})` };
  } catch { skinCache.t = now; }
  return skinCache.col;
}

// ---------- warps: a list of gaussian "bulges" that push/scale parts of the face ----------
// item: { at:[x,y], r:[rx,ry], push:[dx,dy], scale:[sx,sy] }   scale >0 grows the area around `at`
export const warp = (...items) => ([x, y]) => {
  let dx = 0, dy = 0;
  for (const it of items) {
    const [cx, cy] = it.at, [rx, ry] = it.r, g = Math.exp(-(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2));
    const [px = 0, py = 0] = it.push || [], [sx = 0, sy = 0] = it.scale || [];
    dx += g * (px + (x - cx) * sx); dy += g * (py + (y - cy) * sy);
  }
  return [x + dx, y + dy];
};
export const BIG = [9, 9];

// ---------- animal parts ----------
export function ears(shape, col, inner, o = {}) {
  const { x = 0.3, y = 0, w = 0.2, h = 0.3, tilt = 0.25, rim } = o;
  return (c, f) => {
    both((s) => {
      const [bx, by] = f.M([s * x, f.top + y]);
      c.save(); c.translate(bx, by); c.rotate(s * tilt); drop(c, f, 0.3);
      if (shape === "round") { circle(c, 0, -w * 0.3, w, col, rim); noDrop(c); circle(c, 0, -w * 0.3, w * 0.62, inner); }
      else if (shape === "point") {
        c.beginPath(); c.moveTo(-w, 0.04); c.quadraticCurveTo(-w * 0.6, -h * 0.7, 0, -h); c.quadraticCurveTo(w * 0.6, -h * 0.7, w, 0.04); c.closePath(); paint(c, col, rim); noDrop(c);
        c.beginPath(); c.moveTo(-w * 0.55, 0.02); c.quadraticCurveTo(-w * 0.3, -h * 0.55, 0, -h * 0.72); c.quadraticCurveTo(w * 0.3, -h * 0.55, w * 0.55, 0.02); c.closePath(); paint(c, inner);
      } else if (shape === "long") { ell(c, 0, -h * 0.6, w, h, col, 0, rim); noDrop(c); ell(c, 0, -h * 0.55, w * 0.55, h * 0.78, inner); }
      else if (shape === "floppy") { c.restore(); c.save(); const [fx, fy] = f.M([s * 0.45, f.top + 0.18]); c.translate(fx, fy); c.rotate(s * 0.35); ell(c, 0, 0.12, w * 0.8, h, col, 0, rim); noDrop(c); }
      c.restore();
    });
  };
}
export function snout(col, nose, o = {}) {
  const { w = 0.2, h = 0.15, tongue, mouth = true, nostrils, yo = 0 } = o;
  return (c, f) => {
    const a = A(f), [nx, ny] = a.nose;
    ell(c, nx, ny - 0.02 + yo, w, h, col);
    if (nostrils) both((s) => ell(c, nx + s * w * 0.35, ny + yo, 0.025, 0.035, nostrils));
    else ell(c, nx, ny - 0.07 + yo, 0.07, 0.05, nose);
    if (mouth) { stroke(c, [[nx, ny - 0.03 + yo], [nx, ny + 0.05 + yo]], "#3a2018", 0.012); curve(c, [nx, ny + 0.05 + yo], [nx - 0.06, ny + 0.1 + yo], [nx - 0.1, ny + 0.05 + yo], "#3a2018", 0.012); curve(c, [nx, ny + 0.05 + yo], [nx + 0.06, ny + 0.1 + yo], [nx + 0.1, ny + 0.05 + yo], "#3a2018", 0.012); }
    if (tongue) { const [mx, my] = a.mouth; ell(c, mx, my + 0.07, 0.07, 0.1, "#ff6b8a", 0, "#c4405e", 0.01); stroke(c, [[mx, my + 0.02], [mx, my + 0.12]], "#c4405e", 0.008); }
  };
}
export const whiskers = (col = "#fff", n = 3, len = 0.3) => (c, f) => {
  const a = A(f);
  both((s) => { for (let i = 0; i < n; i++) { const [x, y] = s < 0 ? a.cL : a.cR, k = (i - (n - 1) / 2) * 0.07; stroke(c, [[x - s * 0.04, y - 0.1 + k], [x + s * len, y - 0.12 + k * 2.2]], col, 0.008); } });
};
export const stripes = (col, n = 4) => (c, f) => {
  c.save(); clipOval(c, f); c.fillStyle = col;
  both((s) => { for (let i = 0; i < n; i++) { const y = -0.2 + i * 0.15; c.beginPath(); c.moveTo(s * 0.52, y - 0.03); c.quadraticCurveTo(s * 0.34, y + 0.02, s * (0.26 - i * 0.015), y + 0.06); c.quadraticCurveTo(s * 0.34, y + 0.05, s * 0.52, y + 0.07); c.fill(); } });
  for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * 0.08 - 0.015, f.top); c.lineTo(i * 0.08 + 0.015, f.top); c.lineTo(i * 0.06 + 0.005, f.top + 0.2); c.fill(); }
  c.restore();
};
export const blush = (col, r = 0.1, a = 0.5) => (c, f) => {
  const ar = A(f);
  [ar.cL, ar.cR].forEach(([x, y]) => { c.fillStyle = rad(c, x, y, 0.005, r, [[0, col], [1, "rgba(255,255,255,0)"]]); c.globalAlpha = a; c.beginPath(); c.arc(x, y, r, 0, T); c.fill(); });
};
export const eyeShine = (col = "#fff") => (c, f) => { const a = A(f); [a.eL, a.eR].forEach(([x, y]) => circle(c, x - 0.015, y - 0.015, 0.012, col)); };

// ---------- hats (anchored on the top of the head) ----------
const headTop = (f) => f.M([0, f.top + 0.03]);
export const HAT = {
  cowboy(c, f) { const [x, y] = headTop(f); drop(c, f, 0.4); ell(c, x, y + 0.02, 0.8, 0.14, "#8a5a2c", 0, "#5a3716"); noDrop(c);
    c.beginPath(); c.moveTo(x - 0.34, y); c.bezierCurveTo(x - 0.36, y - 0.3, x - 0.2, y - 0.38, x - 0.06, y - 0.34); c.quadraticCurveTo(x, y - 0.28, x + 0.06, y - 0.34); c.bezierCurveTo(x + 0.2, y - 0.38, x + 0.36, y - 0.3, x + 0.34, y); c.closePath(); paint(c, "#a06a34", "#5a3716");
    rect(c, x - 0.34, y - 0.1, 0.68, 0.06, "#3a2210"); rect(c, x - 0.04, y - 0.105, 0.08, 0.07, "#e3b23c"); },
  witch(c, f) { const [x, y] = headTop(f); drop(c, f, 0.4); ell(c, x, y + 0.02, 0.62, 0.11, "#1c1326", 0, "#0b0710"); noDrop(c);
    poly(c, [[x - 0.34, y], [x - 0.12, y - 0.55], [x + 0.06, y - 0.78], [x + 0.2, y - 0.62], [x + 0.34, y]], "#241733", "#0b0710"); rect(c, x - 0.35, y - 0.12, 0.7, 0.09, "#7b3fbf"); rect(c, x - 0.05, y - 0.125, 0.1, 0.1, "#e3c23c", "#8a6d10", 0.008); },
  wizard(c, f) { const [x, y] = headTop(f); drop(c, f, 0.4); ell(c, x, y + 0.02, 0.62, 0.1, "#2c3fa8", 0, "#16205a"); noDrop(c);
    poly(c, [[x - 0.36, y], [x - 0.14, y - 0.6], [x + 0.18, y - 0.95], [x + 0.2, y - 0.6], [x + 0.36, y]], "#3550d1", "#16205a"); [[-0.1, -0.2], [0.1, -0.45], [-0.02, -0.6], [0.14, -0.14]].forEach(([dx, dy], i) => star(c, x + dx, y + dy, 0.05 - i * 0.004, "#ffe27a")); },
  pirate(c, f) { const [x, y] = headTop(f); drop(c, f, 0.4);
    poly(c, [[x - 0.6, y + 0.02], [x - 0.5, y - 0.28], [x - 0.2, y - 0.4], [x, y - 0.3], [x + 0.2, y - 0.4], [x + 0.5, y - 0.28], [x + 0.6, y + 0.02], [x + 0.3, y + 0.06], [x, y - 0.02], [x - 0.3, y + 0.06]], "#1d1d22", "#0a0a0c"); noDrop(c);
    circle(c, x, y - 0.17, 0.05, "#f4f4f4"); rect(c, x - 0.03, y - 0.13, 0.06, 0.04, "#f4f4f4"); stroke(c, [[x - 0.09, y - 0.07], [x + 0.09, y - 0.13]], "#f4f4f4", 0.014); stroke(c, [[x - 0.09, y - 0.13], [x + 0.09, y - 0.07]], "#f4f4f4", 0.014);
    poly(c, [[x - 0.6, y + 0.02], [x - 0.5, y - 0.28], [x - 0.2, y - 0.4]], null, "#c9a227", 0.014); },
  grad(c, f) { const [x, y] = headTop(f); drop(c, f, 0.4);
    poly(c, [[x - 0.58, y - 0.1], [x, y - 0.3], [x + 0.58, y - 0.1], [x, y + 0.1]], "#15151a", "#000"); noDrop(c);
    rect(c, x - 0.26, y, 0.52, 0.12, "#202028"); stroke(c, [[x, y - 0.1], [x + 0.46, y - 0.04], [x + 0.46, y + 0.2]], "#e3b23c", 0.014); circle(c, x + 0.46, y + 0.22, 0.03, "#e3b23c"); },
  chef(c, f) { const [x, y] = headTop(f); drop(c, f, 0.35);
    [[-0.26, -0.1, 0.19], [0.26, -0.1, 0.19], [-0.12, -0.28, 0.22], [0.14, -0.3, 0.22], [0, -0.14, 0.22]].forEach(([dx, dy, r]) => circle(c, x + dx, y + dy, r, "#fff", "#d6d6dc", 0.008)); noDrop(c);
    rect(c, x - 0.36, y - 0.04, 0.72, 0.14, "#fff", "#d6d6dc", 0.008, 0.03); },
  fedora(c, f) { const [x, y] = headTop(f); drop(c, f, 0.4); ell(c, x, y + 0.02, 0.62, 0.12, "#4b4f58", 0, "#25272c"); noDrop(c);
    c.beginPath(); c.moveTo(x - 0.34, y); c.quadraticCurveTo(x - 0.34, y - 0.34, x - 0.1, y - 0.3); c.quadraticCurveTo(x, y - 0.24, x + 0.1, y - 0.3); c.quadraticCurveTo(x + 0.34, y - 0.34, x + 0.34, y); c.closePath(); paint(c, "#5d626d", "#25272c"); rect(c, x - 0.34, y - 0.09, 0.68, 0.07, "#222"); },
  hardhat(c, f) { const [x, y] = headTop(f); drop(c, f, 0.4);
    c.beginPath(); c.moveTo(x - 0.5, y + 0.04); c.bezierCurveTo(x - 0.5, y - 0.45, x + 0.5, y - 0.45, x + 0.5, y + 0.04); c.closePath(); paint(c, "#ffcc1f", "#b78900"); noDrop(c);
    rect(c, x - 0.07, y - 0.34, 0.14, 0.34, "#f0b800"); rect(c, x - 0.6, y, 1.2, 0.07, "#ffcc1f", "#b78900", 0.01, 0.03); },
  tricorn: null,
  party(c, f) { const [x, y] = headTop(f); poly(c, [[x - 0.2, y + 0.02], [x, y - 0.5], [x + 0.2, y + 0.02]], "#ff5fa8", "#b23672"); circle(c, x, y - 0.5, 0.05, "#ffe27a"); },
  crown(c, f) { const [x, y] = headTop(f); drop(c, f, 0.4); poly(c, [[x - 0.3, y + 0.02], [x - 0.34, y - 0.28], [x - 0.15, y - 0.12], [x, y - 0.34], [x + 0.15, y - 0.12], [x + 0.34, y - 0.28], [x + 0.3, y + 0.02]], "#f6c945", "#b38600"); noDrop(c);
    [[-0.34, -0.28], [0, -0.34], [0.34, -0.28]].forEach(([dx, dy]) => circle(c, x + dx, y + dy, 0.03, "#ff4d6d")); circle(c, x, y - 0.08, 0.035, "#4dd2ff"); },
};

// ---------- full-frame helpers (pixels) ----------
let noiseTile = null;
const noise = () => {
  if (noiseTile) return noiseTile;
  noiseTile = document.createElement("canvas"); noiseTile.width = noiseTile.height = 160;
  const g = noiseTile.getContext("2d"), d = g.createImageData(160, 160);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); return noiseTile;
};
export const grain = (ctx, w, h, a = 0.18) => {
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = ctx.createPattern(noise(), "repeat"); ctx.translate(-Math.random() * 160, -Math.random() * 160); ctx.fillRect(0, 0, w + 160, h + 160); ctx.restore();
};
export const vignette = (ctx, w, h, a = 0.55, col = "0,0,0") => {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
};
export const wash = (ctx, w, h, col, mode = "soft-light", a = 0.5) => { ctx.save(); ctx.globalCompositeOperation = mode; ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(0, 0, w, h); ctx.restore(); };
export const refilter = (ctx, w, h, filter) => { const s = grab(ctx); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = filter; ctx.drawImage(s, 0, 0); ctx.restore(); };
const tmp = document.createElement("canvas");
export const pixelate = (ctx, w, h, cell, clipFn) => {
  const s = grab(ctx), tw = Math.max(1, Math.round(w / cell)), th = Math.max(1, Math.round(h / cell));
  tmp.width = tw; tmp.height = th; const g = tmp.getContext("2d"); g.imageSmoothingEnabled = true; g.drawImage(s, 0, 0, tw, th);
  ctx.save(); if (clipFn) clipFn(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(tmp, 0, 0, tw, th, 0, 0, w, h); ctx.restore();
};
export const posterize = (ctx, w, h, levels = 4, boost = 1) => {
  const img = ctx.getImageData(0, 0, w, h), d = img.data, k = 255 / (levels - 1);
  for (let i = 0; i < d.length; i += 4) for (let j = 0; j < 3; j++) d[i + j] = Math.round(Math.min(255, Math.max(0, (d[i + j] - 128) * boost + 128)) / k) * k;
  ctx.putImageData(img, 0, 0);
};
export const sketch = (ctx, w, h) => {
  const s = grab(ctx); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.filter = "grayscale(1) contrast(1.1)"; ctx.drawImage(s, 0, 0);
  ctx.globalCompositeOperation = "color-dodge"; ctx.filter = "grayscale(1) invert(1) blur(7px)"; ctx.drawImage(s, 0, 0); ctx.restore();
};
export const halftone = (ctx, w, h, step = 9, col = "rgba(20,10,40,.55)") => {
  ctx.save(); ctx.fillStyle = col;
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) { ctx.beginPath(); ctx.arc(x + ((y / step) % 2) * step / 2, y, step * 0.18, 0, T); ctx.fill(); }
  ctx.restore();
};
export const stamp = (ctx, w, h, text, col = "#ff9a2e", size = 34) => {
  const k = ctx.canvas.width / 960; size *= k; w /= 1; 
  ctx.save(); ctx.font = `700 ${size}px "Courier New", monospace`; ctx.textAlign = "right"; ctx.shadowColor = col; ctx.shadowBlur = 8; ctx.fillStyle = col; ctx.fillText(text, w - 30 * k, h - 28 * k); ctx.restore();
};
export const dateText = (sep = " ") => { const d = new Date(), p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear() % 100}${sep}${p(d.getMonth() + 1)}${sep}${p(d.getDate())}`; };
export const timeText = () => { const d = new Date(), p = (n) => String(n).padStart(2, "0"); return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; };
export const scanlines = (ctx, w, h, a = 0.18, gap = 4) => { ctx.save(); ctx.fillStyle = `rgba(0,0,0,${a})`; for (let y = 0; y < h; y += gap) ctx.fillRect(0, y, w, gap / 2); ctx.restore(); };
export const label = (ctx, text, x, y, size, col = "#fff", font = "Inter, system-ui, sans-serif", weight = 800, align = "left", sh) => {
  const k = ctx.canvas.width / 960; size *= k;
  ctx.save(); ctx.font = `${weight} ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = "middle"; if (sh) { ctx.shadowColor = sh; ctx.shadowBlur = size * 0.4; } ctx.fillStyle = col; ctx.fillText(text, x, y); ctx.restore();
};
export const speedLines = (ctx, w, h, col = "rgba(255,255,255,.35)", n = 60) => {
  ctx.save(); ctx.translate(w / 2, h / 2); ctx.fillStyle = col;
  for (let i = 0; i < n; i++) { const a = (i / n) * T + seeded(i) * 0.1, r0 = Math.max(w, h) * (0.28 + seeded(i + 9) * 0.1), r1 = Math.max(w, h) * 0.8, wd = 0.012 + seeded(i + 3) * 0.02;
    ctx.beginPath(); ctx.moveTo(Math.cos(a - wd) * r1, Math.sin(a - wd) * r1); ctx.lineTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a + wd) * r1, Math.sin(a + wd) * r1); ctx.fill(); }
  ctx.restore();
};
export const sparkle = (c, x, y, r, col = "#fff") => { c.save(); c.fillStyle = col; c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill(); c.restore(); };
export const tick = () => performance.now() / 1000;

// face-space shapes drawn in a face-aligned frame (used by many beauty/fantasy filters)
export const gemRow = (c, pts, cols, r = 0.016) => pts.forEach(([x, y], i) => { circle(c, x, y, r, cols[i % cols.length], "rgba(255,255,255,.8)", 0.004); circle(c, x - r * 0.3, y - r * 0.3, r * 0.3, "rgba(255,255,255,.9)"); });
export const wing = (c, s, x, y, col, col2, size = 0.7, rot = 0) => {
  c.save(); c.translate(x, y); c.scale(s, 1); c.rotate(rot * s);
  c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(size * 0.4, -size * 0.9, size * 1.2, -size * 0.7, size * 1.1, -size * 0.1); c.bezierCurveTo(size * 1.05, size * 0.2, size * 0.5, size * 0.1, 0, 0); c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = col2; c.lineWidth = 0.012; c.stroke();
  c.beginPath(); c.moveTo(0, 0.02); c.bezierCurveTo(size * 0.3, size * 0.1, size * 0.8, size * 0.6, size * 0.5, size * 0.75); c.bezierCurveTo(size * 0.2, size * 0.7, size * 0.05, size * 0.3, 0, 0.02); c.fillStyle = col; c.fill(); c.stroke();
  c.restore();
};
