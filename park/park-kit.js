/** Circulation kit. Origin stays hub (0,0). No water. No new ride lots. */
import { LOCK, LAND_PALETTE, occupiesSpine, nearRing, inStadium } from './lock.js';
import { claim, whyBlocked, lots } from './occupy.js';
import { RIDE as board01 } from './rides/ride-board-01.js';
import { RIDE as board02 } from './rides/ride-board-02.js';
import { RIDE as block01 } from './rides/ride-block-01.js';
import { RIDE as block02 } from './rides/ride-block-02.js';
import { RIDE as hours01 } from './rides/ride-hours-01.js';
import { RIDE as hours02 } from './rides/ride-hours-02.js';
import { RIDE as pocket01 } from './rides/ride-pocket-01.js';
import { RIDE as pocket02 } from './rides/ride-pocket-02.js';

export const KIT_LANDS = ['The Block', 'After Hours', 'The Board', 'The Pocket'];

/** Thresholds sit inside each land, off the 14 m spine and outside hub r32. */
export const THRESHOLDS = [
  {
    land: 'The Block',
    span: 'z',
    posts: [
      { id: 'threshold-block-n', x: -52, z: 7.2 },
      { id: 'threshold-block-s', x: -52, z: -7.2 },
    ],
    plaza: { x: -52, z: 0, r: 3.4 },
    lamp: { id: 'kit-lamp-block', x: -64, z: -18 },
    trash: { id: 'kit-trash-block', x: -58, z: -18 },
    edges: [],
  },
  {
    land: 'After Hours',
    span: 'x',
    posts: [
      { id: 'threshold-hours-w', x: -26, z: -74 },
      { id: 'threshold-hours-e', x: -10, z: -74 },
    ],
    plaza: { x: -18, z: -74, r: 3.4 },
    lamp: { id: 'kit-lamp-hours', x: -32, z: -92 },
    trash: { id: 'kit-trash-hours', x: -24, z: -92 },
    edges: [{ id: 'edge-hours-e', x: -12.2, z: -74, w: 0.35, d: 6 }],
  },
  {
    land: 'The Board',
    span: 'z',
    posts: [
      { id: 'threshold-board-n', x: 52, z: 7.2 },
      { id: 'threshold-board-s', x: 52, z: -7.2 },
    ],
    plaza: { x: 52, z: 0, r: 3.4 },
    lamp: { id: 'kit-lamp-board', x: 64, z: -18 },
    trash: { id: 'kit-trash-board', x: 58, z: -18 },
    edges: [],
  },
  {
    land: 'The Pocket',
    span: 'z',
    posts: [
      { id: 'threshold-pocket-n', x: 48, z: 43.2 },
      { id: 'threshold-pocket-s', x: 48, z: 28.8 },
    ],
    plaza: { x: 48, z: 36, r: 3.4 },
    lamp: { id: 'kit-lamp-pocket', x: 66, z: 28 },
    trash: { id: 'kit-trash-pocket', x: 58, z: 28 },
    edges: [
      { id: 'edge-pocket-n', x: 48, z: 42.2, w: 6, d: 0.35 },
      { id: 'edge-pocket-s', x: 48, z: 29.8, w: 6, d: 0.35 },
    ],
  },
];

const RIDES = [board01, board02, block01, block02, hours01, hours02, pocket01, pocket02];
const POST_W = 0.55;

export function kitClear(x, z, radius = 0) {
  if (!inStadium(x, z)) return false;
  if (occupiesSpine(x, z, radius)) return false;
  if (Math.hypot(x, z) < LOCK.hubOuter + radius) return false;
  if (nearRing(x, z, 8)) return false;
  return true;
}

function postLot(p) {
  return {
    id: p.id, kind: 'prop', layer: 'prop',
    x: p.x, z: p.z, w: POST_W, d: POST_W, h: 4.6, pad: 0.35,
  };
}

function propLot(p, h) {
  return {
    id: p.id, kind: 'prop', layer: 'prop',
    x: p.x, z: p.z, w: 0.45, d: 0.45, h, pad: 0.35,
  };
}

function canTake(lot, radius) {
  if (!kitClear(lot.x, lot.z, radius)) return false;
  if (lots().some((c) => c.id === lot.id)) return true;
  return whyBlocked(lot).length === 0;
}

