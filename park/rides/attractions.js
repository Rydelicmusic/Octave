/** Animated theme-park machines. Pads / ids stay locked. No Math.random x/z. */
export const MOTION = [];
export function motion(fn) {
  MOTION.push(fn);
}
export function tickMotion(t, dt) {
  for (let i = 0; i < MOTION.length; i++) MOTION[i](t, dt);
}

const IRON = 0x1c1612;
const IRON2 = 0x2a2118;
const BONE = 0xe4d6c0;
const PUMP = 0xd35412;
const PUMP2 = 0x7a2e08;
const GOLD = 0xc9a227;
const BLOOD = 0x4a1020;
const GLOW = 0xff7a18;
const TEAL = 0x1a4a4a;
const CREAM = 0xf2e6c8;

function mat(THREE, color, emissive, intensity) {
  return new THREE.MeshLambertMaterial({
    color,
    emissive: emissive || 0x000000,
    emissiveIntensity: intensity || 0,
  });
}

function box(THREE, w, h, d, color, em, ei) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(THREE, color, em, ei));
}

function cyl(THREE, rTop, rBot, h, segs, color, em, ei) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs || 12), mat(THREE, color, em, ei));
}

function queueRails(THREE, g, p) {
  const qL = p.queueL || 4;
  const qW = p.queueW || 2.2;
  const d = p.d || 4;
  const rail = mat(THREE, GOLD, GLOW, 0.12);
  const h = 1.05;
  [-qW / 2, qW / 2].forEach((x) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, qL), rail);
    bar.position.set(x, 0.92, d / 2 + qL / 2);
    g.add(bar);
    const n = Math.max(2, Math.round(qL / 1.1) + 1);
    for (let i = 0; i < n; i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, h, 0.1), rail);
      post.position.set(x, h / 2, d / 2 + (i / (n - 1)) * qL);
      g.add(post);
    }
  });
}

function lantern(THREE, g, x, y, z) {
  const post = cyl(THREE, 0.06, 0.08, 2.2, 8, IRON);
  post.position.set(x, 1.1, z);
  const lamp = box(THREE, 0.28, 0.36, 0.28, PUMP, GLOW, 0.85);
  lamp.position.set(x, 2.28, z);
  g.add(post, lamp);
  motion((t) => {
    const k = 0.55 + 0.45 * Math.abs(Math.sin(t * 6 + x * 0.2 + z * 0.13));
    lamp.material.emissiveIntensity = k;
  });
}

function pumpkin(THREE, g, x, z, s) {
  const body = cyl(THREE, 0.42 * s, 0.38 * s, 0.5 * s, 10, PUMP, GLOW, 0.35);
  body.position.set(x, 0.28 * s, z);
  const stem = cyl(THREE, 0.05 * s, 0.07 * s, 0.18 * s, 6, 0x3d5a20);
  stem.position.set(x, 0.58 * s, z);
  const eyeL = box(THREE, 0.08 * s, 0.08 * s, 0.06 * s, 0x120800, 0xffee88, 0.9);
  eyeL.position.set(x - 0.12 * s, 0.34 * s, z + 0.36 * s);
  const eyeR = eyeL.clone();
  eyeR.position.x = x + 0.12 * s;
  const mouth = box(THREE, 0.2 * s, 0.06 * s, 0.05 * s, 0x120800, 0xffee88, 0.7);
  mouth.position.set(x, 0.2 * s, z + 0.36 * s);
  g.add(body, stem, eyeL, eyeR, mouth);
}

export function addAttraction(THREE, scene, p, type) {
  const g = new THREE.Group();
  g.name = p.id;
  queueRails(THREE, g, p);
  pumpkin(THREE, g, -(p.w || 6) * 0.42, (p.d || 4) * 0.55, 0.9);
  pumpkin(THREE, g, (p.w || 6) * 0.42, (p.d || 4) * 0.55, 0.75);
  lantern(THREE, g, -(p.w || 6) * 0.55, 0, -0.4);
  lantern(THREE, g, (p.w || 6) * 0.55, 0, -0.4);

  if (type === 'teacups') buildTeacups(THREE, g, p);
  else if (type === 'carousel') buildCarousel(THREE, g, p);
  else if (type === 'drop') buildDrop(THREE, g, p);
  else if (type === 'ship') buildShip(THREE, g, p);
  else if (type === 'crypt') buildCrypt(THREE, g, p);
  else if (type === 'hall') buildHall(THREE, g, p);
  else if (type === 'bumpers') buildBumpers(THREE, g, p);
  else if (type === 'wheel') buildWheel(THREE, g, p);
  else buildTeacups(THREE, g, p);

  g.position.set(p.x, 0, p.z);
  g.rotation.y = p.yaw || 0;
  scene.add(g);
  return g;
}

