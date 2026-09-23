/** World-space ride paths. Samples stay in their land, off the 14 m spine and hub r32. */
import { LOCK, inCanopy, inStadium, occupiesSpine, nearRing } from '../lock.js';
import { pushSpan, pushLoop, pushCorkscrew, pushHelix, stats, dryLap, dist3, lerpSample, norm } from './path-math.js';

export const RIDE_ANCHORS = {
  'ride-block-01': { id: 'ride-block-01', land: 'The Block', x: -187.5, z: 37.5, w: 6, d: 4, h: 3.15, name: 'Rydelic Dive', type: 'coaster', cars: 3 },
  'ride-block-02': { id: 'ride-block-02', land: 'The Block', x: -187.5, z: -20, w: 12, d: 8, h: 4.9, name: 'Block Giga', type: 'giga', cars: 4 },
  'ride-board-01': { id: 'ride-board-01', land: 'The Board', x: 160, z: 14, w: 6, d: 4, h: 3.15, name: 'Board Wheel', type: 'wheel', cars: 16 },
  'ride-board-02': { id: 'ride-board-02', land: 'The Board', x: 187.5, z: 14, w: 12, d: 8, h: 4.9, name: 'Board Swings', type: 'swings', cars: 12 },
  'ride-hours-01': { id: 'ride-hours-01', land: 'After Hours', x: -36, z: -175, w: 6, d: 4, h: 3.15, name: 'Hours Dark', type: 'dark', cars: 1 },
  'ride-hours-02': { id: 'ride-hours-02', land: 'After Hours', x: -60, z: -175, w: 12, d: 8, h: 4.9, name: 'Hours Dark 2', type: 'dark2', cars: 1 },
  'ride-pocket-01': { id: 'ride-pocket-01', land: 'The Pocket', x: 70, z: 50, w: 6, d: 4, h: 3.15, name: 'Pocket Spin', type: 'spin', cars: 8 },
  'ride-pocket-02': { id: 'ride-pocket-02', land: 'The Pocket', x: 40, z: 80, w: 12, d: 8, h: 4.9, name: 'Pocket Kiddie', type: 'kiddie', cars: 3 },
  'ride-board-drop': { id: 'ride-board-drop', land: 'The Board', x: 176, z: 58, w: 6, d: 6, h: 28, name: 'Board Drop', type: 'drop', cars: 1 },
  'ride-board-family': { id: 'ride-board-family', land: 'The Board', x: 208, z: -32, w: 10, d: 6, h: 4.2, name: 'Board Family', type: 'family', cars: 3 },
};

export function landOk(p, land, radius = 2) {
  if (!inStadium(p.x, p.z)) return 'stadium';
  if (!inCanopy(p.x, p.z, land)) return 'canopy';
  if (occupiesSpine(p.x, p.z, radius)) return 'spine';
  if (Math.hypot(p.x, p.z) < LOCK.hubOuter + radius) return 'hub';
  if (land === 'The Pocket' && nearRing(p.x, p.z, 6)) return 'ring';
  return '';
}

function pullIn(p, land) {
  const c = LOCK.canopies[land];
  let x = p.x;
  let z = p.z;
  const dx = (x - c.cx) / c.rx;
  const dz = (z - c.cz) / c.rz;
  const e = dx * dx + dz * dz;
  if (e > 0.78) {
    const s = Math.sqrt(0.78 / e);
    x = c.cx + (x - c.cx) * s;
    z = c.cz + (z - c.cz) * s;
  }
  if (occupiesSpine(x, z, 4)) {
    const sign = x < 0 ? -1 : 1;
    x = sign * (LOCK.spineWidth / 2 + 8);
  }
  if (Math.hypot(x, z) < LOCK.hubOuter + 6) {
    const h = Math.hypot(x, z) || 1;
    const target = LOCK.hubOuter + 8;
    x = (x / h) * target;
    z = (z / h) * target;
  }
  return { ...p, x, z };
}

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

function finish(pts, land) {
  const pulled = pts.map((p) => pullIn(p, land));
  return densify(pulled, 1.35);
}

function violations(samples, land) {
  const bad = [];
  for (let i = 0; i < samples.length; i++) {
    const why = landOk(samples[i], land, 2);
    if (why) bad.push({ i, why, x: samples[i].x, z: samples[i].z });
    if (bad.length > 6) break;
  }
  return bad;
}

