/** Halloween night skin. No water. Fog object stays so Walk / 3rd / Above keep fog.far. */
import { occupiesSpine, nearRing, LOCK, inStadium, inCanopy } from '../lock.js';
import { claim, whyBlocked, lots } from '../occupy.js';

export const PUMPKINS = [
  { id: 'haunt-pumpkin-block', land: 'The Block', x: -70, z: -36 },
  { id: 'haunt-pumpkin-hours', land: 'After Hours', x: -48, z: -124 },
  { id: 'haunt-pumpkin-board', land: 'The Board', x: 72, z: -48 },
  { id: 'haunt-pumpkin-pocket', land: 'The Pocket', x: 78, z: 44 },
];

export const BATS = [
  { id: 'haunt-bat-block', x: -110, z: 10, r: 6, y: 18 },
  { id: 'haunt-bat-hours', x: -30, z: -130, r: 6, y: 17 },
  { id: 'haunt-bat-board', x: 120, z: 20, r: 6, y: 18 },
  { id: 'haunt-bat-pocket', x: 78, z: 60, r: 5, y: 16 },
];

const NIGHT = 0x161222;
const FOG = 0x2a2438;

export function hauntClear(x, z, radius = 0) {
  if (!inStadium(x, z)) return false;
  if (occupiesSpine(x, z, radius)) return false;
  if (Math.hypot(x, z) < LOCK.hubOuter + radius) return false;
  if (nearRing(x, z, 8)) return false;
  return true;
}

function canTake(lot) {
  if (!hauntClear(lot.x, lot.z, 0.45)) return false;
  if (!inCanopy(lot.x, lot.z, lot.land)) return false;
  if (lots().some((c) => c.id === lot.id)) return true;
  return whyBlocked(lot).length === 0;
}

const bobbers = [];
const flickers = [];
const orbits = [];
let moving = false;

function animate(now) {
  for (const item of bobbers) {
    item.group.position.y = item.base + Math.sin(now * 0.002 + item.phase) * 0.06;
  }
  for (const mesh of flickers) {
    mesh.material.emissiveIntensity = 0.35 + 0.65 * Math.abs(Math.sin(now * 0.006 + mesh.userData.phase));
  }
  for (const bat of orbits) {
    const a = now * 0.00035 + bat.phase;
    bat.mesh.position.set(
      bat.x + Math.cos(a) * bat.r,
      bat.y + Math.sin(now * 0.003 + bat.phase) * 0.7,
      bat.z + Math.sin(a) * bat.r,
    );
    bat.mesh.rotation.y = -a;
    bat.wing.rotation.z = Math.sin(now * 0.01 + bat.phase) * 0.5;
  }
  requestAnimationFrame(animate);
}

function addPumpkin(THREE, parent, spec) {
  const lot = {
    id: spec.id, kind: 'prop', layer: 'prop', land: spec.land,
    x: spec.x, z: spec.z, w: 0.7, d: 0.7, h: 0.8, pad: 0.3,
  };
  if (!canTake(lot) || !claim(lot)) return null;
  const g = new THREE.Group();
  g.position.set(spec.x, 0, spec.z);
  g.name = spec.id;
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 12, 8),
    new THREE.MeshLambertMaterial({ color: 0xe07018, emissive: 0xff6a10, emissiveIntensity: 0.6 }),
  );
  body.scale.set(1.05, 0.82, 1.05);
  body.position.y = 0.4;
  body.userData.phase = spec.x * 0.05;
  const eye = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.1, 0.06),
    new THREE.MeshLambertMaterial({ color: 0x1a1008 }),
  );
  eye.position.set(-0.12, 0.46, 0.32);
  const eye2 = eye.clone();
  eye2.position.x = 0.12;
  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.06, 0.06),
    new THREE.MeshLambertMaterial({ color: 0x1a1008 }),
  );
  mouth.position.set(0, 0.3, 0.32);
  const stem = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.16, 0.08),
    new THREE.MeshLambertMaterial({ color: 0x2a4a28 }),
  );
  stem.position.y = 0.72;
  const glow = new THREE.PointLight(0xff7a20, 0.35, 7);
  glow.position.set(spec.x, 0.6, spec.z);
  g.add(body, eye, eye2, mouth, stem);
  parent.add(g, glow);
  bobbers.push({ group: g, base: 0, phase: spec.z * 0.04 });
  flickers.push(body);
  return g;
}

function addBat(THREE, parent, spec) {
  if (!hauntClear(spec.x, spec.z, spec.r)) return null;
  const g = new THREE.Group();
  g.name = spec.id;
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 8, 6),
    new THREE.MeshLambertMaterial({ color: 0x1a1218 }),
  );
  const wing = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.05, 0.28),
    new THREE.MeshLambertMaterial({ color: 0x241820 }),
  );
  wing.position.y = 0.05;
  g.add(body, wing);
  parent.add(g);
  orbits.push({ mesh: g, wing, ...spec, phase: spec.x * 0.02 });
  return g;
}

export function mountHaunt(THREE, scene) {
  if (!scene || scene.getObjectByName('haunt-scene')) return null;
  scene.background = new THREE.Color(NIGHT);
  if (scene.fog && scene.fog.color) {
    scene.fog.color.setHex(FOG);
    scene.fog.near = 48;
  }
  const root = new THREE.Group();
  root.name = 'haunt-scene';
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(7, 18, 14),
    new THREE.MeshLambertMaterial({ color: 0xf0e2c0, emissive: 0xf4e6c4, emissiveIntensity: 0.85 }),
  );
  moon.position.set(46, 168, -36);
  moon.name = 'haunt-moon';
  root.add(moon);
  orbits.push({
    mesh: moon,
    wing: { rotation: { z: 0 } },
    x: 46, z: -36, r: 10, y: 168, phase: 0.4,
  });
  for (const spec of PUMPKINS) addPumpkin(THREE, root, spec);
  for (const spec of BATS) addBat(THREE, root, spec);
  scene.add(root);
  if (!moving && typeof requestAnimationFrame === 'function') {
    moving = true;
    requestAnimationFrame(animate);
  }
  return root;
}

let armed = false;

export function armHaunt() {
  if (armed || typeof document === 'undefined') return;
  armed = true;
  import('three').then((THREE) => {
    const proto = THREE.WebGLRenderer && THREE.WebGLRenderer.prototype;
    if (!proto || proto.__rydelicHaunt) return;
    const orig = proto.render;
    proto.__rydelicHaunt = true;
    let done = false;
    proto.render = function renderHaunt(scene, camera) {
      if (!done && scene && scene.isScene) {
        done = true;
        try { mountHaunt(THREE, scene); } catch (err) { console.warn('haunt-scene', err); }
      }
      return orig.call(this, scene, camera);
    };
  }).catch(() => {});
}

armHaunt();
