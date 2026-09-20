/** Locked Rydelic Park meters + SKU placement. Used by the 3D/blueprint pages and tests. */
export const LOCK = {
  A: 380,
  B: 230,
  capR: 230,
  straight: 300,
  hubInner: 18,
  hubOuter: 32,
  spineWidth: 14,
  walk: 1.34,
  origin: { x: 0, z: 0 },
  gate: { x: 0, z: 230 },
  rings: {
    A: { x: 95, z: 95, inner: 14, outer: 20 },
    B: { x: 118, z: 108, inner: 6, outer: 11 },
  },
  canopies: {
    'The Block': { cx: -165, cz: -10, rx: 130, rz: 160 },
    'After Hours': { cx: 10, cz: -140, rx: 150, rz: 70 },
    'The Board': { cx: 160, cz: 10, rx: 130, rz: 130 },
    'The Pocket': { cx: 80, cz: 105, rx: 95, rz: 80 },
  },
  waters: [
    [-210, -20, 48, 70],
    [-165, 10, 55, 42],
    [-120, 70, 32, 26],
    [-95, -85, 28, 22],
    [-150, -40, 24, 18],
    [-20, -18, 16, 10],
    [22, -22, 18, 12],
    [-18, 22, 16, 9],
    [28, 20, 17, 10],
    [8, -8, 10, 7],
    [155, -85, 22, 16],
    [200, -40, 18, 12],
  ],
};

export const RINGS = [
  { id: 'A', ...LOCK.rings.A },
  { id: 'B', ...LOCK.rings.B },
];

export const LAND_PALETTE = {
  'The Block': { body: 0x6a4030, trim: 0x3a2418, roof: 0x3a2a22, window: 0x8ec4d4, marquee: 0xc45c3a, queue: 0x4a3a28, door: 0x2a1c16 },
  'After Hours': { body: 0x2a2438, trim: 0x1a1428, roof: 0x1a1524, window: 0xd4a0ff, marquee: 0x6a4cff, queue: 0x3a3050, door: 0x161018 },
  'The Board': { body: 0xc4b08a, trim: 0x6a5840, roof: 0x5a4030, window: 0x7eb8e8, marquee: 0xd4a04a, queue: 0x6a5438, door: 0x3a2a1c },
  'The Pocket': { body: 0x5a4a38, trim: 0x3d3428, roof: 0x3d3428, window: 0xa8d4c8, marquee: 0xc9b48a, queue: 0x4a3a28, door: 0x2b241c },
  Gate: { body: 0x5a4634, trim: 0x3d2e22, roof: 0x2b241c, window: 0x1a2430, marquee: 0xc9b48a, queue: 0x3d3428, door: 0x1e1812 },
};

export function skuSpec(p) {
  const eaves = p.sku === 'kiosk' ? 0.55 : p.sku === 'pavilion' ? 0.95 : 1.3;
  const roofH = p.sku === 'kiosk' ? 1.15 : p.sku === 'pavilion' ? 1.75 : 2.5;
  const queueL = p.queueL != null ? p.queueL : (p.sku === 'kiosk' ? 2.6 : p.sku === 'pavilion' ? 4.4 : 5.6);
  return {
    w: p.w, d: p.d, h: p.h,
    eaves,
    roofH,
    queueL,
    queueW: p.queueW ?? Math.min(p.w * 0.85, 4.2),
  };
}

export const BLUEPRINT = {
  PAD: 80,
  get W() { return (LOCK.A + this.PAD) * 2; },
  get H() { return (LOCK.B + this.PAD) * 2; },
  get CX() { return this.W / 2; },
  get CY() { return this.H / 2; },
};

export function svgToMeters(svgX, svgY) {
  return { x: svgX - BLUEPRINT.CX, z: svgY - BLUEPRINT.CY };
}

export function hoverLabel(svgX, svgY) {
  const { x, z } = svgToMeters(svgX, svgY);
  return `x ${x.toFixed(0)} m   z ${z.toFixed(0)} m`;
}

export function inEllipse(x, z, cx, cz, rx, rz) {
  const dx = (x - cx) / rx;
  const dz = (z - cz) / rz;
  return dx * dx + dz * dz <= 1;
}

export function inStadium(x, z) {
  const S = LOCK.A - LOCK.capR;
  if (Math.abs(x) <= S && Math.abs(z) <= LOCK.B) return true;
  if (Math.hypot(x - S, z) <= LOCK.capR) return true;
  if (Math.hypot(x + S, z) <= LOCK.capR) return true;
  return false;
}