function buildTeacups(THREE, root, p) {
  const plate = cyl(THREE, 2.35, 2.35, 0.18, 24, IRON2, GLOW, 0.08);
  plate.position.y = 0.22;
  root.add(plate);
  const hub = cyl(THREE, 0.28, 0.35, 1.1, 10, GOLD, GLOW, 0.4);
  hub.position.y = 0.8;
  root.add(hub);
  const spin = new THREE.Group();
  spin.position.y = 0.4;
  root.add(spin);
  const colors = [PUMP, BLOOD, TEAL, GOLD, CREAM];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const cup = new THREE.Group();
    const body = cyl(THREE, 0.42, 0.28, 0.42, 12, colors[i], colors[i], 0.18);
    const rim = cyl(THREE, 0.46, 0.46, 0.06, 12, BONE);
    rim.position.y = 0.22;
    const seat = box(THREE, 0.22, 0.08, 0.22, IRON);
    seat.position.y = 0.02;
    cup.add(body, rim, seat);
    cup.position.set(Math.cos(a) * 1.55, 0, Math.sin(a) * 1.55);
    spin.add(cup);
    motion((t) => {
      cup.rotation.y = t * 1.8 + i;
    });
  }
  motion((t) => {
    spin.rotation.y = t * 0.55;
  });
}

function buildCarousel(THREE, root) {
  const floor = cyl(THREE, 4.4, 4.4, 0.22, 28, IRON2);
  floor.position.y = 0.14;
  root.add(floor);
  const pole = cyl(THREE, 0.22, 0.28, 5.2, 12, GOLD, GLOW, 0.35);
  pole.position.y = 2.7;
  root.add(pole);
  const canopy = cyl(THREE, 0.3, 4.6, 0.55, 20, BLOOD, PUMP, 0.25);
  canopy.position.y = 5.15;
  root.add(canopy);
  const cap = cyl(THREE, 0.05, 1.1, 0.7, 12, GOLD, GLOW, 0.5);
  cap.position.y = 5.6;
  root.add(cap);
  const spin = new THREE.Group();
  root.add(spin);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const mount = new THREE.Group();
    const horse = box(THREE, 0.28, 0.55, 0.85, i % 2 ? BONE : CREAM);
    horse.position.y = 1.15;
    const head = box(THREE, 0.18, 0.22, 0.28, i % 2 ? BONE : CREAM);
    head.position.set(0, 1.48, 0.42);
    const poleH = cyl(THREE, 0.04, 0.04, 4.4, 6, GOLD);
    poleH.position.y = 2.3;
    mount.add(horse, head, poleH);
    mount.position.set(Math.cos(a) * 3.15, 0, Math.sin(a) * 3.15);
    mount.rotation.y = -a + Math.PI / 2;
    spin.add(mount);
    motion((t) => {
      mount.position.y = 0.18 * Math.sin(t * 2.4 + i);
    });
  }
  motion((t) => {
    spin.rotation.y = t * 0.42;
    canopy.rotation.y = t * 0.42;
  });
}

