/** Park operations dressing. Plazas, spine-side parade lights, gate signs. No water. No spine lots. */
import { LOCK, inStadium, occupiesSpine } from '../lock.js';
import { landOk } from './coaster-paths.js';

function lambert(THREE, color, emissive, intensity) {
  return new THREE.MeshLambertMaterial({
    color,
    emissive: emissive || 0x000000,
    emissiveIntensity: intensity || 0,
  });
}

export const CARTS = [
  { id: 'ops-cart-block', land: 'The Block', x: -90, z: 20, label: 'BLOCK BITES' },
  { id: 'ops-cart-hours', land: 'After Hours', x: -70, z: -100, label: 'LAST CALL' },
  { id: 'ops-cart-board', land: 'The Board', x: 120, z: -20, label: 'BOARD FRIES' },
  { id: 'ops-cart-pocket', land: 'The Pocket', x: 84, z: 48, label: 'POCKET SWEETS' },
];

export const GAMES = [
  { id: 'ops-game-block', land: 'The Block', x: -96, z: 28, label: 'RING TOSS' },
  { id: 'ops-game-board', land: 'The Board', x: 128, z: -8, label: 'BALLOON POP' },
  { id: 'ops-game-pocket', land: 'The Pocket', x: 92, z: 56, label: 'BOTTLE STAND' },
];

export const PHOTOS = [
  { id: 'ops-photo-block', land: 'The Block', x: -176, z: 52, label: 'PHOTO' },
  { id: 'ops-photo-board', land: 'The Board', x: 168, z: 28, label: 'PHOTO' },
];

export const SIDING = [
  { x: -168, z: 28, y: 2.2 },
  { x: -158, z: 24, y: 2.2 },
  { x: -150, z: 18, y: 2.2 },
  { x: -146, z: 10, y: 2.2 },
];

export function spineSideOk(x, z) {
  if (!inStadium(x, z)) return false;
  if (occupiesSpine(x, z, 0.35)) return false;
  if (Math.hypot(x, z) < LOCK.hubOuter + 2) return false;
  return Math.abs(x) >= 8.4 && Math.abs(x) <= 11;
}

export function paradePosts() {
  const posts = [];
  for (let z = 40; z <= 200; z += 16) {
    for (const x of [-9.2, 9.2]) {
      if (spineSideOk(x, z)) posts.push({ x, z, y: 4.2 });
    }
  }
  return posts;
}

export function legalProps(list) {
  return list.filter((p) => landOk(p, p.land, 1.2) === '');
}

function box(THREE, parent, w, h, d, x, y, z, color, name) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lambert(THREE, color));
  mesh.position.set(x, y, z);
  if (name) mesh.name = name;
  parent.add(mesh);
  return mesh;
}

function label(THREE, text) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const g = canvas.getContext('2d');
  g.fillStyle = '#1a140e';
  g.fillRect(0, 0, 512, 128);
  g.fillStyle = '#f4efe6';
  g.font = 'bold 48px sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 256, 64);
  return new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(canvas), emissive: 0x3a2818, emissiveIntensity: 0.25 });
}

export function mountParkOps(THREE, scene) {
  if (!THREE || !scene || scene.getObjectByName('park-ops')) return null;
  const root = new THREE.Group();
  root.name = 'park-ops';
  for (const cart of legalProps(CARTS)) {
    box(THREE, root, 2.4, 1.3, 1.4, cart.x, 0.9, cart.z, 0x6a4030, cart.id);
    const shade = box(THREE, root, 3.2, 0.08, 2.2, cart.x, 2.35, cart.z, 0xc45c26, cart.id + '-shade');
    shade.material = lambert(THREE, 0xc45c26, 0x802010, 0.15);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.45), label(THREE, cart.label));
    sign.position.set(cart.x, 2.05, cart.z + 0.8);
    root.add(sign);
    box(THREE, root, 0.45, 0.7, 0.45, cart.x + 1.8, 0.35, cart.z + 1.1, 0x2c2824, cart.id + '-trash');
  }
  for (const game of legalProps(GAMES)) {
    box(THREE, root, 3.4, 2.2, 0.8, game.x, 1.2, game.z, 0x8a4030, game.id);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), label(THREE, game.label));
    sign.position.set(game.x, 2.5, game.z + 0.45);
    root.add(sign);
  }
  for (const photo of legalProps(PHOTOS)) {
    box(THREE, root, 1.4, 2.2, 0.4, photo.x, 1.2, photo.z, 0x241c16, photo.id);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.4), label(THREE, photo.label));
    sign.position.set(photo.x, 2.2, photo.z + 0.24);
    root.add(sign);
  }
  const sidingMat = lambert(THREE, 0xd5dbe3, 0x9aa8b8, 0.3);
  for (let i = 0; i < SIDING.length - 1; i++) {
    const a = SIDING[i];
    const b = SIDING[i + 1];
    if (landOk(a, 'The Block', 1) || landOk(b, 'The Block', 1)) continue;
    const mx = (a.x + b.x) / 2;
    const mz = (a.z + b.z) / 2;
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, len), sidingMat);
    rail.position.set(mx, a.y, mz);
    rail.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
    rail.name = 'ops-siding-' + i;
    root.add(rail);
  }
  const posts = paradePosts();
  if (posts.length) {
    const geo = new THREE.SphereGeometry(0.16, 6, 5);
    const matL = lambert(THREE, 0xffb060, 0xff7a20, 0.85);
    const mesh = new THREE.InstancedMesh(geo, matL, posts.length);
    mesh.name = 'ops-parade';
    const dummy = new THREE.Object3D();
    posts.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    root.add(mesh);
  }
  const gateCopy = [
    { x: -16, z: 206, text: 'MAP' },
    { x: 16, z: 206, text: 'TURNSTILE' },
  ];
  for (const g of gateCopy) {
    if (!spineSideOk(g.x, g.z) && occupiesSpine(g.x, g.z, 0.4)) continue;
    if (occupiesSpine(g.x, g.z, 0.5) || !inStadium(g.x, g.z)) continue;
    box(THREE, root, 0.2, 2.4, 0.2, g.x, 1.2, g.z, 0x3d3428, 'ops-gate-' + g.text);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.55), label(THREE, g.text));
    sign.position.set(g.x, 2.3, g.z + 0.2);
    root.add(sign);
  }
  const waits = [
    { id: 'ride-block-01', x: -176, z: 44, text: 'YOU ARE HERE  12 MIN' },
    { id: 'ride-board-01', x: 160, z: 2, text: 'WHEEL  8 MIN' },
  ];
  for (const w of waits) {
    if (landOk({ x: w.x, z: w.z }, w.x < 0 ? 'The Block' : 'The Board', 1)) continue;
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), label(THREE, w.text));
    sign.position.set(w.x, 2.4, w.z);
    sign.name = 'ops-wait-' + w.id;
    root.add(sign);
  }
  scene.add(root);
  return { carts: legalProps(CARTS).length, games: legalProps(GAMES).length, parade: posts.length };
}
