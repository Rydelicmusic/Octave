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

/** Blueprint SVG: origin is viewBox center; +x east, +z south (same as 3D). */
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

/** 14 m Gate→Hub spine strip (half-width 7 m), z from hub to Gate. */
export function onSpine(x, z, half = LOCK.spineWidth / 2) {
  return Math.abs(x) < half && z >= 0 && z <= LOCK.B;
}

export function inWater(x, z, margin = 0) {
  return LOCK.waters.some(([cx, cz, rx, rz]) => inEllipse(x, z, cx, cz, rx + margin, rz + margin));
}

export function inCanopy(x, z, land) {
  const c = LOCK.canopies[land];
  if (!c) return false;
  return inEllipse(x, z, c.cx, c.cz, c.rx, c.rz);
}

export function nearRing(x, z, pad = 8) {
  const a = LOCK.rings.A;
  const b = LOCK.rings.B;
  return Math.hypot(x - a.x, z - a.z) < a.outer + pad || Math.hypot(x - b.x, z - b.z) < b.outer + pad;
}

/** True if a disk of `radius` intersects a Pocket ring walking annulus (inner–outer). */
export function onRingWalk(x, z, radius = 0) {
  for (const ring of Object.values(LOCK.rings)) {
    const d = Math.hypot(x - ring.x, z - ring.z);
    if (d + radius > ring.inner && d - radius < ring.outer) return true;
  }
  return false;
}

/**
 * SKU building may sit inside a land canopy, not on the 14 m spine,
 * not in water, not through the stadium rail, not overlapping locked rings.
 */
export function canPlaceBuilding(b) {
  const hw = b.w / 2;
  const hd = b.d / 2;
  const corners = [
    [b.x - hw, b.z - hd],
    [b.x + hw, b.z - hd],
    [b.x - hw, b.z + hd],
    [b.x + hw, b.z + hd],
    [b.x, b.z],
  ];
  for (const [x, z] of corners) {
    if (!inStadium(x, z)) return false;
    if (onSpine(x, z)) return false;
    if (inWater(x, z, 3)) return false;
    if (!inCanopy(x, z, b.land)) return false;
    if (nearRing(x, z, 10)) return false;
    if (Math.hypot(x, z) < LOCK.hubOuter + 4) return false;
  }
  return true;
}

/** Radius-aware 14 m N–S walk (Gate at +Z). Plantings/props must not occupy this strip. */
export function occupiesSpine(x, z, radius = 0) {
  const half = LOCK.spineWidth / 2;
  return Math.abs(x) < half + radius && Math.abs(z) < LOCK.B + 8;
}

export function canPlaceSoft(x, z, radius = 1) {
  if (occupiesSpine(x, z, radius)) return false;
  if (inWater(x, z, radius)) return false;
  if (onRingWalk(x, z, radius)) return false;
  for (const b of BUILDINGS) {
    if (Math.abs(x - b.x) < b.w / 2 + radius + 1.5 && Math.abs(z - b.z) < b.d / 2 + radius + 1.5) return false;
  }
  return true;
}

export const MATERIALS = {
  'sand-path': 0xe6d3a4,
  'concrete-plaza': 0xb9b3a8,
  grass: 0x4f7a3c,
  'packed-earth': 0x6b5340,
  curb: 0x5a4630
};

function shoreAround(cx, cz, rx, rz, extra, n, phase = 0.2) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + phase;
    out.push([cx + Math.cos(a) * (rx + extra), cz + Math.sin(a) * (rz + extra)]);
  }
  return out;
}

