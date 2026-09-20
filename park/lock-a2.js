import { LOCK, WALKS, ITINERARY, PATH_SCALE } from './lock-a1.js';

export function walkLake(i) {
  const [x, z, rx, rz] = LOCK.waters[i];
  return { i, x, z, rx, rz };
}

export function walkPairs(walk) {
  const idx = walk.lakes;
  const pairs = [];
  for (let i = 0; i < idx.length - 1; i++) pairs.push([idx[i], idx[i + 1]]);
  if (walk.loop && idx.length > 1) pairs.push([idx[idx.length - 1], idx[0]]);
  return pairs;
}

export function walkSegmentCrossesSpine(ax, az, bx, bz) {
  const half = LOCK.spineWidth / 2;
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const x = ax + (bx - ax) * t;
    const z = az + (bz - az) * t;
    if (Math.abs(x) < half && z >= -LOCK.B && z <= LOCK.B) return true;
  }
  return false;
}

export function walkById(id) {
  return WALKS.find((w) => w.id === id);
}

export const LAMP_LIGHT = { color: 0xffe1b0, intensity: 7, dist: 17, y: 3.2 };
export const SPINE_LAMP = { xWest: -8.3, xEast: 8.3, z0: 18, step: 14 };

export function spineLampZs(z0 = SPINE_LAMP.z0, step = SPINE_LAMP.step, zMax = LOCK.B - 12) {
  const zs = [];
  for (let z = z0; z < zMax; z += step) zs.push(z);
  return zs;
}

export function spineLampLitWest(z) {
  return (z - SPINE_LAMP.z0) % SPINE_LAMP.step === 0;
}

export function spineLampLitEast(z) {
  return (z - SPINE_LAMP.z0) % SPINE_LAMP.step === 0;
}

export function spineLampPointLights() {
  const lights = [];
  for (const z of spineLampZs()) {
    if (spineLampLitWest(z)) lights.push({ x: SPINE_LAMP.xWest, z, side: 'west' });
    if (spineLampLitEast(z)) lights.push({ x: SPINE_LAMP.xEast, z, side: 'east' });
  }
  return lights;
}

export function distMeters(ax, az, bx, bz) {
  return Math.hypot(bx - ax, bz - az);
}

export function walkPathMeters(walk) {
  const lakes = walk.lakes.map((i) => walkLake(i));
  let m = 0;
  for (let i = 0; i < lakes.length - 1; i++) m += distMeters(lakes[i].x, lakes[i].z, lakes[i + 1].x, lakes[i + 1].z);
  if (walk.loop && lakes.length > 1) {
    const a = lakes[lakes.length - 1], b = lakes[0];
    m += distMeters(a.x, a.z, b.x, b.z);
  }
  if (walk.spur && lakes[0]) m += distMeters(lakes[0].x, lakes[0].z, walk.spur[0], walk.spur[1]);
  return m;
}

export function shorePt(L, a, m = 2.85) {
  return [L.x + Math.cos(a) * (L.rx + m), L.z + Math.sin(a) * (L.rz + m)];
}

export function shoreArc(L, a0, a1, n = 10, m = 2.85) {
  let d = a1 - a0;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(shorePt(L, a0 + d * (i / n), m));
  return pts;
}

export function walkLinkPolyline(A, B) {
  const aAb = Math.atan2(B.z - A.z, B.x - A.x);
  const aBa = Math.atan2(A.z - B.z, A.x - B.x);
  const arcA = shoreArc(A, aAb - 0.55, aAb + 0.15, 10);
  const arcB = shoreArc(B, aBa - 0.15, aBa + 0.55, 10);
  const aTip = arcA[arcA.length - 1];
  const bTip = arcB[0];
  const mid = [(aTip[0] + bTip[0]) / 2, (aTip[1] + bTip[1]) / 2];
  const px = -(bTip[1] - aTip[1]);
  const pz = bTip[0] - aTip[0];
  const plen = Math.hypot(px, pz) || 1;
  mid[0] += (px / plen) * 2.2;
  mid[1] += (pz / plen) * 2.2;
  return [...arcA, mid, ...arcB];
}

export function walkSpurPolyline(walk) {
  if (!walk.spur || !walk.lakes[0]) return [];
  const L = walkLake(walk.lakes[0]);
  const a = Math.atan2(walk.spur[1] - L.z, walk.spur[0] - L.x);
  const start = shorePt(L, a, 5.2);
  const end = walk.spur;
  return [start, [(start[0] + end[0]) / 2, start[1]], end];
}

