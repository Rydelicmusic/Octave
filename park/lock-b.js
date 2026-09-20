import { LOCK, occupiesSpine, inWater, onRingWalk, inStadium, inCanopy, ITINERARY } from './lock-a.js';

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
  copingW: 0.5,
  copingH: 0.32,
  hubBedH: 0.38,
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
      const s = 0.9 + (i % 5) * 0.08 + (ai % 3) * 0.04;
      const seed = i + ai * 13;
      const rad = treeMetrics(s, seed).canopyR * 0.5;
      if (canPlaceSoft(x, z, rad)) pts.push({ x, z, s, seed, belt: name });
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

export function waterCopingSegments(cx, cz, rx, rz, n = 48) {
  const w = GROUNDS_SCALE.copingW;
  const extra = w * 0.15;
  const segs = [];
  function pt(a, off) {
    const mx = Math.cos(a), mz = Math.sin(a);
    const ex = cx + mx * rx, ez = cz + mz * rz;
    const nx = mx * rx, nz = mz * rz;
    const nl = Math.hypot(nx, nz) || 1;
    return [ex + (nx / nl) * off, ez + (nz / nl) * off];
  }
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const [x, z] = pt(am, extra);
    const [x0, z0] = pt(a0, extra);
    const [x1, z1] = pt(a1, extra);
    segs.push({ x, z, w, len: Math.hypot(x1 - x0, z1 - z0), rotY: Math.atan2(x1 - x0, z1 - z0) });
  }
  return segs;
}