export const TREE_BELTS = {
  'west lakes': {
    anchors: LOCK.waters
      .filter(([x]) => x < -80)
      .flatMap(([x, z, rx, rz]) => shoreAround(x, z, rx, rz, 12, 8))
      .concat([[-70, -70], [-80, 20], [-230, 20], [-140, -100], [-185, -40]]),
    spread: 7,
    count: 10
  },
  'SE grove': {
    anchors: [
      ...shoreAround(LOCK.rings.A.x, LOCK.rings.A.z, LOCK.rings.A.outer, LOCK.rings.A.outer, 12, 8),
      ...shoreAround(LOCK.rings.B.x, LOCK.rings.B.z, LOCK.rings.B.outer, LOCK.rings.B.outer, 12, 8),
      [75, 70], [100, 50], [55, 100], [130, 85], [85, 125],
      [145, 70], [70, 130], [110, 130], [150, 40], [110, 120], [70, 145]
    ],
    spread: 8,
    count: 10
  },
  'north split': {
    anchors: LOCK.waters
      .filter(([, z]) => z < -70)
      .flatMap(([x, z, rx, rz]) => shoreAround(x, z, rx, rz, 12, 8))
      .concat([
        [-45, -110], [20, -120], [-20, -160], [50, -95], [-80, -130],
        [-10, -140], [40, -155], [-60, -90], [10, -175], [-90, -150],
        [90, -170], [-100, -165], [0, -190]
      ]),
    spread: 8,
    count: 10
  }
};

export const GROUNDS_SCALE = {
  lampH: 3.6,
  benchSeat: 0.45,
  lakesideW: 3.2,
  lakesideOffset: 2.6,
  treeTrunkH: [5.2, 11.2],
  treeTrunkR: [0.12, 0.28]
};

export function treeMetrics(s = 1, seed = 0) {
  const trunkH = GROUNDS_SCALE.treeTrunkH[0] + (seed % 5) * 1.15 + Math.max(0, s - 1) * 2.0;
  const trunkR = 0.13 + (seed % 3) * 0.035 + Math.max(0, s - 1) * 0.04;
  const canopyR = 2.6 + (seed % 4) * 0.28 + s * 0.55;
  return { trunkH, trunkR, canopyR };
}

export const GROUNDS_DRESSING = {
  treeBelts: ['west lakes', 'SE grove', 'north split'],
  hubRadialBeds: 8,
  lakesideRibbons: true,
  materials: ['sand-path', 'concrete-plaza', 'grass', 'packed-earth', 'curb'],
  lamps: ['spine', 'gate'],
  landWash: true,
  waterReflection: true,
  softProps: ['benches', 'lamps', 'trash', 'planters', 'ropes']
};

export function beltTreePositions(name) {
  const spec = TREE_BELTS[name];
  if (!spec) return [];
  const pts = [];
  spec.anchors.forEach(([cx, cz], ai) => {
    for (let i = 0; i < spec.count; i++) {
      const a = (i / spec.count) * Math.PI * 2 + ai * 0.41;
      const d = spec.spread * (0.18 + ((i * 19 + ai * 7) % 11) / 14);
      const x = cx + Math.cos(a) * d;
      const z = cz + Math.sin(a) * d;
      const s = 0.68 + (i % 5) * 0.17 + (ai % 3) * 0.05;
      if (canPlaceSoft(x, z, 2.2 * s)) pts.push({ x, z, s, seed: i + ai * 13, belt: name });
    }
  });
  return pts;
}

export function hubBedCenters() {
  const r = (LOCK.hubInner + LOCK.hubOuter) / 2;
  const beds = [];
  for (let i = 0; i < GROUNDS_DRESSING.hubRadialBeds; i++) {
    const a = (i / GROUNDS_DRESSING.hubRadialBeds) * Math.PI * 2 + Math.PI / 8;
    beds.push({ i, a, x: Math.cos(a) * r, z: Math.sin(a) * r, r });
  }
  return beds;
}