/** Hero Block coaster. version 1 hills, 2 adds loop/corkscrew/helix, 3 extra airtime + wrap. */
export function blockCoasterSamples(version = 3) {
  const pts = [];
  const station = { x: -187.5, z: 37.5 };
  pushSpan(pts, station, { x: -230, z: 48 }, 28, (t) => 2.4 + t * 1.4, () => 0, { speed: () => 9, lift: false, brake: true });
  pushSpan(pts, { x: -230, z: 48 }, { x: -258, z: 18 }, 36, (t) => 3.8 + t * 34, () => 0.05, { speed: () => 8, lift: true });
  pushSpan(pts, { x: -258, z: 18 }, { x: -248, z: -8 }, 22, (t) => 37.8 - t * 33, () => -0.08, { speed: () => 18 });
  pushSpan(pts, { x: -248, z: -8 }, { x: -210, z: -18 }, 18, (t) => 4.8 + Math.sin(t * Math.PI) * 12, () => 0.2, { speed: () => 14 });
  if (version >= 3) {
    pushSpan(pts, { x: -210, z: -18 }, { x: -186, z: -6 }, 16, (t) => 4 + Math.sin(t * Math.PI) * 9, () => -0.25, { speed: () => 12 });
    pushSpan(pts, { x: -186, z: -6 }, { x: -172, z: 12 }, 14, (t) => 3.2 + Math.sin(t * Math.PI) * 7, () => 0.15, { speed: () => 11 });
  }
  const loopEntry = pts[pts.length - 1];
  const loopFwd = { x: 18, y: 0, z: 22 };
  if (version >= 2) {
    pushLoop(pts, loopEntry, loopFwd, 8.5, 42);
    const after = pts[pts.length - 1];
    pushCorkscrew(pts, after, { x: 22, y: 0, z: 8 }, 26, 3.5, 32);
    const corkEnd = pts[pts.length - 1];
    pushHelix(pts, { x: corkEnd.x - 6, z: corkEnd.z + 8 }, 11, corkEnd.y, 8, 1.15, 40, -0.4);
  } else {
    pushSpan(pts, loopEntry, { x: -168, z: 28 }, 20, (t) => 3.5 + Math.sin(t * Math.PI) * 4, () => 0, { speed: () => 10 });
  }
  if (version >= 3) {
    const here = pts[pts.length - 1];
    pushLoop(pts, here, { x: -6, y: 0, z: 16 }, 6.2, 28);
  }
  const tail = pts[pts.length - 1];
  pushSpan(pts, tail, { x: -176, z: 46 }, 24, (t) => tail.y + (3.2 - tail.y) * t, () => 0.1, { speed: (t) => 11 - t * 7, tunnel: true });
  pushSpan(pts, { x: -176, z: 46 }, station, 22, (t) => 3.2 + (2.1 - 3.2) * t, () => 0, { speed: (t) => 4 - t * 2, brake: true });
  const samples = finish(pts, 'The Block');
  return { id: 'ride-block-01', land: 'The Block', version, samples, cars: 4, carGap: 3.4, stationHold: 2, ...meta(samples, 'The Block') };
}

function pushImmelmann(pts, entry, forward, radius) {
  const T = norm({ x: forward.x, y: 0, z: forward.z });
  const steps = 24;
  for (let k = 1; k <= steps; k++) {
    const phi = (k / steps) * Math.PI;
    const along = Math.sin(phi) * radius;
    const y = entry.y + radius * (1 - Math.cos(phi));
    pts.push({
      x: entry.x + T.x * along,
      y,
      z: entry.z + T.z * along,
      bank: phi > 2.4 ? Math.PI : 0,
      speed: 16,
      lift: false,
      brake: false,
      tunnel: false,
      inversion: phi > 1.4 && phi < 2.9,
      crestHold: false,
      blockBrake: false,
    });
  }
  const top = pts[pts.length - 1];
  const roll = 16;
  const n = 10;
  for (let k = 1; k <= n; k++) {
    const u = k / n;
    const bank = Math.PI * (1 - u);
    pts.push({
      x: top.x - T.x * roll * u,
      y: top.y - u * 2,
      z: top.z - T.z * roll * u,
      bank,
      speed: 12,
      lift: false,
      brake: false,
      tunnel: false,
      inversion: bank > 0.9,
      crestHold: false,
      blockBrake: false,
    });
  }
}

