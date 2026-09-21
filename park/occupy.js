/** Spatial lots. Claim before mesh. Query = how Build "sees". */

const claimed = [];

function box(lot) {
  const pad = lot.pad ?? defaultPad(lot.kind);
  const hw = (lot.w ?? 0) / 2 + pad;
  const hd = (lot.d ?? 0) / 2 + pad;
  const y0 = lot.y ?? 0;
  const h = lot.h ?? (lot.kind === 'road' || lot.kind === 'spine' ? 0.4 : lot.kind === 'tree' ? 8 : 4);
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

function defaultPad(kind) {
  if (kind === 'tree') return 1.5;
  if (kind === 'road' || kind === 'spine') return 0.6;
  if (kind === 'path') return 0.4;
  return 2;
}

function layerOf(kind) {
  if (kind === 'spine' || kind === 'road' || kind === 'path') return 'ground';
  if (kind === 'tree') return 'canopy';
  return 'mass';
}

function overlapXZ(a, b) {
  return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
}

function distPointBox(x, z, b) {
  const cx = Math.max(b.minX, Math.min(x, b.maxX));
  const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
  return Math.hypot(x - cx, z - cz);
}

export function fits(lot, extra = []) {
  const a = box(lot);
  const hard = new Set(['mass', 'canopy', 'ground']);
  for (const c of claimed) {
    if (c.id === lot.id) continue;
    if (!overlapXZ(a, c)) continue;
    if (a.layer === 'ground' && c.layer === 'ground') return false;
    if (a.layer === 'mass' && (c.layer === 'mass' || c.layer === 'canopy' || c.layer === 'ground')) return false;
    if (a.layer === 'canopy' && (c.layer === 'mass' || c.layer === 'canopy' || c.layer === 'ground')) return false;
    if (hard.has(a.layer) && hard.has(c.layer) && a.layer === c.layer) return false;
  }
  for (const c of extra) if (overlapXZ(a, box(c))) return false;
  return true;
}

export function claim(lot) {
  if (!lot || !lot.id) return false;
  if (claimed.some((c) => c.id === lot.id)) return true;
  if (!fits(lot)) return false;
  claimed.push(box(lot));
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
  const half = (LOCK.spineWidth || 14) / 2;
  return claim({
    id: 'spine-14',
    kind: 'spine',
    layer: 'ground',
    x: 0, z: 0,
    w: LOCK.spineWidth || 14,
    d: (LOCK.B || 230) * 2,
    h: 0.4,
    pad: 0.6,
  }) && half;
}

export function lots() {
  return claimed.slice();
}

export function at(x, z, y = 0) {
  return claimed.filter((c) => x >= c.minX && x <= c.maxX && z >= c.minZ && z <= c.maxZ)
    .map((c) => ({ ...c, rel: y < c.y0 - 0.05 ? 'under' : y > c.y1 + 0.05 ? 'over' : 'on' }));
}

export function near(x, z, radius = 8) {
  return claimed
    .map((c) => ({ ...c, dist: distPointBox(x, z, c) }))
    .filter((c) => c.dist <= radius)
    .sort((a, b) => a.dist - b.dist);
}

export function whyBlocked(lot) {
  const a = box(lot);
  const hits = [];
  for (const c of claimed) {
    if (c.id === lot.id) continue;
    if (!overlapXZ(a, c)) continue;
    hits.push({ id: c.id, kind: c.kind, layer: c.layer, how: 'overlap' });
  }
  return hits;
}

export function dump() {
  return {
    crs: 'park/CRS.md',
    count: claimed.length,
    lots: claimed.map(({ src, ...c }) => c),
  };
}

export function clearDynamic() {
  for (let i = claimed.length - 1; i >= 0; i--) {
    const id = String(claimed[i].id);
    if (id.startsWith('sketch-') || id.startsWith('tree-dyn-')) claimed.splice(i, 1);
  }
}

export function treeLot(id, x, z, radius) {
  const r = Math.max(1.2, radius || 2);
  return { id, kind: 'tree', layer: 'canopy', x, z, w: r * 2, d: r * 2, pad: 1.5, h: 8 };
}
