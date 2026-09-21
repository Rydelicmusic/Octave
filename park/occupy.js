/** Occupancy + spatial index. Claim before mesh. Build reads dump() instead of guessing. */
import { CELL, createIndex, aabbOverlap3, pointInAABB, distPointAABB } from './spatial.js';

const index = createIndex();

function defaultPad(kind) {
  if (kind === 'tree') return 1.5;
  if (kind === 'road' || kind === 'spine' || kind === 'path') return 0.6;
  return 2;
}

function layerOf(kind) {
  if (kind === 'spine' || kind === 'road' || kind === 'path') return 'ground';
  if (kind === 'tree') return 'canopy';
  return 'mass';
}

function asBox(lot) {
  const pad = lot.pad ?? defaultPad(lot.kind);
  const hw = (lot.w ?? 0) / 2 + pad;
  const hd = (lot.d ?? 0) / 2 + pad;
  const y0 = lot.y ?? 0;
  const h = lot.h ?? (lot.kind === 'road' || lot.kind === 'spine' || lot.kind === 'path' ? 0.4 : lot.kind === 'tree' ? 8 : 4);
  return {
    id: lot.id,
    kind: lot.kind || 'prop',
    layer: lot.layer || layerOf(lot.kind),
    minX: lot.x - hw, maxX: lot.x + hw,
    minZ: lot.z - hd, maxZ: lot.z + hd,
    y0, y1: y0 + h,
    x: lot.x, z: lot.z, w: lot.w, d: lot.d, pad, h,
    src: lot,
  };
}

function isPlate(lot) {
  return lot.kind === 'plate' || lot.kind === 'land' || lot.kind === 'floor';
}

function blocks(a, b) {
  if (!aabbOverlap3(a, b) && !(a.y1 === undefined)) {
    if (!(a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ)) return false;
  }
  const xz = a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
  if (!xz) return false;
  if (isPlate(a) || isPlate(b)) return false;
  if (a.layer === 'ground' && b.layer === 'mass') return false;
  if (a.layer === 'ground' || b.layer === 'ground') return true;
  if (a.layer === 'mass' || b.layer === 'mass') return true;
  if (a.layer === 'canopy' && b.layer === 'canopy') return true;
  return true;
}

export function cellOf(x, z) {
  return 'G' + Math.floor(x / CELL) + ',' + Math.floor(z / CELL);
}

export function fits(lot) {
  const a = asBox(lot);
  for (const c of index.queryBox(a)) {
    if (c.id === lot.id) continue;
    if (blocks(a, c)) return false;
  }
  return true;
}

export function claim(lot) {
  if (!lot || !lot.id) return false;
  if (index.all().some((c) => c.id === lot.id)) return true;
  if (!fits(lot)) return false;
  index.insert(asBox(lot));
  return true;
}

export function seedLocked(list) {
  let n = 0;
  for (const b of list || []) {
    if (claim({
      id: b.id,
      kind: b.kind || b.role || 'building',
      layer: 'mass',
      x: b.x, z: b.z, w: b.w, d: b.d, h: b.h,
      pad: 2,
      sku: b.sku,
    })) n += 1;
  }
  return n;
}

export function seedSpine(LOCK) {
  return claim({
    id: 'spine-14',
    kind: 'spine',
    layer: 'ground',
    x: 0, z: 0,
    w: LOCK.spineWidth || 14,
    d: (LOCK.B || 230) * 2,
    h: 0.4,
    pad: 0.6,
  });
}

const PLATE_IDS = {
  'The Block': 'plate-block',
  'After Hours': 'plate-hours',
  'The Board': 'plate-board',
  'The Pocket': 'plate-pocket',
};

export function seedPlates(LOCK) {
  let n = 0;
  const cans = (LOCK && LOCK.canopies) || {};
  for (const [land, id] of Object.entries(PLATE_IDS)) {
    const c = cans[land];
    if (!c) continue;
    if (claim({
      id,
      kind: 'plate',
      layer: 'ground',
      x: c.cx, z: c.cz,
      w: (c.rx || 0) * 2,
      d: (c.rz || 0) * 2,
      h: 0.02,
      pad: 0,
      land,
    })) n += 1;
  }
  return n;
}

export function seedPark(LOCK, BUILDINGS, GATE, STATIONS) {
  const locked = seedLocked([...(BUILDINGS || []), ...(GATE || []), ...(STATIONS || [])]);
  const spine = seedSpine(LOCK);
  const plates = seedPlates(LOCK);
  return { locked, spine, plates };
}

export function lots() {
  return index.all();
}

export function at(x, z, y = 0) {
  return index.queryPoint(x, z).map((c) => ({
    id: c.id, kind: c.kind, layer: c.layer,
    rel: y < c.y0 - 0.05 ? 'under' : y > c.y1 + 0.05 ? 'over' : 'on',
  }));
}

export function near(x, z, radius = 8) {
  return index.queryRadius(x, z, radius).map(({ lot, dist }) => ({
    id: lot.id, kind: lot.kind, layer: lot.layer, dist,
  }));
}

export function whyBlocked(lot) {
  const a = asBox(lot);
  return index.queryBox(a)
    .filter((c) => c.id !== lot.id && blocks(a, c))
    .map((c) => ({ id: c.id, kind: c.kind, layer: c.layer, how: 'overlap', dist: distPointAABB(lot.x, lot.z, c) }));
}

export function dump() {
  return {
    crs: 'park/CRS.md',
    index: '25m-hash',
    rule: 'park/MAP.md',
    count: index.size(),
    lots: index.all().map(({ src, ...c }) => ({
      id: c.id,
      kind: c.kind,
      layer: c.layer,
      x: c.x,
      z: c.z,
      w: c.w,
      d: c.d,
      h: c.h,
      pad: c.pad,
      cell: cellOf(c.x, c.z),
      minX: c.minX,
      maxX: c.maxX,
      minZ: c.minZ,
      maxZ: c.maxZ,
      y0: c.y0,
      y1: c.y1,
    })),
  };
}

export function clearDynamic() {
  for (const c of index.all()) {
    const id = String(c.id);
    if (id.startsWith('sketch-') || id.startsWith('tree-dyn-')) index.remove(id);
  }
}

export function treeLot(id, x, z, radius) {
  const r = Math.max(1.2, radius || 2);
  return { id, kind: 'tree', layer: 'canopy', x, z, w: r * 2, d: r * 2, pad: 1.5, h: 8 };
}

export { pointInAABB };