/** Rydelic Dive. Near-vertical lift, hang at the crest, dive, Immelmann, block brake, second dive, skim, station. */
export function giantBlockSamples() {
  const pts = [];
  const station = { x: -132, y: 3.2, z: 74 };
  const liftFoot = { x: -104, y: 4.2, z: 104 };
  const crest = { x: -101, y: 32, z: 107 };
  const lip = { x: -99, y: 30.2, z: 111 };
  const valley = { x: -103, y: 4.4, z: 116 };
  pushSpan(pts, station, liftFoot, 12, (t) => station.y + (liftFoot.y - station.y) * t, () => 0, { speed: () => 6 });
  pushSpan(pts, liftFoot, crest, 18, (t) => liftFoot.y + (crest.y - liftFoot.y) * t, () => 0, { speed: () => 7, lift: true });
  pushSpan(pts, crest, lip, 8, (t) => crest.y + (lip.y - crest.y) * t, () => 0.4, { speed: () => 4, crestHold: true });
  pushSpan(pts, lip, valley, 14, (t) => lip.y + (valley.y - lip.y) * t, () => -0.2, { speed: () => 20 });
  pushImmelmann(pts, valley, { x: valley.x - lip.x, y: 0, z: valley.z - lip.z }, 11);
  const mid = pts[pts.length - 1];
  const block = { x: -128, y: mid.y - 1, z: 96 };
  const dive2 = { x: -146, y: 20, z: 84 };
  const skim = { x: -148, y: 1.5, z: 78 };
  const brakeIn = { x: -138, y: 3.4, z: 70 };
  pushSpan(pts, { x: mid.x, y: mid.y, z: mid.z }, block, 10, (t) => mid.y + (block.y - mid.y) * t, () => 0, { speed: () => 10, blockBrake: true });
  pushSpan(pts, block, dive2, 10, (t) => block.y + (dive2.y - block.y) * t, () => 0.1, { speed: () => 12 });
  pushSpan(pts, dive2, skim, 12, (t) => dive2.y + (skim.y - dive2.y) * t, () => -0.15, { speed: () => 16 });
  pushSpan(pts, skim, brakeIn, 8, (t) => skim.y + (brakeIn.y - skim.y) * t, () => 0, { speed: () => 8, brake: true });
  pushSpan(pts, brakeIn, station, 12, (t) => brakeIn.y + (station.y - brakeIn.y) * t, () => 0, { speed: (t) => 6 - t * 3, brake: true });
  pts.push({
    x: station.x, y: station.y, z: station.z, bank: 0, speed: 3, lift: false, brake: true, tunnel: false, crestHold: false, blockBrake: false,
  });
  return densify(pts, 2.2);
}

export function giantBlockPack() {
  const samples = giantBlockSamples();
  let maxY = 0;
  for (const p of samples) if (p.y > maxY) maxY = p.y;
  return {
    id: 'ride-block-01',
    land: 'The Block',
    phys: 'coaster',
    samples,
    cars: 3,
    carGap: 3.8,
    carScale: 1,
    stationHold: 2,
    stationAtPath: true,
    beacon: true,
    ribbon: true,
    dive: true,
    crestHold: 3,
    railBulk: 3.6,
    postBulk: 5.4,
    gauge: 1.55,
    apex: maxY,
  };
}

/** 180° overbanked turnaround. Angle 0 points east. Not an inversion. */
function pushHorseshoe(pts, center, radius, a0, a1, yBase, crown, bankPeak, steps) {
  for (let k = 1; k <= steps; k++) {
    const u = k / steps;
    const a = a0 + (a1 - a0) * u;
    const env = Math.sin(u * Math.PI);
    pts.push({
      x: center.x + Math.cos(a) * radius,
      y: yBase + crown * env,
      z: center.z + Math.sin(a) * radius,
      bank: bankPeak * env,
      speed: 18,
      lift: false,
      brake: false,
      tunnel: false,
      inversion: false,
      crestHold: false,
      blockBrake: false,
    });
  }
}

