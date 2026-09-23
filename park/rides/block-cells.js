/** Block footprints. Dive south of z=12.5, Giga north of it, Rim on the west strip. */
import { pushSpan, dist3, lerpSample } from './path-math.js';

const DIVE_BOX = { x0: -200, x1: -75, z0: 12.5, z1: 225 };
const GIGA_BOX = { x0: -200, x1: -75, z0: -200, z1: 12.5 };
const RIM_BOX = { x0: -200, x1: -175, z0: -200, z1: 225 };
const EAST_OF_RIM = -174.6;
const RIM_EAST = -183.2;

function densify(pts, maxStep) {
  if (pts.length < 2) return pts;
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    out.push(a);
    const d = dist3(a, b);
    const n = Math.ceil(d / maxStep);
    for (let k = 1; k < n; k++) out.push(lerpSample(a, b, k / n));
  }
  return out;
}

function canopyZ(x) {
  const dx = (x + 165) / 130;
  const room = Math.sqrt(Math.max(0, 0.96 - dx * dx));
  return { z0: -10 - 160 * room, z1: -10 + 160 * room };
}

function clampBox(p, box, xFloor, xCeil) {
  let x = Math.min(box.x1 - 0.4, Math.max(box.x0 + 0.4, p.x));
  let z = Math.min(box.z1 - 0.4, Math.max(box.z0 + 0.4, p.z));
  if (xFloor != null) x = Math.max(x, xFloor);
  if (xCeil != null) x = Math.min(x, xCeil);
  const land = canopyZ(x);
  z = Math.min(land.z1, Math.max(land.z0, z));
  return { ...p, x, z };
}

function clampPath(pts, box, xFloor, xCeil) {
  return pts.map((p) => clampBox(p, box, xFloor, xCeil));
}

/** Rydelic Dive. Center (-137.5, 112.5). Heartline stays east of the Rim strip. */
export function diveCellSamples() {
  const pts = [];
  const station = { x: -137.5, y: 3.2, z: 112.5 };
  const liftFoot = { x: -120, y: 4.2, z: 128 };
  const crest = { x: -118, y: 32, z: 138 };
  const lip = { x: -150, y: 30.2, z: 140 };
  const valley = { x: -162, y: 4.4, z: 118 };
  const mid = { x: -168, y: 14, z: 120 };
  const block = { x: -170, y: 8, z: 100 };
  const dive2 = { x: -160, y: 20, z: 90 };
  const skim = { x: -145, y: 1.8, z: 70 };
  const brakeIn = { x: -138, y: 3.4, z: 92 };
  pushSpan(pts, station, liftFoot, 12, (t) => station.y + (liftFoot.y - station.y) * t, () => 0, { speed: () => 6 });
  pushSpan(pts, liftFoot, crest, 18, (t) => liftFoot.y + (crest.y - liftFoot.y) * t, () => 0, { speed: () => 7, lift: true });
  pushSpan(pts, crest, lip, 8, (t) => crest.y + (lip.y - crest.y) * t, () => 0.4, { speed: () => 4, crestHold: true });
  pushSpan(pts, lip, valley, 14, (t) => lip.y + (valley.y - lip.y) * t, () => -0.2, { speed: () => 20 });
  pushSpan(pts, valley, mid, 12, (t) => valley.y + (mid.y - valley.y) * t, () => 0.15, { speed: () => 14 });
  pushSpan(pts, mid, block, 10, (t) => mid.y + (block.y - mid.y) * t, () => 0, { speed: () => 10, blockBrake: true });
  pushSpan(pts, block, dive2, 12, (t) => block.y + (dive2.y - block.y) * t, () => 0.1, { speed: () => 12 });
  pushSpan(pts, dive2, skim, 12, (t) => dive2.y + (skim.y - dive2.y) * t, () => -0.15, { speed: () => 16 });
  pushSpan(pts, skim, brakeIn, 8, (t) => skim.y + (brakeIn.y - skim.y) * t, () => 0, { speed: () => 8, brake: true });
  pushSpan(pts, brakeIn, station, 12, (t) => brakeIn.y + (station.y - brakeIn.y) * t, () => 0, { speed: (t) => 6 - t * 3, brake: true });
  pts.push({ x: station.x, y: station.y, z: station.z, bank: 0, speed: 3, lift: false, brake: true, tunnel: false, crestHold: false, blockBrake: false });
  return clampPath(densify(pts, 2.2), DIVE_BOX, EAST_OF_RIM);
}

