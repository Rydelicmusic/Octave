/** Halloween overlay — night air, moon, bats, pumpkins, ring-circuit train.
 * Locked XZ. Deterministic props. No water. No hotel. Spine / hub r32 stay clear.
 */
import { occupiesSpine, LOCK } from '../lock.js';
import { motion } from '../rides/attractions.js';

const GLOW = 0xff7a18;
const PUMP = 0xd35412;
const IRON = 0x1c1612;
const BONE = 0xe8d8c0;

function mat(THREE, color, em, ei) {
  return new THREE.MeshLambertMaterial({
    color,
    emissive: em || 0x000000,
    emissiveIntensity: ei || 0,
  });
}

function pumpkin(THREE, x, z, s) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38 * s, 0.34 * s, 0.46 * s, 10), mat(THREE, PUMP, GLOW, 0.4));
  body.position.y = 0.26 * s;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * s, 0.06 * s, 0.16 * s, 6), mat(THREE, 0x3d5a20));
  stem.position.y = 0.54 * s;
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.22 * s, 0.08 * s, 0.05 * s), mat(THREE, 0x120800, 0xffee88, 0.85));
  face.position.set(0, 0.22 * s, 0.34 * s);
  g.add(body, stem, face);
  g.position.set(x, 0, z);
  return g;
}

function bat(THREE) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.22), mat(THREE, 0x0a080c));
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.22), mat(THREE, 0x161018));
  const wingR = wingL.clone();
  wingL.position.x = -0.32;
  wingR.position.x = 0.32;
  g.add(body, wingL, wingR);
  g.userData.wings = [wingL, wingR];
  return g;
}

export function addHauntScene(THREE, scene) {
  scene.background = new THREE.Color(0x07040e);
  scene.fog = new THREE.Fog(0x12081a, 28, 560);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(16, 24, 18),
    new THREE.MeshLambertMaterial({ color: 0xf4e8c4, emissive: 0xf0d9a0, emissiveIntensity: 0.85 }),
  );
  moon.position.set(-120, 150, -210);
  scene.add(moon);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(22, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffc878, transparent: true, opacity: 0.12 }),
  );
  halo.position.copy(moon.position);
  scene.add(halo);

  const moonLight = new THREE.DirectionalLight(0xc8b8ff, 0.55);
  moonLight.position.set(-90, 160, -160);
  scene.add(moonLight);
  scene.add(new THREE.AmbientLight(0x2a1828, 0.55));

  const fill = new THREE.PointLight(0xff7a18, 1.6, 90, 2);
  fill.position.set(0, 8, 210);
  scene.add(fill);

  const gateArch = new THREE.Group();
  const colL = new THREE.Mesh(new THREE.BoxGeometry(1.1, 7.2, 1.1), mat(THREE, IRON, GLOW, 0.12));
  const colR = colL.clone();
  colL.position.set(-8, 3.6, 226);
  colR.position.set(8, 3.6, 226);
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(18, 1.1, 1.2), mat(THREE, 0x3a2010, GLOW, 0.25));
  lintel.position.set(0, 7.4, 226);
  const banner = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.4, 0.2), mat(THREE, 0x4a1020, GLOW, 0.55));
  banner.position.set(0, 6.5, 225.3);
  gateArch.add(colL, colR, lintel, banner);
  scene.add(gateArch);

  const pumpkins = [
    [-18, 218, 1.1], [18, 218, 1.1], [-30, 200, 0.9], [30, 200, 0.9],
    [-42, 188, 0.8], [42, 188, 0.8], [-14, 175, 0.7], [14, 175, 0.7],
    [-160, 8, 1.0], [-160, 28, 0.85], [-200, 8, 0.9],
    [160, -8, 1.0], [160, 28, 0.85], [200, 8, 0.9],
    [-20, -160, 1.05], [20, -150, 0.9], [-48, -150, 0.8],
    [24, 96, 0.9], [-24, 110, 0.85], [55, 40, 0.7],
  ];
  pumpkins.forEach(([x, z, s]) => {
    if (occupiesSpine(x, z, 1.2)) return;
    if (Math.hypot(x, z) < (LOCK.hubOuter || 32) + 2) return;
    scene.add(pumpkin(THREE, x, z, s));
  });

  const bats = [];
  for (let i = 0; i < 14; i++) {
    const b = bat(THREE);
    scene.add(b);
    bats.push({ mesh: b, i });
  }
  motion((t) => {
    bats.forEach(({ mesh, i }) => {
      const lane = 40 + (i % 5) * 18;
      const a = t * (0.35 + (i % 3) * 0.08) + i * 0.7;
      mesh.position.set(Math.cos(a) * lane, 14 + 6 * Math.sin(t * 1.3 + i), Math.sin(a * 0.85) * 70 - 10);
      mesh.rotation.y = -a + Math.PI / 2;
      const flap = Math.sin(t * 14 + i) * 0.55;
      mesh.userData.wings[0].rotation.z = flap;
      mesh.userData.wings[1].rotation.z = -flap;
    });
  });

  addRingCircuit(THREE, scene);
  addScareLanterns(THREE, scene);
  return { moon };
}