/** Block Giga. Tall chain, long first drop, two camelbacks, west-fence horseshoe, speed hills home. */
export function gigaBlockSamples() {
  const pts = [];
  const station = { x: -188, y: 3.2, z: 58 };
  const liftFoot = { x: -192, y: 4.2, z: 86 };
  const crest = { x: -194, y: 30, z: 91 };
  const valley = { x: -202, y: 3.2, z: 100 };
  const camel1 = { x: -228, y: 3.4, z: 78 };
  const camel2 = { x: -240, y: 4.2, z: 20 };
  const turn = { x: -240, y: 5, z: -22 };
  const home = { x: -206, y: 3.4, z: 8 };
  const brakeIn = { x: -192, y: 3.3, z: 36 };
  pushSpan(pts, station, liftFoot, 12, (t) => station.y + (liftFoot.y - station.y) * t, () => 0, { speed: () => 6 });
  pushSpan(pts, liftFoot, crest, 18, (t) => liftFoot.y + (crest.y - liftFoot.y) * t, () => 0, { speed: () => 7, lift: true });
  pushSpan(pts, crest, valley, 16, (t) => crest.y + (valley.y - crest.y) * t, () => -0.15, { speed: () => 22 });
  pushSpan(pts, valley, camel1, 14, (t) => 3.3 + Math.sin(t * Math.PI) * 12.5, (t) => Math.sin(t * Math.PI) * 0.28, { speed: () => 16 });
  pushSpan(pts, camel1, camel2, 14, (t) => 3.5 + Math.sin(t * Math.PI) * 9.5, (t) => Math.sin(t * Math.PI) * -0.22, { speed: () => 15 });
  pushSpan(pts, camel2, { x: turn.x, y: 5, z: turn.z + 42 }, 10, (t) => 4.2 + (5 - 4.2) * t, () => 0.2, { speed: () => 16 });
  pushHorseshoe(pts, turn, 42, Math.PI / 2, Math.PI / 2 + Math.PI, 5, 3.2, 1.05, 32);
  const exit = pts[pts.length - 1];
  pushSpan(pts, { x: exit.x, y: exit.y, z: exit.z }, home, 12, (t) => 5 + Math.sin(t * Math.PI) * 4.5, () => 0.12, { speed: () => 14 });
  pushSpan(pts, home, brakeIn, 10, (t) => 3.5 + Math.sin(t * Math.PI) * 3.2, () => 0, { speed: () => 12 });
  pushSpan(pts, brakeIn, station, 12, (t) => brakeIn.y + (station.y - brakeIn.y) * t, () => 0, { speed: (t) => 7 - t * 4, brake: true });
  pts.push({
    x: station.x, y: station.y, z: station.z, bank: 0, speed: 3, lift: false, brake: true, tunnel: false, inversion: false, crestHold: false, blockBrake: false,
  });
  return densify(pts, 2.2);
}

export function gigaBlockPack() {
  const samples = gigaBlockSamples();
  let maxY = 0;
  for (const p of samples) if (p.y > maxY) maxY = p.y;
  return {
    id: 'ride-block-02',
    land: 'The Block',
    phys: 'coaster',
    samples,
    cars: 4,
    carGap: 4.4,
    carScale: 1,
    stationHold: 2,
    stationAtPath: true,
    ribbon: true,
    hyper: true,
    giga: true,
    railBulk: 2.2,
    postBulk: 3.6,
    gauge: 1.28,
    spine: 0x2ec4c6,
    spineEmissive: 0x0c5c68,
    spineGlow: 0.7,
    spineWide: 0.7,
    spineHigh: 0.38,
    postWide: 0.52,
    support: 0x146870,
    supportEmissive: 0x08343c,
    supportGlow: 0.45,
    apex: maxY,
  };
}

export function launchCoasterSamples(version = 2) {
  const pts = [];
  const station = { x: -187.5, z: -48 };
  pushSpan(pts, station, { x: -150, z: -48 }, 26, () => 2.2, () => 0, { speed: () => 22 });
  pushSpan(pts, { x: -150, z: -48 }, { x: -142, z: -36 }, 18, (t) => 2.2 + t * 28, () => 0.1, { speed: () => 16 });
  pushSpan(pts, { x: -142, z: -36 }, { x: -156, z: -22 }, 16, (t) => 30.2 - t * 8, (t) => t * Math.PI * 2, { speed: () => 12 });
  if (version >= 2) {
    pushSpan(pts, { x: -156, z: -22 }, { x: -178, z: -16 }, 14, (t) => 22 + Math.sin(t * Math.PI) * 6, () => 0.45, { speed: () => 13 });
    pushSpan(pts, { x: -178, z: -16 }, { x: -210, z: -18 }, 14, (t) => 18 - t * 12, () => -0.2, { speed: () => 14 });
  } else {
    pushSpan(pts, { x: -156, z: -22 }, { x: -210, z: -18 }, 22, (t) => 22 - t * 16, () => 0.3, { speed: () => 14 });
  }
  pushSpan(pts, { x: -210, z: -18 }, { x: -248, z: -34 }, 16, (t) => 6 + Math.sin(t * Math.PI) * (version >= 2 ? 10 : 8), () => -0.4, { speed: () => 12 });
  pushSpan(pts, { x: -248, z: -34 }, { x: -236, z: -58 }, 14, (t) => 4 + t * 2, () => 0, { speed: () => 8, tunnel: true });
  pushSpan(pts, { x: -236, z: -58 }, station, 20, (t) => 6 + (2.2 - 6) * t, () => 0, { speed: (t) => 6 - t * 3.5, brake: true });
  const samples = finish(pts, 'The Block');
  return { id: 'ride-block-02', land: 'The Block', version, samples, cars: 2, carGap: 4.2, stationHold: 2, ...meta(samples, 'The Block') };
}