export function onSpine(x, z, half = LOCK.spineWidth / 2) {
  return Math.abs(x) < half && z >= 0 && z <= LOCK.B;
}

export function spineCadPolyline(side, step = 8, offset = 0) {
  const x = side * (LOCK.spineWidth / 2 + offset);
  const pts = [];
  for (let z = 0; z <= LOCK.gate.z; z += step) pts.push([x, z]);
  if (pts[pts.length - 1][1] !== LOCK.gate.z) pts.push([x, LOCK.gate.z]);
  return pts;
}

export function northSpineCadPolyline(side, step = 8, offset = 0) {
  const x = side * (LOCK.spineWidth / 2 + offset);
  const zEnd = -LOCK.B;
  const pts = [];
  for (let z = 0; z >= zEnd; z -= step) pts.push([x, z]);
  if (pts[pts.length - 1][1] !== zEnd) pts.push([x, zEnd]);
  return pts;
}

export const PATH_SCALE = {
  lakesideW: 3.2,
  lakesideOffset: 2.6,
  copingW: 0.5,
  copingH: 0.32,
  lampH: 3.6,
  spineCurbW: 0.45,
  railH: 1.2,
  railPost: 0.28,
  railBarT: 0.12,
};

export function lakesideRibbonPolyline(cx, cz, rx, rz, offset = PATH_SCALE.lakesideOffset, n = 48) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * (rx + offset), cz + Math.sin(a) * (rz + offset)]);
  }
  pts.push(pts[0]);
  return pts;
}

export function lakesideRibbonRuns(cx, cz, rx, rz, offset = PATH_SCALE.lakesideOffset, n = 48) {
  const half = LOCK.spineWidth / 2 + 0.8;
  const ring = lakesideRibbonPolyline(cx, cz, rx, rz, offset, n).slice(0, -1);
  const off = (p) => Math.abs(p[0]) >= half;
  const runs = [];
  let cur = [];
  for (const p of ring) {
    if (off(p)) cur.push(p);
    else if (cur.length) {
      if (cur.length >= 3) runs.push(cur);
      cur = [];
    }
  }
  if (cur.length >= 3) runs.push(cur);
  if (runs.length >= 2 && off(ring[0]) && off(ring[ring.length - 1])) {
    const last = runs[runs.length - 1];
    const first = runs[0];
    if (last[last.length - 1] === ring[ring.length - 1] && first[0] === ring[0]) {
      runs[0] = last.concat(first);
      runs.pop();
    }
  }
  if (runs.length === 1 && runs[0].length === ring.length) runs[0] = runs[0].concat([runs[0][0]]);
  return runs;
}

export const WALKS = [
  { id: 'block-lakeshore', name: 'Block Lakeshore', land: 'The Block', loop: true, lakes: [0, 4, 3, 2, 1], sign: { x: -88, z: 8, yaw: Math.PI / 2 } },
  { id: 'board-promenade', name: 'Board Promenade', land: 'The Board', loop: true, lakes: [10, 11], sign: { x: 140, z: -55, yaw: -Math.PI / 2 } },
  { id: 'block-spine-approach', name: 'Block Spine Approach', land: 'The Block', loop: false, lakes: [2], spur: [-12, 70], sign: { x: -55, z: 55, yaw: Math.PI / 2 } },
  { id: 'after-hours-quiet', name: 'After Hours Quiet', land: 'After Hours', loop: false, lakes: [5], spur: [-12, -100], sign: { x: 8, z: -72, yaw: 0 } },
  { id: 'pocket-rim', name: 'Pocket Rim', land: 'The Pocket', loop: false, lakes: [8], spur: [12, 95], sign: { x: 55, z: 88, yaw: -Math.PI / 2 } },
];

export const ITINERARY = {
  id: 'park-circuit',
  name: 'Park Circuit',
  sequence: ['block-spine-approach', 'block-lakeshore', 'after-hours-quiet', 'board-promenade', 'pocket-rim'],
  stops: [
    { walk: 'block-spine-approach', atMin: 3, legMin: 5 },
    { walk: 'block-lakeshore', atMin: 8, legMin: 10 },
    { walk: 'after-hours-quiet', atMin: 18, legMin: 10 },
    { walk: 'board-promenade', atMin: 28, legMin: 10 },
    { walk: 'pocket-rim', atMin: 38, legMin: 7 },
  ],
  totalMin: 52,
  returnToGate: { x: 12, z: 180, atMin: 52 },
  sign: { x: 0, z: 205, yaw: Math.PI },
};