export function lakesideRibbonSegments(cx, cz, rx, rz, n = 64) {
  const pathW = GROUNDS_SCALE.lakesideW;
  const dist = GROUNDS_SCALE.lakesideOffset;
  const segs = [];
  function edge(a, extra) {
    const mx = Math.cos(a), mz = Math.sin(a);
    const ex = cx + mx * rx, ez = cz + mz * rz;
    const nx = mx * rx, nz = mz * rz;
    const nl = Math.hypot(nx, nz) || 1;
    return [ex + (nx / nl) * extra, ez + (nz / nl) * extra];
  }
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const [x, z] = edge(am, dist);
    if (occupiesSpine(x, z, pathW / 2)) continue;
    const [x0, z0] = edge(a0, dist);
    const [x1, z1] = edge(a1, dist);
    segs.push({ x, z, w: pathW, len: Math.hypot(x1 - x0, z1 - z0), rotY: Math.atan2(x1 - x0, z1 - z0) });
  }
  return segs;
}

export function lakesideRibbonMesh(cx, cz, rx, rz, n = 64) {
  const segs = lakesideRibbonSegments(cx, cz, rx, rz, n);
  const skipped = n - segs.length;
  return { x: cx, z: cz, rx, rz, segs, skipped, closedRing: skipped === 0 };
}

export function allLakesideRibbons() {
  return LOCK.waters.map(([x, z, rx, rz]) => lakesideRibbonMesh(x, z, rx, rz));
}

/** 1 song = kiosk, EP = pavilion, album = full building. */
export const BUILDINGS = [
  { id: 'block-album', land: 'The Block', sku: 'album', name: 'Block Hall', x: -250, z: 48, w: 22, d: 14, h: 9.2, yaw: 0.18, body: 0x6a4030, trim: 0x3a2418 },
  { id: 'block-ep', land: 'The Block', sku: 'pavilion', name: 'Block Pavilion', x: -95, z: -130, w: 12, d: 8.5, h: 5.2, yaw: 0.35, body: 0x7a4e38, trim: 0x3d281c },
  { id: 'block-song', land: 'The Block', sku: 'kiosk', name: 'Block Kiosk', x: -78, z: 52, w: 3.8, d: 3.8, h: 3.15, yaw: 0.1, body: 0x8a5a40, trim: 0x2c1c12 },
  { id: 'block-song-2', land: 'The Block', sku: 'kiosk', name: 'Block Cart', x: -175, z: 95, w: 3.6, d: 3.6, h: 3.05, yaw: -0.4, body: 0x8a5a40, trim: 0x2c1c12 },
  { id: 'hours-album', land: 'After Hours', sku: 'album', name: 'After Hours', x: 28, z: -182, w: 20, d: 12, h: 8.4, yaw: 0.05, body: 0x2a2438, trim: 0x1a1428 },
  { id: 'hours-ep', land: 'After Hours', sku: 'pavilion', name: 'Hours Pavilion', x: -78, z: -155, w: 11, d: 8, h: 4.9, yaw: 0.55, body: 0x3a3050, trim: 0x1c1828 },
  { id: 'hours-song', land: 'After Hours', sku: 'kiosk', name: 'Hours Kiosk', x: 95, z: -148, w: 3.6, d: 3.6, h: 3.1, yaw: -0.2, body: 0x4a4060, trim: 0x1a1424 },
  { id: 'board-album', land: 'The Board', sku: 'album', name: 'Board Hall', x: 248, z: 42, w: 22, d: 14, h: 9.0, yaw: -0.22, body: 0xc4b08a, trim: 0x6a5840 },
  { id: 'board-ep', land: 'The Board', sku: 'pavilion', name: 'Board Pavilion', x: 175, z: 95, w: 12, d: 8.5, h: 5.1, yaw: -0.45, body: 0xd2c4a0, trim: 0x6a5840 },
  { id: 'board-song', land: 'The Board', sku: 'kiosk', name: 'Board Kiosk', x: 88, z: -18, w: 3.8, d: 3.8, h: 3.15, yaw: 0.3, body: 0xd8c8a4, trim: 0x5a4830 },
  { id: 'board-song-2', land: 'The Board', sku: 'kiosk', name: 'Board Cart', x: 210, z: 88, w: 3.6, d: 3.6, h: 3.05, yaw: 0.6, body: 0xd8c8a4, trim: 0x5a4830 },
];