/** Family coaster on The Board, north of the wheel. Closed. Inside the canopy. */
export function boardFamilySamples() {
  const pts = [];
  const c = { x: 208, z: -32 };
  const steps = 96;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const climbing = a > 0.35 && a < 1.7;
    const hill = climbing ? Math.sin(((a - 0.35) / 1.35) * Math.PI) * 14 : 0;
    pts.push({
      x: c.x + Math.cos(a) * 24,
      z: c.z + Math.sin(a) * 15,
      y: 2.2 + hill + Math.max(0, Math.sin(a * 3)) * 1.4,
      bank: Math.sin(a) * 0.28,
      speed: climbing && a < 1.05 ? 6.5 : 10,
      lift: climbing && a < 1.05,
      brake: a > 5.8,
      tunnel: a > 3.3 && a < 4.0,
    });
  }
  const samples = finish(pts, 'The Board');
  return {
    id: 'ride-board-family',
    land: 'The Board',
    version: 1,
    samples,
    cars: 3,
    carGap: 3.1,
    stationHold: 2,
    ...meta(samples, 'The Board'),
  };
}

export function kiddieSamples() {
  const pts = [];
  const c = { x: 48, z: 86 };
  const steps = 48;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const fig = Math.sin(a);
    pts.push({
      x: c.x + Math.cos(a) * 7.5,
      z: c.z + Math.sin(a * 2) * 4.2 + fig * 1.2,
      y: 1.15 + Math.max(0, Math.sin(a * 2)) * 1.35,
      bank: Math.sin(a) * 0.18,
      speed: 2.4,
      lift: Math.sin(a * 2) > 0.2 && Math.cos(a * 2) > 0,
      brake: i > steps - 6,
      tunnel: false,
    });
  }
  const samples = finish(pts, 'The Pocket');
  return { id: 'ride-pocket-02', land: 'The Pocket', version: 1, samples, cars: 3, carGap: 2.6, stationHold: 2, ...meta(samples, 'The Pocket') };
}

export function darkSamples(which) {
  const origin = which === 2 ? { x: -60, z: -175 } : { x: -36, z: -175 };
  const pts = [];
  const w = which === 2 ? 7.2 : 5.4;
  const d = which === 2 ? 9.5 : 7.2;
  const y = 1.05;
  const path = which === 2
    ? [
      [0, -d * 0.2], [w * 0.35, -d * 0.2], [w * 0.35, d * 0.15], [-w * 0.35, d * 0.15],
      [-w * 0.35, d * 0.42], [w * 0.2, d * 0.42], [w * 0.2, -d * 0.05], [0, -d * 0.2],
    ]
    : [
      [0, -d * 0.15], [w * 0.28, -d * 0.15], [w * 0.28, d * 0.28], [-w * 0.22, d * 0.28],
      [-w * 0.22, 0.1], [0, -d * 0.15],
    ];
  for (let i = 0; i < path.length - 1; i++) {
    const a = { x: origin.x + path[i][0], z: origin.z + path[i][1] };
    const b = { x: origin.x + path[i + 1][0], z: origin.z + path[i + 1][1] };
    pushSpan(pts, a, b, 8, () => y, () => 0, { speed: () => 1.6, tunnel: true });
  }
  const samples = finish(pts, 'After Hours');
  const id = which === 2 ? 'ride-hours-02' : 'ride-hours-01';
  return { id, land: 'After Hours', version: which, samples, cars: 1, carGap: 0, stationHold: 1.5, ...meta(samples, 'After Hours') };
}

function meta(samples, land) {
  return { violations: violations(samples, land), stats: stats(samples), lap: dryLap(samples, 160) };
}

export function allPaths() {
  return [
    blockCoasterSamples(1),
    blockCoasterSamples(2),
    blockCoasterSamples(3),
    launchCoasterSamples(2),
    kiddieSamples(),
    boardFamilySamples(),
    darkSamples(1),
    darkSamples(2),
  ];
}