export function polylineMeters(pts) {
  let m = 0;
  for (let i = 0; i < pts.length - 1; i++) m += distMeters(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
  return m;
}

export function catmull1D(x0, x1, x2, x3, t, tension = 0.18) {
  const v0 = tension * (x2 - x0);
  const v1 = tension * (x3 - x1);
  const c0 = x1;
  const c1 = v0;
  const c2 = -3 * x1 + 3 * x2 - 2 * v0 - v1;
  const c3 = 2 * x1 - 2 * x2 + v0 + v1;
  return ((c3 * t + c2) * t + c1) * t + c0;
}

export function catmullPoint(pts, u, tension = 0.18) {
  const l = pts.length;
  if (l === 0) return [0, 0];
  if (l === 1) return [pts[0][0], pts[0][1]];
  if (l === 2) {
    const a = pts[0], b = pts[1];
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  }
  const p = (l - 1) * u;
  let intPoint = Math.floor(p);
  let weight = p - intPoint;
  if (weight === 0 && intPoint === l - 1) {
    intPoint = l - 2;
    weight = 1;
  }
  const p1 = pts[intPoint];
  const p2 = pts[Math.min(intPoint + 1, l - 1)];
  const p0 = intPoint > 0 ? pts[intPoint - 1] : [2 * p1[0] - p2[0], 2 * p1[1] - p2[1]];
  const p3 = intPoint + 2 < l ? pts[intPoint + 2] : [2 * p2[0] - p1[0], 2 * p2[1] - p1[1]];
  return [
    catmull1D(p0[0], p1[0], p2[0], p3[0], weight, tension),
    catmull1D(p0[1], p1[1], p2[1], p3[1], weight, tension),
  ];
}

export function catmullRibbonMeters(pts, tension = 0.18) {
  if (!pts || pts.length < 2) return 0;
  if (pts.length === 2) return distMeters(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
  const segs = Math.max(20, pts.length * 10);
  let m = 0;
  let prev = catmullPoint(pts, 0, tension);
  for (let i = 1; i <= segs; i++) {
    const cur = catmullPoint(pts, i / segs, tension);
    m += distMeters(prev[0], prev[1], cur[0], cur[1]);
    prev = cur;
  }
  return m;
}

export function hubApronPoint(x, z) {
  return [Math.sign(x || 1) * 22, Math.sign(z || 1) * 22];
}

export function hubApronPath(ax, az, bx, bz) {
  const a = [ax, az];
  const b = [bx, bz];
  const hubA = hubApronPoint(ax, az);
  const hubB = hubApronPoint(bx, bz);
  const path = [a, hubA];
  if (hubA[0] !== hubB[0] || hubA[1] !== hubB[1]) path.push(hubB);
  path.push(b);
  let ok = true;
  for (let k = 0; k < path.length - 1; k++) {
    if (walkSegmentCrossesSpine(path[k][0], path[k][1], path[k + 1][0], path[k + 1][1])) {
      ok = false;
      break;
    }
  }
  if (!ok) return [a, [Math.sign(ax || bx || 1) * 28, 0], b];
  return path;
}

export function walkRibbonMeters(walk) {
  let m = 0;
  for (const [ia, ib] of walkPairs(walk)) {
    m += catmullRibbonMeters(walkLinkPolyline(walkLake(ia), walkLake(ib)));
  }
  const spur = walkSpurPolyline(walk);
  if (spur.length) m += catmullRibbonMeters(spur);
  return m;
}

export function metersToMin(m) {
  return m / LOCK.walk / 60;
}

export function measureItinerary(it = ITINERARY) {
  const seq = it.sequence.map((id) => walkById(id)).filter(Boolean);
  const stops = [];
  let tMin = 0;
  let prev = { x: it.sign.x, z: it.sign.z };
  for (const w of seq) {
    const p = w.sign;
    const approach = catmullRibbonMeters(hubApronPath(prev.x, prev.z, p.x, p.z));
    const onWalk = walkRibbonMeters(w);
    const legM = approach + onWalk;
    const legMin = metersToMin(legM);
    tMin += legMin;
    stops.push({ walk: w.id, atMin: Math.round(tMin), legMin: Math.round(legMin), meters: Math.round(legM) });
    prev = { x: p.x, z: p.z };
  }
  const ret = it.returnToGate;
  const retM = catmullRibbonMeters(hubApronPath(prev.x, prev.z, ret.x, ret.z));
  tMin += metersToMin(retM);
  return { stops, totalMin: Math.round(tMin), returnToGate: { x: ret.x, z: ret.z, atMin: Math.round(tMin), meters: Math.round(retM) } };
}

{
  const measured = measureItinerary();
  ITINERARY.stops = measured.stops;
  ITINERARY.totalMin = measured.totalMin;
  ITINERARY.returnToGate = measured.returnToGate;
}

export function inWater(x, z, margin = 0) {
  return LOCK.waters.some(([cx, cz, rx, rz]) => {
    const dx = (x - cx) / (rx + margin);
    const dz = (z - cz) / (rz + margin);
    return dx * dx + dz * dz <= 1;
  });
}

export function inCanopy(x, z, land) {
  const c = LOCK.canopies[land];
  if (!c) return false;
  const dx = (x - c.cx) / c.rx;
  const dz = (z - c.cz) / c.rz;
  return dx * dx + dz * dz <= 1;
}

export function nearRing(x, z, pad = 8) {
  const a = LOCK.rings.A;
  const b = LOCK.rings.B;
  return Math.hypot(x - a.x, z - a.z) < a.outer + pad || Math.hypot(x - b.x, z - b.z) < b.outer + pad;
}

export function onRingWalk(x, z, radius = 0) {
  for (const ring of Object.values(LOCK.rings)) {
    const d = Math.hypot(x - ring.x, z - ring.z);
    if (d + radius > ring.inner && d - radius < ring.outer) return true;
  }
  return false;
}

export function canPlaceBuilding(b) {
  const hw = b.w / 2;
  const hd = b.d / 2;
  const corners = [[b.x - hw, b.z - hd], [b.x + hw, b.z - hd], [b.x - hw, b.z + hd], [b.x + hw, b.z + hd], [b.x, b.z]];
  for (const [x, z] of corners) {
    if (Math.abs(x) > LOCK.A - LOCK.capR && Math.hypot(Math.abs(x) - (LOCK.A - LOCK.capR), z) > LOCK.capR && Math.abs(z) > LOCK.B) return false;
    if (Math.abs(x) < LOCK.spineWidth / 2 && z >= 0 && z <= LOCK.B) return false;
    if (inWater(x, z, 3)) return false;
    if (!inCanopy(x, z, b.land)) return false;
    if (nearRing(x, z, 10)) return false;
    if (Math.hypot(x, z) < LOCK.hubOuter + 4) return false;
  }
  return true;
}

export function occupiesSpine(x, z, radius = 0) {
  const half = LOCK.spineWidth / 2;
  return Math.abs(x) < half + radius && Math.abs(z) < LOCK.B + 8;
}
