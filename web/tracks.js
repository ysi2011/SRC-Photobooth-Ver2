// Home page belts: each strip image is rotated sideways once, then tiled and scrolled along a diagonal lane.
const lanes = [...document.querySelectorAll(".lane")];
const SPEED = 90; // px per second along the track
const tiles = {};

async function prepare(belt) {
  const img = new Image(); img.src = belt.dataset.src; await img.decode();
  const gap = Math.round(img.width * 0.12), c = document.createElement("canvas");
  c.width = img.height + gap; c.height = img.width;
  const x = c.getContext("2d"); x.translate(0, c.height); x.rotate(-Math.PI / 2); x.drawImage(img, 0, 0);
  belt.style.backgroundImage = `url(${c.toDataURL("image/jpeg", 0.9)})`;
  tiles[belt.dataset.src] = c.width / c.height;
}

function layout() {
  const W = innerWidth, H = innerHeight, h = Math.min(150, H * 0.2), len = Math.hypot(W, H / 2), ang = Math.atan2(H / 2, W);
  lanes.forEach((lane, i) => {
    const belt = lane.firstElementChild, tile = (h - 20) * (tiles[belt.dataset.src] || 3); // belt height = lane height minus 10px padding top and bottom
    lane.style.setProperty("--len", `${len}px`); lane.style.setProperty("--h", `${h}px`);
    lane.style.setProperty("--ang", `${i ? ang : -ang}rad`);
    lane.style.top = `${(i ? 0 : H / 2) - h / 2}px`;
    lane.style.setProperty("--tile", `${tile}px`); lane.style.setProperty("--dur", `${tile / SPEED}s`);
  });
}

Promise.all(lanes.map((l) => prepare(l.firstElementChild))).then(layout).catch((e) => console.error("tracks failed", e));
addEventListener("resize", layout);