export function queuePose(ride) {
  const queueL = ride.queueL || 4;
  const queueW = ride.queueW || 2.2;
  const front = ride.d / 2 + queueL / 2;
  const yaw = ride.yaw || 0;
  return {
    id: ride.id,
    land: ride.land,
    x: ride.x + Math.sin(yaw) * front,
    z: ride.z + Math.cos(yaw) * front,
    yaw, queueL, queueW,
  };
}

/** Low curb. Claimed as ground path. Skipped when the lot is not clear. */
export function pathEdge(THREE, parent, spec) {
  const lot = {
    id: spec.id, kind: 'path', layer: 'ground',
    x: spec.x, z: spec.z, w: spec.w, d: spec.d, h: 0.16, pad: 0.15,
  };
  if (!canTake(lot, Math.max(spec.w, spec.d) / 2)) return null;
  if (!claim(lot)) return null;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(spec.w, 0.1, spec.d),
    new THREE.MeshLambertMaterial({ color: spec.color || 0xe6d3a4 }),
  );
  mesh.position.set(spec.x, 0.22, spec.z);
  mesh.name = spec.id;
  parent.add(mesh);
  return mesh;
}

/** Pavement medallion painted on an existing land drive. Not a second lot. Not water. */
export function plazaDisk(THREE, parent, spec) {
  if (!kitClear(spec.x, spec.z, 0)) return null;
  const r = Math.min(spec.r || 3.4, 4.0);
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(r, 28),
    new THREE.MeshLambertMaterial({ color: spec.color }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(spec.x, 0.32, spec.z);
  mesh.name = 'plaza-' + spec.land;
  parent.add(mesh);
  return mesh;
}

export function queueSwitchback(THREE, parent, spec) {
  if (!lots().some((c) => c.id === spec.id + '-queue')) return null;
  if (!kitClear(spec.x, spec.z, 0.4)) return null;
  const g = new THREE.Group();
  g.name = spec.id + '-switchback';
  g.position.set(spec.x, 0, spec.z);
  g.rotation.y = spec.yaw || 0;
  const L = spec.queueL;
  const W = Math.min(spec.queueW, 2.4);
  const railH = 1.05;
  const lanes = 3;
  const mat = new THREE.MeshLambertMaterial({ color: spec.color || 0x3d3428 });
  for (let i = 0; i <= lanes; i++) {
    const x = -W / 2 + (W / lanes) * i;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, L * 0.9), mat);
    rail.position.set(x, railH, 0);
    g.add(rail);
    for (const z of [-L * 0.36, 0, L * 0.36]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, railH, 0.07), mat);
      post.position.set(x, railH / 2, z);
      g.add(post);
    }
  }
  for (let i = 0; i < lanes; i++) {
    const x0 = -W / 2 + (W / lanes) * i;
    const x1 = -W / 2 + (W / lanes) * (i + 1);
    const z = i % 2 === 0 ? L * 0.4 : -L * 0.4;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x1 - x0), 0.07, 0.06), mat);
    cap.position.set((x0 + x1) / 2, railH, z);
    g.add(cap);
  }
  parent.add(g);
  return g;
}

export function lampPost(THREE, parent, spec, glow) {
  const lot = propLot(spec, 3.4);
  if (!canTake(lot, 0.4)) return null;
  if (!claim(lot)) return null;
  const g = new THREE.Group();
  g.name = spec.id;
  const pole = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 3.15, 0.12),
    new THREE.MeshLambertMaterial({ color: 0x2a241c }),
  );
  pole.position.set(spec.x, 1.58, spec.z);
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.16, 0.42),
    new THREE.MeshLambertMaterial({ color: 0xffe1b0, emissive: 0xffb060, emissiveIntensity: 0.7 }),
  );
  head.position.set(spec.x, 3.2, spec.z);
  head.userData.phase = spec.x * 0.17 + spec.z * 0.11;
  const light = new THREE.PointLight(0xffe1b0, 0.45, 11);
  light.position.set(spec.x, 3.05, spec.z);
  g.add(pole, head, light);
  parent.add(g);
  if (glow) glow.push(head);
  return g;
}

export function trashPost(THREE, parent, spec) {
  const lot = propLot(spec, 1.1);
  if (!canTake(lot, 0.4)) return null;
  if (!claim(lot)) return null;
  const can = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.85, 0.42),
    new THREE.MeshLambertMaterial({ color: 0x2c2824 }),
  );
  can.position.set(spec.x, 0.48, spec.z);
  can.name = spec.id;
  parent.add(can);
  return can;
}