function buildDrop(THREE, root) {
  const base = box(THREE, 2.4, 0.4, 2.4, IRON);
  base.position.y = 0.2;
  root.add(base);
  const mast = box(THREE, 0.38, 16.5, 0.38, IRON2, GLOW, 0.12);
  mast.position.y = 8.4;
  root.add(mast);
  const cap = box(THREE, 1.1, 0.35, 1.1, GOLD, GLOW, 0.55);
  cap.position.y = 16.8;
  root.add(cap);
  const cabin = new THREE.Group();
  const body = box(THREE, 1.7, 1.5, 1.7, BLOOD, PUMP, 0.2);
  const rail = box(THREE, 1.85, 0.12, 1.85, GOLD);
  rail.position.y = 0.7;
  cabin.add(body, rail);
  cabin.position.y = 2.2;
  root.add(cabin);
  motion((t) => {
    const cycle = (t % 8) / 8;
    let u;
    if (cycle < 0.45) u = cycle / 0.45;
    else if (cycle < 0.55) u = 1;
    else u = Math.max(0, 1 - (cycle - 0.55) / 0.12);
    cabin.position.y = 2.1 + u * 13.4;
  });
}

function buildShip(THREE, root) {
  const posts = [-2.6, 2.6];
  posts.forEach((x) => {
    const p = box(THREE, 0.28, 6.2, 0.28, IRON);
    p.position.set(x, 3.1, 0);
    root.add(p);
  });
  const axle = box(THREE, 5.6, 0.18, 0.18, GOLD, GLOW, 0.3);
  axle.position.y = 4.4;
  root.add(axle);
  const boom = new THREE.Group();
  boom.position.y = 4.4;
  const hull = box(THREE, 5.4, 1.15, 1.7, 0x5a2a12, PUMP, 0.08);
  hull.position.y = -2.35;
  const bow = box(THREE, 0.7, 0.7, 1.1, PUMP2);
  bow.position.set(2.9, -2.15, 0);
  const stern = box(THREE, 0.55, 1.6, 0.18, IRON);
  stern.position.set(-2.7, -1.6, 0);
  const mast = box(THREE, 0.12, 2.4, 0.12, IRON2);
  mast.position.set(0, -0.7, 0);
  boom.add(hull, bow, stern, mast);
  root.add(boom);
  motion((t) => {
    boom.rotation.z = Math.sin(t * 0.85) * 0.72;
  });
}

function buildCrypt(THREE, root, p) {
  const w = p.w || 6;
  const d = p.d || 4;
  const body = box(THREE, w, 3.4, d, 0x2a1a22, BLOOD, 0.12);
  body.position.y = 1.85;
  const roof = box(THREE, w + 0.5, 0.35, d + 0.5, IRON, GLOW, 0.2);
  roof.position.y = 3.7;
  const peak = box(THREE, w * 0.4, 0.7, 0.35, GOLD, GLOW, 0.45);
  peak.position.set(0, 4.2, d / 2 + 0.1);
  const door = box(THREE, 1.3, 2.1, 0.12, IRON, GLOW, 0.25);
  door.position.set(0, 1.15, d / 2 + 0.08);
  root.add(body, roof, peak, door);
  for (let i = -1; i <= 1; i++) {
    const win = box(THREE, 0.55, 0.8, 0.08, 0x140808, GLOW, 0.7);
    win.position.set(i * 1.55, 2.35, d / 2 + 0.08);
    root.add(win);
    motion((t) => {
      win.material.emissiveIntensity = 0.35 + 0.55 * Math.abs(Math.sin(t * 5 + i));
    });
  }
  const arm = new THREE.Group();
  const blade = box(THREE, 0.12, 1.8, 0.12, IRON2);
  blade.position.y = -0.9;
  arm.add(blade);
  arm.position.set(w * 0.45, 3.3, d / 2 + 0.2);
  root.add(arm);
  motion((t) => {
    arm.rotation.z = Math.sin(t * 1.3) * 0.5;
    door.position.x = Math.sin(t * 0.4) * 0.08;
  });
}

