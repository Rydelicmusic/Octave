/** Exclusive XZ lots. Claim before mesh. Tree and building use the same test. */

const claimed = [];

function box(lot) {
  const pad = lot.pad ?? (lot.kind === 'tree' ? 1.5 : 2);
  const hw = (lot.w ?? 0) / 2 + pad;
  const hd = (lot.d ?? 0) / 2 + pad;
  return {
    id: lot.id,
    kind: lot.kind || 'prop',
    minX: lot.x - hw,
    maxX: lot.x + hw,
    minZ: lot.z - hd,
    maxZ: lot.z + hd,
    src: lot,
  };
}

function overlap(a, b) {
  return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
}

export function fits(lot, extra = []) {
  const a = box(lot);
  for (const c of claimed) if (c.id !== lot.id && overlap(a, c)) return false;
  for (const c of extra) if (overlap(a, box(c))) return false;
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
      kind: 'building',
      x: b.x, z: b.z, w: b.w, d: b.d,
      pad: 2,
      sku: b.sku,
    })) n += 1;
  }
  return n;
}

export function lots() {
  return claimed.slice();
}

export function clearDynamic() {
  for (let i = claimed.length - 1; i >= 0; i--) {
    if (String(claimed[i].id).startsWith('sketch-') || String(claimed[i].id).startsWith('tree-dyn-')) {
      claimed.splice(i, 1);
    }
  }
}

export function treeLot(id, x, z, radius) {
  const r = Math.max(1.2, radius || 2);
  return { id, kind: 'tree', x, z, w: r * 2, d: r * 2, pad: 1.5 };
}
