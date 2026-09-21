/** G-cell jobs: claim drives, cap 2 trees/cell, rehome or skip. No random x/z. */
import {
  LOCK, occupiesSpine, inCanopy, inStadium, canPlaceSoft, beltTreePositions, treeMetrics,
} from './lock.js';
import { LAND_DRIVES, ROAD_W } from './roads.js';
import { claim, whyBlocked, treeLot, cellOf } from './occupy.js';

const HUB = LOCK.hubOuter || 32;
const LANDS = ['The Block', 'After Hours', 'The Board', 'The Pocket'];
const SPINE_OFF = (LOCK.spineWidth || 14) / 2 + 6;
const BELT_SPACING = 9;
const treeCount = new Map();
const propCount = new Map();
const log = [];

function landAt(x, z) {
  for (const name of LANDS) if (inCanopy(x, z, name)) return name;
  return null;
}

function note(cell, action, id) {
  log.push({ cell, action, id });
}

export function surveyLog() {
  return log.slice();
}

export function treeStats() {
  let claimed = 0;
  let skipped = 0;
  for (const e of log) {
    if (e.action === 'claim-tree' || e.action === 'rehome-tree') claimed += 1;
    if (e.action === 'skip-tree') skipped += 1;
  }
  let over = 0;
  for (const n of treeCount.values()) if (n > 2) over += 1;
  return { claimed, skipped, overCap: over };
}

export function beltSlots(pts) {
  const kept = [];
  for (const p of pts || []) {
    if (Math.abs(p.x) < SPINE_OFF) continue;
    if (Math.hypot(p.x, p.z) < HUB + 6) continue;
    if (kept.some((k) => Math.hypot(k.x - p.x, k.z - p.z) < BELT_SPACING)) continue;
    kept.push(p);
  }
  return kept;
}

function driveSegs(d) {
  const xs = d.pts.map((p) => p[0]);
  const zs = d.pts.map((p) => p[1]);
  const sameX = xs.every((x) => Math.abs(x - xs[0]) < 0.05);
  const sameZ = zs.every((z) => Math.abs(z - zs[0]) < 0.05);
  if (sameX || sameZ) return [[d.pts[0], d.pts[d.pts.length - 1]]];
  const out = [];
  for (let i = 0; i < d.pts.length - 1; i++) out.push([d.pts[i], d.pts[i + 1]]);
  return out;
}

export function claimDrives() {
  let n = 0;
  for (const d of LAND_DRIVES) {
    const segs = driveSegs(d);
    for (let i = 0; i < segs.length; i++) {
      const [[x0, z0], [x1, z1]] = segs[i];
      const x = (x0 + x1) / 2;
      const z = (z0 + z1) / 2;
      const axisX = Math.abs(x1 - x0) < 0.05;
      const w = axisX ? ROAD_W : Math.abs(x1 - x0);
      const depth = axisX ? Math.abs(z1 - z0) : ROAD_W;
      if (occupiesSpine(x, z, ROAD_W / 2)) {
        note(cellOf(x, z), 'skip-spine', d.id + '-' + i);
        continue;
      }
      const lot = {
        id: d.id + '-' + i,
        kind: 'road',
        layer: 'ground',
        x, z, w, d: depth, h: 0.28, pad: 0.6,
      };
      if (whyBlocked(lot).length) {
        if (!claim(lot)) {
          note(cellOf(x, z), 'skip-blocked', lot.id);
          continue;
        }
      }
      if (claim(lot)) {
        n += 1;
        note(cellOf(x, z), 'claim-road', lot.id);
      }
    }
  }
  return n;
}

export function placeTree(id, x, z, radius) {
  const r = Math.max(1.2, radius || 2);
  const land0 = landAt(x, z);
  function tryAt(tx, tz) {
    if (!inStadium(tx, tz)) return 'no';
    if (occupiesSpine(tx, tz, r) || Math.hypot(tx, tz) < HUB) return 'no';
    const c = cellOf(tx, tz);
    if ((treeCount.get(c) || 0) >= 2) return 'cap';
    const lot = treeLot(id, tx, tz, r);
    if (whyBlocked(lot).length) return 'blocked';
    if (!claim(lot)) return 'blocked';
    treeCount.set(c, (treeCount.get(c) || 0) + 1);
    return { x: tx, z: tz, cell: c };
  }
  let hit = tryAt(x, z);
  if (hit && typeof hit === 'object') {
    note(hit.cell, 'claim-tree', id);
    return hit;
  }
  if (hit !== 'cap') {
    note(cellOf(x, z), 'skip-tree', id);
    return null;
  }
  const gx = Math.floor(x / 25);
  const gz = Math.floor(z / 25);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [dx, dz] of dirs) {
    const tx = (gx + dx) * 25 + 12.5;
    const tz = (gz + dz) * 25 + 12.5;
    if (land0 && !inCanopy(tx, tz, land0)) continue;
    hit = tryAt(tx, tz);
    if (hit && typeof hit === 'object') {
      note(hit.cell, 'rehome-tree', id);
      return hit;
    }
  }
  note(cellOf(x, z), 'skip-tree', id);
  return null;
}

export function placeProp(id, x, z, w = 1.8, d = 0.5) {
  if (occupiesSpine(x, z, Math.max(w, d) / 2)) {
    note(cellOf(x, z), 'skip-prop-spine', id);
    return false;
  }
  if (Math.hypot(x, z) < HUB) {
    note(cellOf(x, z), 'skip-prop-hub', id);
    return false;
  }
  const c = cellOf(x, z);
  if ((propCount.get(c) || 0) >= 2) {
    note(c, 'skip-prop-cap', id);
    return false;
  }
  const lot = { id, kind: 'prop', layer: 'prop', x, z, w, d, h: 3.6, pad: 1.5 };
  if (whyBlocked(lot).length) {
    note(c, 'skip-prop-blocked', id);
    return false;
  }
  if (!claim(lot)) return false;
  propCount.set(c, (propCount.get(c) || 0) + 1);
  note(c, 'claim-prop', id);
  return true;
}

function clumpPts(cx, cz, n, rad) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (i % 3) * 0.37;
    const d = rad * (0.2 + ((i * 19) % 11) / 14);
    pts.push([cx + Math.cos(a) * d, cz + Math.sin(a) * d]);
  }
  return pts;
}

export function replayTrees() {
  let seq = 0;
  function add(x, z, s = 1, seed = 0) {
    const m = treeMetrics(s, seed);
    if (!canPlaceSoft(x, z, m.canopyR * 0.5)) return;
    if (Math.hypot(x, z) < HUB) return;
    placeTree('tree-' + (++seq), x, z, m.canopyR);
  }
  for (const name of ['west lakes', 'SE grove', 'north split']) {
    for (const p of beltSlots(beltTreePositions(name))) add(p.x, p.z, p.s, p.seed);
  }
  const B = LOCK.B;
  for (let z = 34; z < B - 10; z += 9) {
    for (const [cx, cz] of [[-13.5, z], [13.5, z]]) {
      clumpPts(cx, cz, 2, 3.2).forEach(([x, zz], i) => add(x, zz, 1.05 * (0.72 + (i % 5) * 0.13), i + 11));
    }
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + 0.3;
    if (Math.abs(Math.sin(a)) > 0.88) continue;
    add(Math.cos(a) * 38, Math.sin(a) * 38, 0.9, i + 11);
  }
  return seq;
}
