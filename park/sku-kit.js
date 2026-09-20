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
  const isStation = p.role === 'station';
  const isGate = p.role === 'gate';
  const qL = isGate ? 2.2 : Math.max(2.2, spec.queueL);
  const qW = Math.max(1.6, spec.queueW);
  const plinth = isStation ? 0.34 : 0.28;
  const bodyH = Math.max(2.45, h - 0.08);
  // Pass 46 — denser station shed body (footprint w/d/h held)
  emit.box({ name: 'body', w, h: bodyH, d, x: 0, y: plinth + bodyH / 2, z: 0, color: pal.body });
  if (isStation) {
    emit.box({ name: 'body', w: w + 0.12, h: 0.22, d: d + 0.12, x: 0, y: plinth + bodyH * 0.55, z: 0, color: pal.trim });
    emit.box({ name: 'body', w: w * 0.92, h: 0.14, d: d * 0.92, x: 0, y: plinth + 0.2, z: 0, color: pal.trim });
  }
  // Pass 51 — mid-block facade articulation (w/d/h held): base, belt, pilasters
  emit.box({
    name: 'body', w: w + 0.08, h: Math.max(0.22, plinth + 0.08), d: d + 0.08,
    x: 0, y: (plinth + 0.08) / 2, z: 0, color: pal.trim,
  });
  const beltY = plinth + bodyH * 0.42;
  emit.box({
    name: 'body', w: w + 0.1, h: 0.16, d: d + 0.1,
    x: 0, y: beltY, z: 0, color: pal.trim,
  });
  if (!isStation && bodyH > 3.2) {
    emit.box({
      name: 'body', w: w + 0.08, h: 0.12, d: d + 0.08,
      x: 0, y: plinth + bodyH * 0.72, z: 0, color: pal.trim,
    });
  }
  // pilaster rhythm on +Z face (and corners on ±X)
  const pilW = Math.min(0.28, w * 0.06);
  const pilD = 0.14;
  const pilH = bodyH * 0.88;
  const pilY = plinth + pilH / 2;
  const pilXs = [-w / 2 + pilW * 0.4, w / 2 - pilW * 0.4];
  if (w >= 5) pilXs.splice(1, 0, 0);
  if (w >= 9) { pilXs.splice(1, 0, -w * 0.25); pilXs.splice(pilXs.length - 1, 0, w * 0.25); }
  for (const sx of pilXs) {
    emit.box({
      name: 'body', w: pilW, h: pilH, d: pilD,
      x: sx, y: pilY, z: d / 2 + pilD * 0.45, color: pal.trim,
    });
  }
  // corner returns on ±X mid
  for (const sx of [-w / 2 - 0.05, w / 2 + 0.05]) {
    emit.box({
      name: 'body', w: pilD, h: pilH * 0.92, d: Math.min(0.32, d * 0.12),
      x: sx, y: pilY, z: 0, color: pal.trim,
    });
  }
  const overD = isStation ? Math.max(1.45, eaves * 2.8) : Math.max(1.15, eaves * 2.4);
  emit.box({ name: 'overhang', w: w + eaves * 2, h: 0.22, d: overD, x: 0, y: plinth + bodyH + 0.11, z: d / 2 + eaves * 0.55, color: pal.trim });
  const roofBoxH = Math.max(0.28, roofH * 0.32);
  emit.box({ name: 'roof', w: w + eaves * (isStation ? 1.15 : 1), h: roofBoxH, d: d + eaves * (isStation ? 1.15 : 1), x: 0, y: plinth + bodyH + 0.22 + roofBoxH / 2, z: 0, color: pal.roof });
  const winH = p.sku === 'kiosk' ? 0.9 : Math.min(1.4, Math.max(1.05, h * 0.22));
  const winY = p.sku === 'kiosk' ? 1.45 : 1.6;
  function emitWindow(wx, wy, ww, wh) {
    emit.box({ name: 'window', w: ww, h: wh, d: 0.14, x: wx, y: wy, z: d / 2 + 0.08, color: pal.window });
    // Pass 51 — muntins
    emit.box({ name: 'window', w: Math.max(0.04, ww * 0.04), h: wh * 0.92, d: 0.16, x: wx, y: wy, z: d / 2 + 0.12, color: pal.trim });
    emit.box({ name: 'window', w: ww * 0.9, h: Math.max(0.04, wh * 0.06), d: 0.16, x: wx, y: wy, z: d / 2 + 0.12, color: pal.trim });
  }
  emitWindow(0, winY, Math.min(2.2, w * 0.42), winH);
  if (w >= 6 || isStation) {
    emitWindow(-w * 0.28, winY, Math.min(1.6, w * 0.2), winH * 0.92);
    emitWindow(w * 0.28, winY, Math.min(1.6, w * 0.2), winH * 0.92);
  }
  // Pass 51 — second-row windows on taller SKUs
  if (!isStation && bodyH >= 4.5) {
    const winY2 = Math.min(plinth + bodyH * 0.72, winY + winH + 0.85);
    emitWindow(0, winY2, Math.min(1.8, w * 0.32), winH * 0.85);
    if (w >= 7) {
      emitWindow(-w * 0.3, winY2, Math.min(1.4, w * 0.18), winH * 0.8);
      emitWindow(w * 0.3, winY2, Math.min(1.4, w * 0.18), winH * 0.8);
    }
  }
  if (isStation) {
    // side windows on ±X faces
    emit.box({ name: 'window', w: 0.14, h: winH * 0.88, d: Math.min(1.5, d * 0.28), x: -w / 2 - 0.08, y: winY, z: 0, color: pal.window });
    emit.box({ name: 'window', w: 0.14, h: winH * 0.88, d: Math.min(1.5, d * 0.28), x: w / 2 + 0.08, y: winY, z: 0, color: pal.window });
    // canopy posts under overhang
    [-w * 0.32, w * 0.32].forEach((sx) => {
      emit.box({ name: 'overhang', w: 0.16, h: bodyH * 0.55, d: 0.16, x: sx, y: plinth + bodyH * 0.28, z: d / 2 + eaves * 0.35, color: pal.trim });
    });
  }
  const marqueeY = Math.min(3.35, plinth + bodyH - 0.5);
  emit.box({ name: 'marquee', w: Math.min(w * 0.72, 8.5), h: 0.78, d: 1.15, x: 0, y: marqueeY, z: d / 2 + 0.72, color: pal.marquee });
  emit.box({ name: 'service', w: 1.1, h: 2.05, d: 0.12, x: w * 0.28, y: 1.05, z: -d / 2 - 0.07, color: pal.door });

  const railH = 1.05;
  if (isStation) {
    // Pass 46 — fold Pass-36 zig queues into kit rails (local +Z in front of shed)
    const n = 10;
    for (let i = 0; i < n; i++) {
      const along = 1.1 + i * 1.2;
      const side = (i % 2 ? 1 : -1) * 1.15;
      const yaw = (i % 2 ? 0.12 : -0.12);
      emit.box({
        name: 'queue', w: 5.2, h: 0.85, d: 0.07,
        x: side, y: 0.48, z: d / 2 + along,
        yaw, color: pal.queue,
      });
      emit.box({
        name: 'queue', w: 0.16, h: railH, d: 0.16,
        x: side, y: railH / 2, z: d / 2 + along,
        color: pal.queue,
      });
    }
  } else {
    emit.box({ name: 'queue', w: 0.05, h: railH, d: qL, x: -qW / 2, y: railH / 2, z: d / 2 + qL / 2, color: pal.queue });
    emit.box({ name: 'queue', w: 0.05, h: railH, d: qL, x: qW / 2, y: railH / 2, z: d / 2 + qL / 2, color: pal.queue });
    const nPost = Math.max(2, Math.round(qL / 1.2) + 1);
    for (let i = 0; i < nPost; i++) {
      const pz = d / 2 + (i / (nPost - 1)) * qL;
      emit.box({ name: 'queue', w: 0.1, h: railH, d: 0.1, x: -qW / 2, y: railH / 2, z: pz, color: pal.queue });
      emit.box({ name: 'queue', w: 0.1, h: railH, d: 0.1, x: qW / 2, y: railH / 2, z: pz, color: pal.queue });
    }
  }
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
    box({ name, w, h, d, x, y, z, yaw = 0, color }) {
      const mat = new THREE.MeshLambertMaterial({
        color,
        emissive: name === 'window' ? color : 0x000000,
        emissiveIntensity: name === 'window' ? 0.18 : 0,
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.name = name;
      mesh.position.set(x, y, z);
      if (yaw) mesh.rotation.y = yaw;
      g.add(mesh);
    },
  });
  g.position.set(p.x, 0, p.z);
  g.rotation.y = p.yaw || 0;
  scene.add(g);
  return g;
}
