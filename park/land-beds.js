/** Per-land music-bed hook and emissive trim. No audio files. No rings. No water. */
import { LAND_PALETTE, occupiesSpine, nearRing, LOCK, inStadium, inCanopy } from './lock.js';
import { claim, whyBlocked, lots } from './occupy.js';

export const BEDS = {
  'The Block': { gain: 0.35, trim: { x: -90, z: 20, w: 2.4, d: 0.35 } },
  'After Hours': { gain: 0.3, trim: { x: -70, z: -100, w: 2.4, d: 0.35 } },
  'The Board': { gain: 0.35, trim: { x: 40, z: 20, w: 2.4, d: 0.35 } },
  'The Pocket': { gain: 0.28, trim: { x: 84, z: 48, w: 2.4, d: 0.35 } },
};

export function landBed(land) {
  const row = BEDS[land];
  if (!row) return null;
  return { land, src: null, gain: row.gain, playing: false };
}

/** Stub. No audio file is shipped with this pass. */
export function playLandBed(land) {
  return landBed(land);
}

export function bedClear(x, z, radius = 0) {
  if (!inStadium(x, z)) return false;
  if (occupiesSpine(x, z, radius)) return false;
  if (Math.hypot(x, z) < LOCK.hubOuter + radius) return false;
  if (nearRing(x, z, 8)) return false;
  return true;
}

const pulses = [];
let pulsing = false;

function pulse(now) {
  for (const mesh of pulses) {
    mesh.material.emissiveIntensity = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(now * 0.002 + mesh.userData.phase));
  }
  requestAnimationFrame(pulse);
}

function addTrim(THREE, parent, land, spec) {
  const pal = LAND_PALETTE[land];
  if (!pal) return null;
  const radius = Math.max(spec.w, spec.d) / 2;
  if (!bedClear(spec.x, spec.z, radius) || !inCanopy(spec.x, spec.z, land)) return null;
  const lot = {
    id: 'bed-' + land.toLowerCase().replace(/\s+/g, '-'),
    kind: 'prop', layer: 'prop', land,
    x: spec.x, z: spec.z, w: spec.w, d: spec.d, h: 0.16, pad: 0.15,
  };
  if (lots().some((c) => c.id === lot.id)) return null;
  if (whyBlocked(lot).length || !claim(lot)) return null;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(spec.w, 0.08, spec.d),
    new THREE.MeshLambertMaterial({ color: pal.marquee, emissive: pal.marquee, emissiveIntensity: 0.45 }),
  );
  mesh.position.set(spec.x, 0.2, spec.z);
  mesh.userData.phase = spec.x * 0.04;
  mesh.name = lot.id;
  parent.add(mesh);
  pulses.push(mesh);
  return mesh;
}

export function mountLandBeds(THREE, scene) {
  if (!scene || scene.getObjectByName('land-beds')) return null;
  const root = new THREE.Group();
  root.name = 'land-beds';
  for (const [land, row] of Object.entries(BEDS)) addTrim(THREE, root, land, row.trim);
  scene.add(root);
  if (!pulsing && pulses.length && typeof requestAnimationFrame === 'function') {
    pulsing = true;
    requestAnimationFrame(pulse);
  }
  return root;
}

let armed = false;

export function armLandBeds() {
  if (armed || typeof document === 'undefined') return;
  armed = true;
  import('three').then((THREE) => {
    const proto = THREE.WebGLRenderer && THREE.WebGLRenderer.prototype;
    if (!proto || proto.__rydelicLandBeds) return;
    const orig = proto.render;
    proto.__rydelicLandBeds = true;
    let done = false;
    proto.render = function renderLandBeds(scene, camera) {
      if (!done && scene && scene.isScene) {
        done = true;
        try { mountLandBeds(THREE, scene); } catch (err) { console.warn('land-beds', err); }
      }
      return orig.call(this, scene, camera);
    };
  }).catch(() => {});
}

armLandBeds();
