import { FilesetResolver, FaceLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";
import { drawEffects, drawIcon, faceFrame } from "./effects.js";
import { EFFECTS, CATS } from "./filters.js";

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHOTS = 5;

// ---------- templates (slot coordinates are in template pixels, same as 1.py) ----------
const box = (x0, y0, x1, y1) => ({ cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0, angle: 0 });
const TEMPLATES = [
  { id: "modern4", name: "Sunset strip", cat: "4", file: "templates/modern4.png", overlay: "templates/modern4_top.png",
    slots: [box(40, 110, 560, 485), box(40, 505, 560, 880), box(40, 900, 560, 1275), box(40, 1295, 560, 1670)] },
  { id: "beige4", name: "Best Friend strip", cat: "4", file: "templates/beige4.png", overlay: "templates/beige4_top.png",
    slots: [box(208, 6, 531, 440), box(208, 446, 531, 880), box(208, 886, 531, 1320), box(208, 1326, 531, 1766)] },
  { id: "bw3", name: "Sunway strip", cat: "3", file: "templates/bw3.jpg",
    slots: [box(60, 191, 540, 613), box(60, 635, 540, 1056), box(60, 1079, 540, 1500)] },
  { id: "red3", name: "Vintage letters", cat: "3", file: "templates/red3.png", overlay: "templates/red3_top.png",
    slots: [{ cx: 505, cy: 467, w: 475, h: 386, angle: 3.95 }, { cx: 534, cy: 882, w: 475, h: 386, angle: 3.95 }, { cx: 563, cy: 1297, w: 475, h: 386, angle: 3.95 }] },
  { id: "flower4", name: "Flower Girl Friends strip", cat: "4", file: "templates/flower4.jpg",
    slots: [box(59, 129, 531, 483), box(59, 516, 531, 869), box(59, 903, 531, 1256), box(59, 1289, 531, 1642)] },
  { id: "film3", name: "Film Strip", cat: "3", file: "templates/film3.jpg",
    slots: [box(69, 0, 534, 549), box(69, 590, 534, 1210), box(69, 1250, 534, 1800)] },
  { id: "news2", name: "ECX Week newspaper", cat: "a5", file: "templates/news2.jpg",
    slots: [box(574, 604, 1302, 1325), box(111, 1391, 528, 1880)] },
];
const CAT_LABEL = { "4": "4 photos", "3": "3 photos", a5: "2 photos" };

const imgCache = {};
const loadImg = (src) => imgCache[src] ??= new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

// ---------- screens ----------
const STEP = { camera: 1, templates: 2, email: 3 };
// crossfade between pages with the View Transitions API (falls back to the CSS enter animation)
const VT = !!document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.toggle("vt", VT);
function show(id) {
  if (!VT) return swap(id);
  const t = document.startViewTransition(() => swap(id));
  t.finished.catch(() => {});
}
function swap(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
  if (id !== "camera") stopLoop();
  document.body.classList.toggle("home", id === "home");
  const cur = STEP[id] || 0, bar = $("stepper");
  bar.classList.toggle("on", cur > 0);
  bar.querySelectorAll("span").forEach((sp) => { const n = +sp.dataset.s; sp.classList.toggle("now", n === cur); sp.classList.toggle("done", n < cur); });
  bar.querySelectorAll("em").forEach((em, i) => em.classList.toggle("done", i + 1 < cur));
  window.scrollTo({ top: 0 });
}

// ---------- polish: ripple on every button, split-letter title, tilt cards ----------
document.addEventListener("pointerdown", (e) => {
  const b = e.target.closest(".btn, .big-btn, .opt, .tab, .fx");
  if (!b) return;
  const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2;
  const rip = document.createElement("span"); rip.className = "ripple";
  rip.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  b.appendChild(rip); setTimeout(() => rip.remove(), 650);
});
$("title").innerHTML = [..."Photobooth"].map((c, i) => `<span style="--i:${i}">${c}</span>`).join("");
function tilt(el) {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-8px) scale(1.02)`;
  });
  el.addEventListener("pointerleave", () => (el.style.transform = ""));
}
const bursts = [];
function confetti() {
  const c = $("confetti"), ctx = c.getContext("2d"); c.width = innerWidth; c.height = innerHeight;
  const cols = ["#f6d35c", "#e8927c", "#6fa8d8", "#8ec9a6", "#fff"];
  for (let i = 0; i < 140; i++) bursts.push({ x: innerWidth / 2, y: innerHeight * .55, vx: (Math.random() - .5) * 18, vy: -Math.random() * 18 - 4,
    r: Math.random() * 6 + 3, a: Math.random() * 6, va: (Math.random() - .5) * .4, col: cols[i % cols.length], life: 1 });
  (function tick() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of bursts) {
      p.vy += .45; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life -= .006;
      ctx.save(); ctx.globalAlpha = Math.max(p.life, 0); ctx.translate(p.x, p.y); ctx.rotate(p.a);
      ctx.fillStyle = p.col; ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); ctx.restore();
    }
    for (let i = bursts.length - 1; i >= 0; i--) if (bursts[i].life <= 0 || bursts[i].y > innerHeight + 20) bursts.splice(i, 1);
    bursts.length ? requestAnimationFrame(tick) : ctx.clearRect(0, 0, c.width, c.height);
  })();
}
document.addEventListener("click", (e) => {
  const go = e.target.closest("[data-go]")?.dataset.go;
  if (!go) return;
  go === "camera" ? openCamera() : go === "templates" ? openTemplates() : show(go);
});
$("startBtn").onclick = openCamera;

// ---------- state ----------
let shots = [];            // the 5 captured canvases
let tpl = TEMPLATES[0];    // chosen template
let picked = [];           // shot indexes in the order the user tapped them; picked[0] -> spot 1

// ---------- effects picker ----------
const active = new Set();
// Only hats / props / hair can be stacked. Everything else is one-at-a-time, and Retro Cam is its own separate picker.
const STACK = "wear", RETRO = "retro";
const PICKER_CATS = CATS.filter((c) => c.id !== RETRO);
const PICKER_FX = EFFECTS.filter((e) => e.cat !== RETRO);
let fxCat = PICKER_CATS[0].id, fxQuery = "";
function toggleFx(ef) {
  if (active.has(ef.id)) { active.delete(ef.id); return; }
  if (ef.cat !== STACK) for (const o of EFFECTS) if (o.cat !== STACK && o.cat !== RETRO && active.has(o.id)) active.delete(o.id);
  active.add(ef.id);
}
function renderFx() {
  const grid = $("fxGrid"); grid.innerHTML = "";
  const q = fxQuery.trim().toLowerCase();
  const list = q ? PICKER_FX.filter((e) => e.name.toLowerCase().includes(q)) : EFFECTS.filter((e) => e.cat === fxCat);
  const btns = [];
  list.forEach((ef, i) => {
    const b = document.createElement("button"); b.className = "fx" + (active.has(ef.id) ? " sel" : ""); b.innerHTML = `<canvas></canvas>${ef.name}`;
    b.style.setProperty("--d", `${Math.min(i, 14) * 25}ms`);
    try { drawIcon(b.querySelector("canvas"), ef); } catch (e) { console.error("icon failed", ef.id, e); }
    b.onclick = () => { toggleFx(ef); btns.forEach(([x, e]) => x.classList.toggle("sel", active.has(e.id))); updateFxCount(); };
    btns.push([b, ef]);
    grid.appendChild(b);
  });
  if (!list.length) grid.innerHTML = '<p class="hint">No filters match.</p>';
  grid.scrollTop = 0;
}
function updateFxCount() {
  const n = PICKER_FX.filter((e) => active.has(e.id)).length; $("fxCount").textContent = n; $("fxClear").hidden = !n;
  document.querySelectorAll(".fx-tab").forEach((t) => { const n = EFFECTS.filter((e) => e.cat === t.dataset.cat && active.has(e.id)).length; t.dataset.n = n || ""; });
}
for (const c of PICKER_CATS) {
  const t = document.createElement("button"); t.className = "fx-tab" + (c.id === fxCat ? " sel" : ""); t.dataset.cat = c.id; t.innerHTML = `<span>${c.icon}</span>${c.label}`;
  t.onclick = () => { fxCat = c.id; fxQuery = ""; $("fxSearch").value = ""; document.querySelectorAll(".fx-tab").forEach((x) => x.classList.toggle("sel", x === t)); renderFx(); };
  $("fxTabs").appendChild(t);
}
$("fxSearch").oninput = (e) => { fxQuery = e.target.value; document.querySelectorAll(".fx-tab").forEach((x) => x.classList.toggle("sel", !fxQuery && x.dataset.cat === fxCat)); renderFx(); };
$("fxClear").onclick = () => { for (const e of PICKER_FX) active.delete(e.id); renderFx(); updateFxCount(); };
renderFx();

// ---------- retro cam (separate from the emoji picker, one at a time) ----------
const retroRow = $("retroRow");
function renderRetro() {
  retroRow.innerHTML = "";
  const mk = (label, id) => {
    const b = document.createElement("button"); b.className = "opt" + ((id ? active.has(id) : !EFFECTS.some((e) => e.cat === RETRO && active.has(e.id))) ? " sel" : ""); b.textContent = label;
    b.onclick = () => { for (const e of EFFECTS) if (e.cat === RETRO) active.delete(e.id); if (id) active.add(id); renderRetro(); };
    retroRow.appendChild(b);
  };
  mk("None", null);
  for (const e of EFFECTS) if (e.cat === RETRO) mk(e.name, e.id);
}
renderRetro();

// ---------- colour filters (applied to the video only, effects keep their colours) ----------
const COLORS = {
  "None": "none",
  "Black & white": "grayscale(1) contrast(1.1)",
  "Sepia": "sepia(.9) contrast(1.05)",
  "Vivid": "saturate(1.7) contrast(1.1)",
  "Vintage": "sepia(.4) contrast(1.1) saturate(1.3) brightness(.95)",
  "Cool": "hue-rotate(185deg) saturate(1.2)",
};
let colorName = "None";
for (const name of Object.keys(COLORS)) {
  const b = document.createElement("button"); b.className = "opt" + (name === colorName ? " sel" : ""); b.textContent = name;
  b.onclick = () => { colorName = name; [...$("colorRow").children].forEach((x) => x.classList.toggle("sel", x === b)); };
  $("colorRow").appendChild(b);
}

// ---------- camera + face tracking ----------
const video = document.createElement("video");
video.playsInline = true; video.muted = true;
const live = $("live"), lctx = live.getContext("2d");
live.width = 960; live.height = 720;
let running = false, shooting = false, landmarker = null, loadingLm = false;
let smooth = [], lastVideoTime = -1;

function renderFrame(ctx, w, h) {
  const vw = video.videoWidth, vh = video.videoHeight, s = Math.max(w / vw, h / vh);
  ctx.save(); ctx.translate(w, 0); ctx.scale(-1, 1); ctx.filter = COLORS[colorName];
  ctx.drawImage(video, (w - vw * s) / 2, (h - vh * s) / 2, vw * s, vh * s);
  ctx.restore();
  if (active.size) drawEffects(ctx, smooth, active);
}

function track() {
  if (!landmarker || !active.size || video.readyState < 2 || video.currentTime === lastVideoTime) return;
  lastVideoTime = video.currentTime;
  const res = landmarker.detectForVideo(video, performance.now());
  const frames = res.faceLandmarks.map((lm) => faceFrame(lm, live.width, live.height, video.videoWidth, video.videoHeight));
  smooth = frames.map((f, i) => {
    const p = smooth[i]; if (!p) return f;
    const mix = (a, b) => (Array.isArray(b) ? b.map((v, j) => mix(a[j], v)) : a + (b - a) * 0.6);
    const o = {}; for (const k in f) o[k] = mix(p[k], f[k]); return o;
  });
  if (!shooting) $("status").textContent = frames.length ? "" : "Looking for your face…";
}

function loop() {
  if (!running) return;
  if (video.readyState >= 2) { track(); renderFrame(lctx, live.width, live.height); }
  requestAnimationFrame(loop);
}
function stopLoop() { running = false; }

async function loadLandmarker() {
  if (landmarker || loadingLm) return; loadingLm = true;
  try {
    const files = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
    const base = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
    const make = (delegate) => FaceLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: base, delegate }, runningMode: "VIDEO", numFaces: 3 });
    try { landmarker = await make("GPU"); } catch { landmarker = await make("CPU"); }
    $("status").textContent = "";
  } catch (e) {
    console.error(e); $("status").textContent = "Face tracker failed to load (needs internet). Effects won't show.";
  }
  loadingLm = false;
}

async function openCamera() {
  show("camera");
  $("shotInfo").textContent = `${SHOTS} photos`;
  $("shootBtn").textContent = `Start (${SHOTS} photos)`;
  $("status").textContent = "Starting camera…"; $("shootBtn").disabled = true;
  try {
    if (!video.srcObject) {
      video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: "user" }, audio: false });
      await video.play();
    }
  } catch { $("status").textContent = "Camera blocked. Allow camera access and reload."; return; }
  running = true; loop();
  $("status").textContent = landmarker ? "" : "Loading face tracker…";
  $("shootBtn").disabled = false;
  loadLandmarker();
}

async function runShoot() {
  if (shooting) return; shooting = true; $("shootBtn").disabled = true;
  const taken = [], cd = $("countdown"), roll = $("roll");
  roll.innerHTML = ""; $("rec").classList.add("hot");
  for (let i = 0; i < SHOTS; i++) {
    $("shotInfo").textContent = `Photo ${i + 1} of ${SHOTS}`;
    for (let n = 3; n >= 1; n--) {
      cd.innerHTML = `<span class="num">${n}</span>`; cd.classList.remove("tick"); void cd.offsetWidth; cd.classList.add("tick");
      await sleep(1000);
    }
    cd.innerHTML = ""; cd.classList.remove("tick");
    const c = document.createElement("canvas"); c.width = live.width; c.height = live.height;
    renderFrame(c.getContext("2d"), c.width, c.height); taken.push(c);
    const fl = $("flash"); fl.classList.remove("go"); void fl.offsetWidth; fl.classList.add("go");
    live.classList.remove("snap"); void live.offsetWidth; live.classList.add("snap");
    const th = document.createElement("canvas"); th.width = 96; th.height = 72; th.getContext("2d").drawImage(c, 0, 0, 96, 72);
    roll.appendChild(th);
    await sleep(450);
  }
  shooting = false; $("status").textContent = ""; $("rec").classList.remove("hot");
  shots = taken; fresh = true;
  openTemplates();
}

// ---------- template page ----------
function renderTemplates(cat = "all") {
  const grid = $("tplGrid"); grid.innerHTML = "";
  for (const t of TEMPLATES.filter((t) => cat === "all" || t.cat === cat)) {
    const d = document.createElement("div"); d.className = "tpl"; d.dataset.id = t.id;
    d.innerHTML = `<img src="${t.file}" alt="${t.name}"><span>${t.name} · ${CAT_LABEL[t.cat]}</span>`;
    d.style.setProperty("--d", `${grid.children.length * 80}ms`);
    if (t.id === tpl.id) d.classList.add("sel");
    d.onclick = () => selectTpl(t);
    tilt(d); grid.appendChild(d);
  }
}
let fresh = true;   // true right after shooting: fill the template with the photos in order
function selectTpl(t) {
  tpl = t; picked = shots.slice(0, t.slots.length).map((_, i) => i);
  document.querySelectorAll(".tpl").forEach((d, i) => d.classList.toggle("sel", d.dataset.id === t.id));
  $("tplName").textContent = t.name;
  refresh();
}
function openTemplates() {
  renderTemplates(document.querySelector(".tab.sel")?.dataset.cat);
  if (fresh) { fresh = false; selectTpl(tpl); } else refresh();
  $("saved").textContent = "";
  $("shotRow").classList.add("fresh"); setTimeout(() => $("shotRow").classList.remove("fresh"), 900);
  show("templates");
}
$("tabs").onclick = (e) => {
  const b = e.target.closest(".tab"); if (!b) return;
  document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("sel", x === b));
  renderTemplates(b.dataset.cat);
};
renderTemplates();

// ---------- live preview: which photo goes in each slot ----------
function drawCover(ctx, img, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  ctx.drawImage(img, -(img.width * s) / 2, -(img.height * s) / 2, img.width * s, img.height * s);
}

async function compose(canvas) {
  const bg = await loadImg(tpl.file), top = tpl.overlay ? await loadImg(tpl.overlay) : null;
  canvas.width = bg.width; canvas.height = bg.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bg, 0, 0);
  tpl.slots.forEach((s, i) => {
    const pad = s.angle ? 4 : 0, w = s.w + pad, h = s.h + pad;
    ctx.save(); ctx.translate(s.cx, s.cy); ctx.rotate((-s.angle * Math.PI) / 180);
    ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip();
    if (picked[i] !== undefined) drawCover(ctx, shots[picked[i]], w, h);
    else {   // empty spot: dark placeholder with its number
      ctx.fillStyle = "#2b2420"; ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `bold ${Math.min(w, h) * 0.4}px Inter, system-ui, sans-serif`; ctx.fillText(i + 1, 0, 0);
    }
    ctx.restore();
  });
  if (top) ctx.drawImage(top, 0, 0);
}

function renderPicker() {
  const n = tpl.slots.length, full = picked.length === n;
  $("pickHint").textContent = full ? "Tap a photo to swap it into the last spot, or tap a picked one to remove it and reorder."
    : `Tap your photos in the order you want: picked ${picked.length} of ${n}`;
  const row = $("shotRow"); row.innerHTML = "";
  shots.forEach((c, i) => {
    const pos = picked.indexOf(i);
    const b = document.createElement("button"); b.className = "shot" + (pos >= 0 ? " sel" : "");
    const t = document.createElement("canvas"); t.width = 240; t.height = 180; t.getContext("2d").drawImage(c, 0, 0, 240, 180);
    b.appendChild(t);
    if (pos >= 0) { const tag = document.createElement("i"); tag.textContent = pos + 1; b.appendChild(tag); }
    b.style.setProperty("--d", `${i * 50}ms`);
    b.onclick = () => {
      if (pos >= 0) picked.splice(pos, 1);        // tap again = remove, later picks shift up
      else if (picked.length < n) picked.push(i);
      else picked[n - 1] = i;                     // already full: swap in for the last spot
      refresh();
    };
    row.appendChild(b);
  });
  $("nextBtn").disabled = !full;
}

async function refresh() {
  renderPicker();
  await compose($("strip"));
  const st = $("strip"); st.classList.remove("pop"); void st.offsetWidth; st.classList.add("pop");
}

const payload = () => ({ strip: $("strip").toDataURL("image/jpeg", 0.95), photos: shots.map((p) => p.toDataURL("image/jpeg", 0.95)) });
const post = (url, body) => fetch(url, { method: "POST", body: JSON.stringify(body) }).then(async (r) => {
  const j = await r.json(); if (!r.ok) throw new Error(j.error || "Something went wrong"); return j;
});

// enlarge the live strip preview to fullscreen (Esc or the button closes it)
const stripWrap = $("stripWrap");
$("resizeBtn").onclick = () => (document.fullscreenElement ? document.exitFullscreen() : stripWrap.requestFullscreen?.());
document.addEventListener("fullscreenchange", () => { $("resizeBtn").textContent = document.fullscreenElement ? "⤡ Shrink" : "⤢ Enlarge"; });

// ---------- email page ----------
$("nextBtn").onclick = () => {
  show("email"); $("email").classList.remove("sent"); $("emailMsg").textContent = ""; $("sendBtn").disabled = false;
  post("/save", payload()).catch(() => {});
  $("emailInput").focus();
};
$("emailForm").onsubmit = async (e) => {
  e.preventDefault();
  $("sendBtn").disabled = true; $("emailMsg").textContent = "Sending…";
  try {
    await post("/send", { email: $("emailInput").value, ...payload() });
    $("emailMsg").textContent = "Sent! Check your inbox 💌";
    $("email").classList.add("sent"); confetti();
  } catch (err) {
    $("emailMsg").textContent = err.message; $("sendBtn").disabled = false;
  }
};
$("doneBtn").onclick = () => { $("emailInput").value = ""; shots = []; show("home"); };

$("shootBtn").onclick = runShoot;
