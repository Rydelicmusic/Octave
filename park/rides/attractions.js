/** Ride motion on claimed pads. Same ids. No new lots on the spine or hub. */
import { LAND_PALETTE, occupiesSpine, nearRing, LOCK, inStadium, inCanopy } from '../lock.js';
import { claim, whyBlocked, lots } from '../occupy.js';
import { RIDE as board01 } from './ride-board-01.js';
import { RIDE as board02 } from './ride-board-02.js';
import { RIDE as block01 } from './ride-block-01.js';
import { RIDE as block02 } from './ride-block-02.js';
import { RIDE as hours01 } from './ride-hours-01.js';
import { RIDE as hours02 } from './ride-hours-02.js';
import { RIDE as pocket01 } from './ride-pocket-01.js';
import { RIDE as pocket02 } from './ride-pocket-02.js';

const PAD = 1.2;

export const ATTRACTIONS = [
  { ride: block01, type: 'launch' },
  { ride: block02, type: 'coaster' },
  { ride: hours01, type: 'dark' },
  { ride: hours02, type: 'dark' },
  { ride: board01, type: 'wheel' },
  { ride: board02, type: 'swings' },
  { ride: pocket01, type: 'spin' },
  { ride: pocket02, type: 'kiddie' },
];

const motions = [];

export function rideClear(x, z, radius = 0) {
  if (!inStadium(x, z)) return false;
  if (occupiesSpine(x, z, radius)) return false;
  if (Math.hypot(x, z) < LOCK.hubOuter + radius) return false;
  if (nearRing(x, z, 8)) return false;
  return true;
}

export function exitWorld(ride) {
  const yaw = ride.yaw || 0;
  const side = ride.w / 2 + 3.2;
  return {
    x: ride.x + Math.cos(yaw) * side,
    z: ride.z - Math.sin(yaw) * side,
  };
}

function mat(THREE, color, emissive) {
  return new THREE.MeshLambertMaterial({
    color,
    emissive: emissive || 0x000000,
    emissiveIntensity: emissive ? 0.4 : 0,
  });
}

function posts(THREE, parent, z, color) {
  const m = mat(THREE, color);
  for (const x of [-0.7, 0.7]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.3, 0.12), m);
    p.position.set(x, PAD + 0.65, z);
    parent.add(p);
  }
}

function car(THREE, color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 1.5), mat(THREE, color, color));
  body.position.y = 0.45;
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.28, 0.35), mat(THREE, 0xf4efe6));
  nose.position.set(0, 0.55, 0.7);
  g.add(body, nose);
  return g;
}

function exitPhoto(THREE, parent, ride) {
  const at = exitWorld(ride);
  if (!rideClear(at.x, at.z, 0.6) || !inCanopy(at.x, at.z, ride.land)) return null;
  const lot = {
    id: ride.id + '-exit', kind: 'prop', layer: 'prop',
    x: at.x, z: at.z, w: 1.0, d: 0.4, h: 2.2, pad: 0.3,
  };
  if (lots().some((c) => c.id === lot.id)) return null;
  if (whyBlocked(lot).length || !claim(lot)) return null;
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.6, 0.12), mat(THREE, 0x2a241c));
  frame.position.set(ride.w / 2 + 3.2, PAD + 1.1, 0);
  frame.name = lot.id;
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.06), mat(THREE, 0xc9b48a, 0xc9b48a));
  back.position.set(ride.w / 2 + 3.2, PAD + 1.2, 0.08);
  parent.add(frame, back);
  return frame;
}

