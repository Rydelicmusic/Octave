/** Dusk closer. Floats use the 14 m spine as a parade route, then park off it. They are not buildings and they are not claimed lots. */
import { occupiesSpine } from '../lock.js';
import { markShowSeen } from '../memory/visit.js';

export const SHOW_SECONDS = 240;
export const IDLE_SECONDS = 90;

const PARK = [
  { id: 'show-float-1', x: -26, z: 150, hue: 0xc45c26 },
  { id: 'show-float-2', x: 26, z: 118, hue: 0xe0c36a },
  { id: 'show-float-3', x: -26, z: 86, hue: 0x6a8fbf },
  { id: 'show-float-4', x: 26, z: 54, hue: 0xe07a4a },
];

const actors = PARK.map((home) => ({
  id: home.id,
  kind: 'float',
  hue: home.hue,
  x: home.x,
  z: home.z,
  y: 0.4,
}));

let elapsed = 0;
let mode = 'idle';
let seen = false;
let meshSync = null;

export function touchesFog() {
  return false;
}

export function showHomes() {
  return PARK.map((home) => ({ ...home }));
}

export function resetShow() {
  elapsed = 0;
  mode = 'idle';
  seen = false;
  parkActors();
  if (meshSync) meshSync();
  return showSnapshot();
}

function parkActors() {
  for (const actor of actors) {
    const home = PARK.find((row) => row.id === actor.id);
    actor.x = home.x;
    actor.z = home.z;
    actor.y = 0.4;
  }
}

export function spineSamples() {
  const pts = [];
  for (let z = 204; z >= 42; z -= 18) pts.push({ x: 0, y: 2.1, z });
  return pts;
}

function placeOnRoute(t) {
  const route = spineSamples();
  const n = route.length;
  for (let i = 0; i < actors.length; i++) {
    const u = (t / SHOW_SECONDS + i / actors.length) % 1;
    const f = u * (n - 1);
    const i0 = Math.floor(f);
    const i1 = Math.min(n - 1, i0 + 1);
    const k = f - i0;
    const a = route[i0];
    const b = route[i1];
    actors[i].x = a.x + (b.x - a.x) * k;
    actors[i].z = a.z + (b.z - a.z) * k;
    actors[i].y = a.y;
  }
}

export function showSnapshot() {
  return {
    mode,
    elapsed,
    buildings: 0,
    actors: actors.map((actor) => ({
      id: actor.id,
      kind: actor.kind,
      x: actor.x,
      z: actor.z,
      y: actor.y,
      onSpine: occupiesSpine(actor.x, actor.z, 0.5),
    })),
  };
}

export function chaseLights() {
  if (mode !== 'show') return [];
  const route = spineSamples();
  const head = elapsed % SHOW_SECONDS;
  return route.map((point, index) => {
    const along = (index / Math.max(1, route.length - 1)) * SHOW_SECONDS;
    const near = Math.abs(along - head) < 36 || Math.abs(along - head - SHOW_SECONDS) < 36;
    return { x: index % 2 === 0 ? -5 : 5, z: point.z, on: near };
  });
}

export function archHot() {
  if (mode !== 'show') return false;
  return actors.some((actor) => actor.z > 188);
}

/** A float body is thin. The plaza edge stays open, and idle never blocks the road. */
export function showBlocksGuest(x, z) {
  if (mode !== 'show') return false;
  return actors.some((actor) => Math.hypot(actor.x - x, actor.z - z) < 1.5);
}

export function stepSpectacular(dt, part) {
  const step = Math.max(0, Math.min(0.5, dt || 0));
  const showtime = part === 'dusk' || part === 'night' || part === 'show';
  if (!showtime) {
    mode = 'idle';
    elapsed = 0;
    parkActors();
    if (meshSync) meshSync();
    return showSnapshot();
  }
  elapsed += step;
  const cycle = SHOW_SECONDS + IDLE_SECONDS;
  const t = elapsed % cycle;
  if (t < SHOW_SECONDS) {
    mode = 'show';
    placeOnRoute(t);
    if (!seen) {
      seen = true;
      markShowSeen();
    }
  } else {
    mode = 'idle';
    parkActors();
  }
  if (meshSync) meshSync();
  return showSnapshot();
}

export function mountShow(THREE, scene) {
  if (!THREE || !scene || scene.getObjectByName('park-show')) return null;
  const root = new THREE.Group();
  root.name = 'park-show';
  const meshes = [];
  for (const actor of actors) {
    const float = new THREE.Group();
    float.name = actor.id;
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.35, 2.2),
      new THREE.MeshLambertMaterial({ color: actor.hue }),
    );
    deck.position.y = 0.4;
    const mast = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 1.3, 0.12),
      new THREE.MeshLambertMaterial({ color: 0xf4efe6, emissive: actor.hue, emissiveIntensity: 0.4 }),
    );
    mast.position.y = 1.15;
    float.add(deck, mast);
    root.add(float);
    meshes.push(float);
  }
  const lamps = [];
  for (let i = 0; i < spineSamples().length; i++) {
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 6),
      new THREE.MeshLambertMaterial({ color: 0xf4efe6, emissive: 0xffe1b0, emissiveIntensity: 0 }),
    );
    lamp.name = 'show-chase-' + i;
    root.add(lamp);
    lamps.push(lamp);
  }
  scene.add(root);
  meshSync = () => {
    actors.forEach((actor, index) => {
      const mesh = meshes[index];
      if (!mesh) return;
      mesh.position.set(actor.x, actor.y, actor.z);
      mesh.visible = true;
    });
    const lights = chaseLights();
    lamps.forEach((lamp, index) => {
      const light = lights[index];
      if (!light) {
        lamp.visible = false;
        return;
      }
      lamp.visible = mode === 'show';
      lamp.position.set(light.x, 3.2, light.z);
      lamp.material.emissiveIntensity = light.on ? 0.9 : 0.05;
    });
  };
  meshSync();
  return root;
}

export function armShow() {
  if (typeof document === 'undefined') return;
  import('three').then((THREE) => {
    const proto = THREE.WebGLRenderer && THREE.WebGLRenderer.prototype;
    if (!proto || proto.__rydelicShow) return;
    const orig = proto.render;
    proto.__rydelicShow = true;
    let done = false;
    proto.render = function renderShow(scene, camera) {
      if (!done && scene && scene.isScene) {
        done = true;
        try { mountShow(THREE, scene); } catch (err) { console.warn('spectacular', err); }
      }
      return orig.call(this, scene, camera);
    };
  }).catch(() => {});
}