function addScareLanterns(THREE, scene) {
  const spots = [
    [-90, 0], [90, 0], [0, -90], [0, 90],
    [-165, -10], [160, 10], [10, -140], [0, 120],
    [-120, 40], [120, -30], [-70, -120], [70, 70],
  ];
  spots.forEach(([x, z], i) => {
    if (occupiesSpine(x, z, 1.4)) return;
    if (Math.hypot(x, z) < 34) return;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.1, 8), mat(THREE, IRON));
    post.position.set(x, 1.55, z);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.4, 0.34), mat(THREE, PUMP, GLOW, 0.8));
    lamp.position.set(x, 3.2, z);
    scene.add(post, lamp);
    motion((t) => {
      lamp.material.emissiveIntensity = 0.45 + 0.55 * Math.abs(Math.sin(t * 4.2 + i));
    });
  });
}

function addRingCircuit(THREE, scene) {
  const path = [];
  const A = { x: 95, z: 95, r: 17 };
  const B = { x: 118, z: 108, r: 8.5 };
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    path.push([A.x + Math.cos(a) * A.r, 2.4 + Math.sin(a * 2) * 0.6, A.z + Math.sin(a) * A.r]);
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + Math.PI;
    path.push([B.x + Math.cos(a) * B.r, 3.1 + Math.sin(a * 2) * 0.4, B.z + Math.sin(a) * B.r]);
  }
  const trackMat = mat(THREE, 0x3a2a18, GLOW, 0.15);
  for (let i = 0; i < path.length; i++) {
    const n = path[(i + 1) % path.length];
    const p = path[i];
    const dx = n[0] - p[0], dz = n[2] - p[2];
    const len = Math.hypot(dx, dz) || 1;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, len), trackMat);
    rail.position.set((p[0] + n[0]) / 2, (p[1] + n[1]) / 2, (p[2] + n[2]) / 2);
    rail.rotation.y = Math.atan2(dx, dz);
    scene.add(rail);
  }
  const train = new THREE.Group();
  for (let c = 0; c < 4; c++) {
    const car = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 1.15), mat(THREE, c ? 0x4a1020 : PUMP, GLOW, 0.35));
    car.position.z = -c * 1.35;
    train.add(car);
  }
  scene.add(train);
  motion((t) => {
    const u = (t * 0.22) % 1;
    const idx = u * path.length;
    const i0 = Math.floor(idx) % path.length;
    const i1 = (i0 + 1) % path.length;
    const f = idx - Math.floor(idx);
    const a = path[i0], b = path[i1];
    train.position.set(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f + 0.35, a[2] + (b[2] - a[2]) * f);
    train.rotation.y = Math.atan2(b[0] - a[0], b[2] - a[2]);
  });
}
