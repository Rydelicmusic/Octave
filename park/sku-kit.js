/** Callable SKU facade kit. Tests drive collectSkuKit(); the 3D page mounts the same parts. */
import { skuSpec, LAND_PALETTE } from './lock.js';

export const FACADE_PARTS = ['roof', 'overhang', 'window', 'queue', 'marquee', 'service'];

export function paletteFor(p) {
  return LAND_PALETTE[p.land] || LAND_PALETTE.Gate;
}

export function skuKit(p, emit) {
  if (!emit || typeof emit.box !== 'function') throw new Error('skuKit requires emit.box');
  const spec = skuSpec(p);
  const pal = paletteFor(p);
  const w = spec.w, d = spec.d, h = spec.h;
  const eaves = spec.eaves;
  const roofH = spec.roofH;
  const qL = Math.max(2.2, spec.queueL);
  const qW = Math.max(1.6, spec.queueW);
  emit.box({ name: 'body', w, h: h * 0.7, d, x: 0, y: 0.28 + h * 0.35, z: 0, color: pal.body });
  emit.box({ name: 'overhang', w: w + eaves * 2, h: 0.2, d: Math.max(1.15, eaves * 2.4), x: 0, y: 0.28 + h * 0.9, z: d / 2 + eaves * 0.55, color: pal.trim });
  emit.box({ name: 'roof', w: w + eaves, h: Math.max(0.28, roofH * 0.32), d: d + eaves, x: 0, y: 0.28 + h + 0.16 + roofH * 0.28, z: 0, color: pal.roof });
  emit.box({ name: 'window', w: Math.min(2.4, w * 0.45), h: Math.min(1.5, h * 0.32), d: 0.14, x: 0, y: 0.28 + h * 0.5, z: d / 2 + 0.08, color: pal.window });
  if (w >= 6) {
    emit.box({ name: 'window', w: Math.min(1.8, w * 0.22), h: Math.min(1.35, h * 0.28), d: 0.14, x: -w * 0.28, y: 0.28 + h * 0.48, z: d / 2 + 0.08, color: pal.window });
    emit.box({ name: 'window', w: Math.min(1.8, w * 0.22), h: Math.min(1.35, h * 0.28), d: 0.14, x: w * 0.28, y: 0.28 + h * 0.48, z: d / 2 + 0.08, color: pal.window });
  }
  emit.box({ name: 'marquee', w: w * 0.72, h: 0.78, d: 1.15, x: 0, y: 0.28 + h * 0.78, z: d / 2 + 0.72, color: pal.marquee });
  emit.box({ name: 'service', w: 1.1, h: 2.05, d: 0.12, x: w * 0.28, y: 1.05, z: -d / 2 - 0.07, color: pal.door });
  emit.box({ name: 'queue', w: 0.09, h: 0.92, d: qL, x: -qW / 2, y: 0.46, z: d / 2 + qL / 2, color: pal.queue });
  emit.box({ name: 'queue', w: 0.09, h: 0.92, d: qL, x: qW / 2, y: 0.46, z: d / 2 + qL / 2, color: pal.queue });
  return { spec, pal };
}

export function collectSkuKit(p) {
  const parts = [];
  skuKit(p, {
    box(desc) {
      if (!desc || !desc.name) throw new Error('kit part missing name');
      if (!(desc.w > 0) || !(desc.h > 0) || !(desc.d > 0)) throw new Error(`kit part ${desc.name} has no volume`);
      parts.push({ ...desc });
    },
  });
  return parts;
}

export function skuKitReport(p) {
  const pal = paletteFor(p);
  const parts = collectSkuKit(p);
  for (const name of FACADE_PARTS) {
    const hit = parts.find((x) => x.name === name);
    if (!hit) return { ok: false, missing: name, parts };
  }
  const marquee = parts.find((x) => x.name === 'marquee');
  if (marquee.color !== pal.marquee) return { ok: false, missing: 'marquee-color', parts };
  return { ok: true, parts, pal };
}

export function addSkuKit(THREE, scene, p) {
  const g = new THREE.Group();
  skuKit(p, {
    box({ name, w, h, d, x, y, z, color }) {
      const mat = new THREE.MeshLambertMaterial({
        color,
        emissive: name === 'window' ? color : 0x000000,
        emissiveIntensity: name === 'window' ? 0.18 : 0,
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.name = name;
      mesh.position.set(x, y, z);
      g.add(mesh);
    },
  });
  g.position.set(p.x, 0, p.z);
  g.rotation.y = p.yaw || 0;
  scene.add(g);
  return g;
}