export function addAttraction(THREE, parent, ride, type) {
  const pal = LAND_PALETTE[ride.land] || LAND_PALETTE.Gate;
  const g = new THREE.Group();
  g.name = ride.id + '-attraction';
  g.position.set(ride.x, 0, ride.z);
  g.rotation.y = ride.yaw || 0;
  const front = ride.d / 2 + 0.85;
  posts(THREE, g, ride.d / 2 + 0.15, pal.trim);
  posts(THREE, g, -ride.d / 2 + 0.2, pal.marquee);
  exitPhoto(THREE, g, ride);

  if (type === 'wheel') {
    const radius = Math.min(3.2, ride.w * 0.42);
    const wheel = new THREE.Group();
    wheel.position.set(0, PAD + ride.h + radius, 0);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.12, 8, 20), mat(THREE, pal.marquee, pal.marquee));
    wheel.add(rim);
    for (let i = 0; i < 6; i++) {
      const cab = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.45), mat(THREE, pal.body));
      const a = (i / 6) * Math.PI * 2;
      cab.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
      wheel.add(cab);
    }
    g.add(wheel);
    motions.push((t) => { wheel.rotation.z = t * 0.0004; });
  } else if (type === 'swings') {
    const arm = new THREE.Group();
    const radius = Math.min(3.4, ride.w * 0.32);
    arm.position.y = PAD + ride.h + 1.8;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 8), mat(THREE, pal.trim));
    arm.add(hub);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const chain = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.4, 0.05), mat(THREE, pal.trim));
      chain.position.set(Math.cos(a) * radius, -0.7, Math.sin(a) * radius);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.4), mat(THREE, pal.marquee, pal.marquee));
      seat.position.set(Math.cos(a) * radius, -1.45, Math.sin(a) * radius);
      arm.add(chain, seat);
    }
    g.add(arm);
    motions.push((t) => { arm.rotation.y = t * 0.0007; });
  } else if (type === 'dark') {
    const ring = new THREE.Group();
    ring.position.y = PAD + 1.6;
    const r = Math.max(ride.w, ride.d) * 0.55;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.3, 0.12), mat(THREE, pal.window, pal.marquee));
      panel.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      panel.rotation.y = -a - Math.PI / 2;
      ring.add(panel);
    }
    const cabin = car(THREE, pal.body);
    cabin.position.set(0, PAD + 0.15, front);
    g.add(ring, cabin);
    motions.push((t) => {
      ring.rotation.y = t * 0.00035;
      cabin.position.z = front + Math.sin(t * 0.0012) * 0.7;
    });
  } else if (type === 'spin' || type === 'kiddie') {
    const radius = type === 'kiddie' ? 0.9 : 1.35;
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.22, 16), mat(THREE, pal.marquee, pal.marquee));
    disc.position.set(0, PAD + 0.2, front);
    const rider = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.35), mat(THREE, pal.body));
    rider.position.y = 0.3;
    disc.add(rider);
    g.add(disc);
    const speed = type === 'kiddie' ? 0.0022 : 0.0011;
    motions.push((t) => { disc.rotation.y = t * speed; });
  } else {
    const cabin = car(THREE, type === 'coaster' ? pal.marquee : pal.body);
    if (type === 'coaster') {
      const y = PAD + ride.h + 0.4;
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, ride.d), mat(THREE, pal.trim));
      rail.position.set(0, y, 0);
      cabin.position.set(0, y, 0);
      g.add(rail, cabin);
      motions.push((t) => {
        cabin.position.z = Math.sin(t * 0.0016) * (ride.d * 0.35);
      });
    } else {
      cabin.position.set(0, PAD + 0.15, front);
      g.add(cabin);
      motions.push((t) => {
        cabin.position.z = front + Math.sin(t * 0.002) * 0.8;
      });
    }
  }

  parent.add(g);
  return g;
}

let looping = false;

function loop(t) {
  for (const fn of motions) fn(t);
  requestAnimationFrame(loop);
}

export function mountAttractions(THREE, scene) {
  if (!scene || scene.getObjectByName('park-attractions')) return null;
  const root = new THREE.Group();
  root.name = 'park-attractions';
  for (const row of ATTRACTIONS) addAttraction(THREE, root, row.ride, row.type);
  scene.add(root);
  if (!looping && motions.length && typeof requestAnimationFrame === 'function') {
    looping = true;
    requestAnimationFrame(loop);
  }
  return root;
}

let armed = false;

export function armAttractions() {
  if (armed || typeof document === 'undefined') return;
  armed = true;
  import('three').then((THREE) => {
    const proto = THREE.WebGLRenderer && THREE.WebGLRenderer.prototype;
    if (!proto || proto.__rydelicAttractions) return;
    const orig = proto.render;
    proto.__rydelicAttractions = true;
    let done = false;
    proto.render = function renderAttractions(scene, camera) {
      if (!done && scene && scene.isScene) {
        done = true;
        try { mountAttractions(THREE, scene); } catch (err) { console.warn('attractions', err); }
      }
      return orig.call(this, scene, camera);
    };
  }).catch(() => {});
}

armAttractions();
