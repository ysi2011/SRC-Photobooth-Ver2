// Registers every filter pack and groups the original effects into categories.
import { EFFECTS } from "./effects.js";
import { CATS } from "./fxlib.js";
import "./fx1.js";
import "./fx2.js";
import "./fx3.js";
import "./fx4.js";

const LEGACY = {
  shrek: "chars", minion: "chars", smurf: "chars", zombie: "monsters", robot: "fantasy", sunglasses: "wear", heartglasses: "wear",
  cat: "animals", bunny: "animals", monkey: "animals", horns: "wear", halo: "wear", crown: "wear", party: "wear", santa: "wear",
  moustache: "wear", flowers: "wear", headphones: "wear",
};
for (const e of EFFECTS) if (!e.cat) e.cat = LEGACY[e.id] || "wear";

const order = CATS.map((c) => c.id);
EFFECTS.sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat));
export { CATS, EFFECTS };
