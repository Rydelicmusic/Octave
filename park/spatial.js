/** 25 m spatial hash (CRS cells) + AABB collision. No extra CDN. */

export const CELL = 25;

export function cellKey(ix, iz) {
  return ix + ',' + iz;
}

export function cellsForBox(b) {
  const x0 = Math.floor(b.minX / CELL);
  const x1 = Math.floor((b.maxX - 1e-6) / CELL);
  const z0 = Math.floor(b.minZ / CELL);
  const z1 = Math.floor((b.maxZ - 1e-6) / CELL);
  const out = [];
  for (let ix = x0; ix <= x1; ix++) for (let iz = z0; iz <= z1; iz++) out.push(cellKey(ix, iz));
  return out;
}

export function aabbOverlap(a, b) {
  return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
}

export function aabbOverlap3(a, b) {
  return aabbOverlap(a, b) && a.y0 < b.y1 && a.y1 > b.y0;
}

export function pointInAABB(x, z, b) {
  return x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ;
}

export function distPointAABB(x, z, b) {
  const cx = Math.max(b.minX, Math.min(x, b.maxX));
  const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
  return Math.hypot(x - cx, z - cz);
}

export function createIndex() {
  const grid = new Map();
  const byId = new Map();

  function insert(lot) {
    if (byId.has(lot.id)) remove(lot.id);
    byId.set(lot.id, lot);
    for (const k of cellsForBox(lot)) {
      if (!grid.has(k)) grid.set(k, new Set());
      grid.get(k).add(lot.id);
    }
  }

  function remove(id) {
    const lot = byId.get(id);
    if (!lot) return;
    for (const k of cellsForBox(lot)) {
      const s = grid.get(k);
      if (s) {
        s.delete(id);
        if (!s.size) grid.delete(k);
      }
    }
    byId.delete(id);
  }

  function queryBox(b) {
    const seen = new Set();
    const hits = [];
    for (const k of cellsForBox(b)) {
      const s = grid.get(k);
      if (!s) continue;
      for (const id of s) {
        if (seen.has(id)) continue;
        seen.add(id);
        const lot = byId.get(id);
        if (lot && aabbOverlap(b, lot)) hits.push(lot);
      }
    }
    return hits;
  }

  function queryPoint(x, z) {
    return queryBox({ minX: x, maxX: x, minZ: z, maxZ: z });
  }

  function queryRadius(x, z, r) {
    return queryBox({ minX: x - r, maxX: x + r, minZ: z - r, maxZ: z + r })
      .map((lot) => ({ lot, dist: distPointAABB(x, z, lot) }))
      .filter((h) => h.dist <= r)
      .sort((a, b) => a.dist - b.dist);
  }

  function all() {
    return [...byId.values()];
  }

  return { insert, remove, queryBox, queryPoint, queryRadius, all, size: () => byId.size };
}
