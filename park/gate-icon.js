/** Gate landmark. Anchor (0, +230). Feet stay off the 14 m spine and off the gate wings. */
import { LOCK, LAND_PALETTE, occupiesSpine, nearRing, inStadium } from './lock.js';
import { claim, whyBlocked, lots } from './occupy.js';

const GATE = LOCK.gate;
const PAL = LAND_PALETTE.Gate;

export const GATE_PIERS = [
  { id: 'gate-icon-pier-w', x: -10, z: 216 },
  { id: 'gate-icon-pier-e', x: 10, z: 216 },
];

export const GATE_PROPS = [
  { id: 'gate-icon-map', x: -22, z: 198, w: 1.2, d: 0.45, h: 2.2, label: 'MAP' },
  { id: 'gate-icon-tickets', x: 18, z: 214, w: 1.2, d: 0.7, h: 1.5, label: 'TICKETS' },
];

export function gateClear(x, z, radius = 0) {
  if (!inStadium(x, z)) return false;
  if (occupiesSpine(x, z, radius)) return false;
  if (Math.hypot(x, z) < LOCK.hubOuter + radius) return false;
  if (nearRing(x, z, 8)) return false;
  return true;
}

function canTake(lot, radius) {
  if (!gateClear(lot.x, lot.z, radius)) return false;
  if (lots().some((c) => c.id === lot.id)) return true;
  return whyBlocked(lot).length === 0;
}

function labelMat(THREE, text) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1c1612';
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = '#f4efe6';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);
  return new THREE.MeshLambertMaterial({
    map: new THREE.CanvasTexture(canvas),
    emissive: PAL.marquee,
    emissiveIntensity: 0.35,
  });
}

const spinners = [];
let spinning = false;

function spin(now) {
  for (const mesh of spinners) mesh.rotation.y = now * 0.00045;
  requestAnimationFrame(spin);
}

export function mountGateIcon(THREE, scene) {
  if (!scene || scene.getObjectByName('gate-icon')) return null;
  const pierLots = GATE_PIERS.map((p) => ({
    id: p.id, kind: 'prop', layer: 'prop', x: p.x, z: p.z, w: 0.6, d: 0.6, h: 5.4, pad: 0.35,
  }));
  if (!pierLots.every((lot) => canTake(lot, 0.3))) return null;
  if (!pierLots.every((lot) => claim(lot))) return null;

  const root = new THREE.Group();
  root.name = 'gate-icon';
  root.position.set(GATE.x, 0, GATE.z);

  const postMat = new THREE.MeshLambertMaterial({ color: PAL.trim });
  const beamMat = new THREE.MeshLambertMaterial({ color: PAL.body });
  for (const p of GATE_PIERS) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.55, 5.2, 0.55), postMat);
    post.position.set(p.x - GATE.x, 2.6, p.z - GATE.z);
    post.name = p.id;
    root.add(post);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(20.6, 0.45, 0.7), beamMat);
  beam.position.set(0, 5.05, 216 - GATE.z);
  beam.name = 'gate-icon-beam';
  root.add(beam);

  const face = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 0.9), labelMat(THREE, 'RYDELIC PARK'));
  face.position.set(0, 5.05, 216 - GATE.z + 0.42);
  face.name = 'gate-icon-sign';
  root.add(face);

  // Overhead mark in the wing opening. No ground lot on the spine.
  const crown = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.35, 0),
    new THREE.MeshLambertMaterial({ color: PAL.marquee, emissive: PAL.marquee, emissiveIntensity: 0.55 }),
  );
  crown.position.set(0, 9.2, 0);
  crown.name = 'gate-icon-crown';
  root.add(crown);
  spinners.push(crown);

  for (const prop of GATE_PROPS) {
    const lot = {
      id: prop.id, kind: 'prop', layer: 'prop',
      x: prop.x, z: prop.z, w: prop.w, d: prop.d, h: prop.h, pad: 0.35,
    };
    if (!canTake(lot, Math.max(prop.w, prop.d) / 2) || !claim(lot)) continue;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(prop.w, prop.h, prop.d),
      new THREE.MeshLambertMaterial({ color: PAL.body }),
    );
    body.position.set(prop.x - GATE.x, prop.h / 2, prop.z - GATE.z);
    const blade = new THREE.Mesh(new THREE.PlaneGeometry(prop.w * 0.9, 0.42), labelMat(THREE, prop.label));
    blade.position.set(prop.x - GATE.x, prop.h + 0.15, prop.z - GATE.z + prop.d / 2 + 0.02);
    body.name = prop.id;
    root.add(body, blade);
  }

  scene.add(root);
  if (!spinning && typeof requestAnimationFrame === 'function') {
    spinning = true;
    requestAnimationFrame(spin);
  }
  return root;
}

let armed = false;

export function armGateIcon() {
  if (armed || typeof document === 'undefined') return;
  armed = true;
  import('three').then((THREE) => {
    const proto = THREE.WebGLRenderer && THREE.WebGLRenderer.prototype;
    if (!proto || proto.__rydelicGateIcon) return;
    const orig = proto.render;
    proto.__rydelicGateIcon = true;
    let done = false;
    proto.render = function renderGateIcon(scene, camera) {
      if (!done && scene && scene.isScene) {
        done = true;
        try { mountGateIcon(THREE, scene); } catch (err) { console.warn('gate-icon', err); }
      }
      return orig.call(this, scene, camera);
    };
  }).catch(() => {});
}

armGateIcon();