/** Block Giga. Center (-137.5, -87.5). Heartline stays east of the Rim strip. */
export function gigaCellSamples() {
  const pts = [];
  const station = { x: -137.5, y: 3.2, z: -87.5 };
  const liftFoot = { x: -120, y: 4.2, z: -130 };
  const crest = { x: -118, y: 30, z: -150 };
  const valley = { x: -140, y: 3.2, z: -160 };
  const camel1 = { x: -170, y: 3.4, z: -150 };
  const camel2 = { x: -168, y: 4.2, z: -90 };
  const turn = { x: -168, y: 5, z: -40 };
  const home = { x: -155, y: 3.4, z: -30 };
  const brakeIn = { x: -140, y: 3.3, z: -60 };
  pushSpan(pts, station, liftFoot, 12, (t) => station.y + (liftFoot.y - station.y) * t, () => 0, { speed: () => 6 });
  pushSpan(pts, liftFoot, crest, 18, (t) => liftFoot.y + (crest.y - liftFoot.y) * t, () => 0, { speed: () => 7, lift: true });
  pushSpan(pts, crest, valley, 16, (t) => crest.y + (valley.y - crest.y) * t, () => -0.15, { speed: () => 22 });
  pushSpan(pts, valley, camel1, 14, (t) => 3.3 + Math.sin(t * Math.PI) * 12.5, (t) => Math.sin(t * Math.PI) * 0.28, { speed: () => 16 });
  pushSpan(pts, camel1, camel2, 14, (t) => 3.5 + Math.sin(t * Math.PI) * 9.5, (t) => Math.sin(t * Math.PI) * -0.22, { speed: () => 15 });
  pushSpan(pts, camel2, turn, 12, (t) => 4.2 + (5 - 4.2) * t, () => 0.2, { speed: () => 16 });
  pushSpan(pts, turn, home, 12, (t) => 5 + Math.sin(t * Math.PI) * 4.5, () => 0.12, { speed: () => 14 });
  pushSpan(pts, home, brakeIn, 10, (t) => 3.5 + Math.sin(t * Math.PI) * 3.2, () => 0, { speed: () => 12 });
  pushSpan(pts, brakeIn, station, 12, (t) => brakeIn.y + (station.y - brakeIn.y) * t, () => 0, { speed: (t) => 7 - t * 4, brake: true });
  pts.push({ x: station.x, y: station.y, z: station.z, bank: 0, speed: 3, lift: false, brake: true, tunnel: false, inversion: false, crestHold: false, blockBrake: false });
  return clampPath(densify(pts, 2.2), GIGA_BOX, EAST_OF_RIM);
}

/** Rim Flight. West strip only. Center (-187.5, 12.5). Heartline stays 8 m west of Dive and Giga. */
export function rimCellSamples() {
  const pts = [];
  const x = -187.5;
  const station = { x, y: 3.2, z: 12.5 };
  const south = { x, y: 3.4, z: 140 };
  const lift = { x, y: 28, z: 144 };
  const drop = { x: -192, y: 4, z: 110 };
  const midS = { x: -192, y: 8, z: 80 };
  const mid = { x: -186, y: 6, z: 40 };
  const midN = { x: -192, y: 10, z: -80 };
  const north = { x, y: 4, z: -150 };
  const turn = { x, y: 7, z: -158 };
  const home = { x, y: 3.4, z: -40 };
  const brakeIn = { x, y: 3.3, z: -8 };
  pushSpan(pts, station, south, 16, (t) => 3.2 + t * 0.2, () => 0, { speed: () => 8 });
  pushSpan(pts, south, lift, 14, (t) => 3.4 + t * 24.6, () => 0, { speed: () => 7, lift: true });
  pushSpan(pts, lift, drop, 12, (t) => 28 - t * 24, () => -0.12, { speed: () => 22 });
  pushSpan(pts, drop, midS, 12, (t) => 4 + Math.sin(t * Math.PI) * 6, () => 0.1, { speed: () => 16 });
  pushSpan(pts, midS, mid, 10, (t) => 8 - t * 2, () => 0, { speed: () => 15 });
  pushSpan(pts, mid, midN, 12, (t) => 6 + Math.sin(t * Math.PI) * 8, () => -0.08, { speed: () => 16 });
  pushSpan(pts, midN, north, 12, (t) => 10 - t * 6, () => 0, { speed: () => 15 });
  pushSpan(pts, north, turn, 8, (t) => 4 + t * 3, () => 0.2, { speed: () => 12 });
  pushSpan(pts, turn, home, 14, (t) => 7 - t * 3.6, () => 0, { speed: () => 14 });
  pushSpan(pts, home, brakeIn, 8, () => 3.4, () => 0, { speed: () => 8, brake: true });
  pushSpan(pts, brakeIn, station, 12, () => 3.3, () => 0, { speed: (t) => 6 - t * 3, brake: true });
  pts.push({ x: station.x, y: station.y, z: station.z, bank: 0, speed: 3, lift: false, brake: true, tunnel: false, inversion: false, crestHold: false, blockBrake: false, lsm: false });
  return clampPath(densify(pts, 1.8), RIM_BOX, null, RIM_EAST);
}