function signMaterial(THREE, text, hex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#16120e';
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = hex;
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);
  const map = new THREE.CanvasTexture(canvas);
  return new THREE.MeshLambertMaterial({ map, emissive: 0x3a2818, emissiveIntensity: 0.25 });
}

function hexCss(n) {
  return '#' + n.toString(16).padStart(6, '0');
}

/** Land arch. Posts claimed off the drive. Beam is overhead, walk clearance under it. */
export function landArch(THREE, parent, spec) {
  const lotsReady = spec.posts.map(postLot);
  if (!lotsReady.every((lot) => canTake(lot, POST_W / 2))) return null;
  if (!lotsReady.every((lot) => claim(lot))) return null;
  const pal = LAND_PALETTE[spec.land] || LAND_PALETTE.Gate;
  const g = new THREE.Group();
  g.name = 'threshold-' + spec.land;
  const postMat = new THREE.MeshLambertMaterial({ color: pal.trim });
  const beamMat = new THREE.MeshLambertMaterial({ color: pal.body });
  for (const p of spec.posts) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(POST_W, 4.5, POST_W), postMat);
    post.position.set(p.x, 2.25, p.z);
    post.name = p.id;
    g.add(post);
  }
  const a = spec.posts[0];
  const b = spec.posts[1];
  const cx = (a.x + b.x) / 2;
  const cz = (a.z + b.z) / 2;
  const span = Math.hypot(b.x - a.x, b.z - a.z) + POST_W;
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(spec.span === 'x' ? span : 0.7, 0.42, spec.span === 'z' ? span : 0.7),
    beamMat,
  );
  beam.position.set(cx, 4.15, cz);
  beam.name = 'threshold-beam-' + spec.land;
  g.add(beam);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(span * 0.72, 0.7), signMaterial(THREE, spec.land, hexCss(pal.marquee)));
  if (spec.span === 'z') face.rotation.y = spec.land === 'The Block' ? Math.PI / 2 : -Math.PI / 2;
  else face.position.y = 0;
  face.position.set(cx, 4.15, cz);
  if (spec.span === 'x') face.position.z = cz + (spec.land === 'After Hours' ? 0.4 : -0.4);
  else face.position.x = cx + (spec.land === 'The Block' ? 0.4 : -0.4);
  face.name = 'threshold-sign-' + spec.land;
  g.add(face);
  parent.add(g);
  return g;
}

const glowHeads = [];
let glowLoop = false;

function pumpGlow(now) {
  for (const head of glowHeads) {
    const f = 0.45 + 0.55 * Math.abs(Math.sin(now * 0.0025 + (head.userData.phase || 0)));
    head.material.emissiveIntensity = f;
  }
  requestAnimationFrame(pumpGlow);
}

export function mountParkKit(THREE, scene) {
  if (!scene || scene.getObjectByName('park-kit')) return scene && scene.getObjectByName('park-kit');
  const root = new THREE.Group();
  root.name = 'park-kit';
  for (const spec of THRESHOLDS) {
    const pal = LAND_PALETTE[spec.land] || LAND_PALETTE.Gate;
    landArch(THREE, root, spec);
    plazaDisk(THREE, root, { ...spec.plaza, land: spec.land, color: pal.queue });
    lampPost(THREE, root, spec.lamp, glowHeads);
    trashPost(THREE, root, spec.trash);
    for (const edge of spec.edges) pathEdge(THREE, root, { ...edge, color: pal.queue });
  }
  for (const ride of RIDES) {
    const q = queuePose(ride);
    const pal = LAND_PALETTE[q.land] || LAND_PALETTE.Gate;
    queueSwitchback(THREE, root, { ...q, color: pal.trim });
  }
  scene.add(root);
  if (!glowLoop && glowHeads.length && typeof requestAnimationFrame === 'function') {
    glowLoop = true;
    requestAnimationFrame(pumpGlow);
  }
  return root;
}

let armed = false;

export function armParkKit() {
  if (armed || typeof document === 'undefined') return;
  armed = true;
  import('three').then((THREE) => {
    const proto = THREE.WebGLRenderer && THREE.WebGLRenderer.prototype;
    if (!proto || proto.__rydelicParkKit) return;
    const orig = proto.render;
    proto.__rydelicParkKit = true;
    let done = false;
    proto.render = function renderParkKit(scene, camera) {
      if (!done && scene && scene.isScene) {
        done = true;
        try { mountParkKit(THREE, scene); } catch (err) { console.warn('park-kit', err); }
      }
      return orig.call(this, scene, camera);
    };
  }).catch(() => {});
}

armParkKit();