function buildHall(THREE, root, p) {
  const w = p.w || 12;
  const d = p.d || 8;
  const body = box(THREE, w, 5.2, d, 0x24141c, BLOOD, 0.1);
  body.position.y = 2.75;
  const roof = box(THREE, w + 0.8, 0.45, d + 0.8, IRON, PUMP, 0.18);
  roof.position.y = 5.5;
  const tower = box(THREE, 2.2, 3.4, 2.2, 0x1a1014, GLOW, 0.15);
  tower.position.set(-w * 0.28, 7.0, -d * 0.1);
  const spire = cyl(THREE, 0.05, 0.7, 1.6, 8, GOLD, GLOW, 0.5);
  spire.position.set(-w * 0.28, 9.2, -d * 0.1);
  root.add(body, roof, tower, spire);
  const L = box(THREE, 0.7, 2.6, 0.1, IRON2);
  const R = box(THREE, 0.7, 2.6, 0.1, IRON2);
  L.position.set(-0.72, 1.4, d / 2 + 0.08);
  R.position.set(0.72, 1.4, d / 2 + 0.08);
  root.add(L, R);
  motion((t) => {
    const a = (0.55 + 0.45 * Math.sin(t * 0.7)) * 1.15;
    L.rotation.y = a;
    R.rotation.y = -a;
  });
  for (let i = 0; i < 4; i++) {
    const win = box(THREE, 0.7, 1.15, 0.08, 0x3a1008, GLOW, 0.8);
    win.position.set(-w * 0.32 + i * 2.1, 3.4, d / 2 + 0.06);
    root.add(win);
    motion((t) => {
      win.material.emissiveIntensity = 0.4 + 0.6 * Math.abs(Math.sin(t * 3.1 + i * 0.9));
    });
  }
}

function buildBumpers(THREE, root) {
  const floor = cyl(THREE, 2.6, 2.6, 0.16, 24, 0x2a2420);
  floor.position.y = 0.12;
  root.add(floor);
  const wall = new THREE.Mesh(
    new THREE.TorusGeometry(2.55, 0.16, 8, 28),
    mat(THREE, GOLD, GLOW, 0.2),
  );
  wall.rotation.x = Math.PI / 2;
  wall.position.y = 0.38;
  root.add(wall);
  const cars = [];
  const cols = [PUMP, TEAL, BLOOD, CREAM];
  for (let i = 0; i < 4; i++) {
    const car = box(THREE, 0.7, 0.32, 0.95, cols[i], cols[i], 0.2);
    root.add(car);
    cars.push(car);
  }
  motion((t) => {
    for (let i = 0; i < cars.length; i++) {
      const a = t * 0.7 + i * (Math.PI / 2);
      const r = 1.35 + 0.25 * Math.sin(t * 1.4 + i);
      cars[i].position.set(Math.cos(a) * r, 0.38, Math.sin(a) * r);
      cars[i].rotation.y = -a + Math.PI / 2;
    }
  });
}

function buildWheel(THREE, root) {
  const aFrameL = box(THREE, 0.28, 7.2, 0.28, IRON);
  const aFrameR = aFrameL.clone();
  aFrameL.position.set(-1.1, 3.6, 0);
  aFrameR.position.set(1.1, 3.6, 0);
  aFrameL.rotation.z = 0.18;
  aFrameR.rotation.z = -0.18;
  root.add(aFrameL, aFrameR);
  const axle = box(THREE, 2.6, 0.22, 0.22, GOLD, GLOW, 0.4);
  axle.position.y = 6.4;
  root.add(axle);
  const wheel = new THREE.Group();
  wheel.position.y = 6.4;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.1, 8, 36), mat(THREE, GOLD, GLOW, 0.28));
  wheel.add(rim);
  const rim2 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.07, 8, 28), mat(THREE, IRON2));
  wheel.add(rim2);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const spoke = box(THREE, 0.07, 9.2, 0.07, IRON2);
    spoke.rotation.z = a;
    wheel.add(spoke);
    const gond = new THREE.Group();
    const cab = box(THREE, 0.7, 0.55, 0.7, i % 2 ? PUMP : BLOOD, GLOW, 0.22);
    cab.position.y = -0.2;
    gond.add(cab);
    gond.position.set(Math.cos(a) * 4.6, Math.sin(a) * 4.6, 0);
    gond.userData.a0 = a;
    wheel.add(gond);
    motion((t) => {
      const ang = gond.userData.a0 + wheel.rotation.z;
      gond.rotation.z = -wheel.rotation.z;
      gond.position.set(Math.cos(ang) * 4.6, Math.sin(ang) * 4.6, 0);
    });
  }
  root.add(wheel);
  motion((t, dt) => {
    wheel.rotation.z += dt * 0.28;
  });
}
