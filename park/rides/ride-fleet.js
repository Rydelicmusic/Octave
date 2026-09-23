/** Wheel, swings, drop tower, spin / bumper orbit. Seats are person scale. */

function lambert(THREE, color, emissive, intensity) {
  return new THREE.MeshLambertMaterial({
    color,
    emissive: emissive || 0x000000,
    emissiveIntensity: intensity || 0,
  });
}

export function buildWheel(THREE, parent, spec) {
  const radius = spec.radius || 14;
  const gondolas = spec.gondolas || 16;
  const g = new THREE.Group();
  g.name = spec.id + '-wheel';
  g.position.set(spec.x, 0, spec.z);
  const hubY = radius + 2.4;
  const standMat = lambert(THREE, 0x4a4038);
  const rimMat = lambert(THREE, 0xe8a040, 0xc47a20, 0.25);
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.45, hubY, 0.45), standMat);
  legL.position.set(-1.4, hubY / 2, -1.1);
  legL.rotation.z = 0.08;
  const legR = legL.clone();
  legR.position.x = 1.4;
  legR.rotation.z = -0.08;
  const axle = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 1.4), lambert(THREE, 0xf4efe6));
  axle.position.y = hubY;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.18, 8, 48), rimMat);
  rim.position.y = hubY;
  const spokeMat = lambert(THREE, 0xd7c4a4);
  const spokeGeo = new THREE.BoxGeometry(0.12, radius, 0.08);
  for (let i = 0; i < 12; i++) {
    const spoke = new THREE.Mesh(spokeGeo, spokeMat);
    spoke.position.y = hubY;
    spoke.rotation.z = (i / 12) * Math.PI;
    g.add(spoke);
  }
  const cars = [];
  const cabMat = lambert(THREE, 0x6a4030, 0xc45c26, 0.12);
  for (let i = 0; i < gondolas; i++) {
    const cab = new THREE.Group();
    cab.name = spec.id + '-gondola-' + i;
    const basket = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.15, 1.15), cabMat);
    basket.position.y = -0.15;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.42, 0.48), lambert(THREE, 0x241810));
    seat.position.set(0, -0.15, 0);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.08, 1.25), lambert(THREE, 0xe8a040, 0xe8a040, 0.2));
    roof.position.y = 0.5;
    cab.add(basket, seat, roof);
    g.add(cab);
    cars.push(cab);
  }
  g.add(legL, legR, axle, rim);
  parent.add(g);
  return { root: g, cars, radius, hubY, gondolas, phase: 0 };
}

export function layoutWheel(state, angle) {
  state.phase = angle;
  for (let i = 0; i < state.cars.length; i++) {
    const a = angle + (i / state.gondolas) * Math.PI * 2;
    const cab = state.cars[i];
    cab.position.set(Math.cos(a) * state.radius, state.hubY + Math.sin(a) * state.radius, 0);
    cab.rotation.set(0, 0, 0);
  }
}

export function buildSwings(THREE, parent, spec) {
  const g = new THREE.Group();
  g.name = spec.id + '-swings';
  g.position.set(spec.x, 0, spec.z);
  const height = spec.height || 18;
  const radius = spec.radius || 8;
  const count = spec.seats || 12;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.8, height, 10), lambert(THREE, 0x6a5840));
  mast.position.y = height / 2;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.45, 12), lambert(THREE, 0xe8a040, 0xc47a20, 0.3));
  cap.position.y = height;
  const arm = new THREE.Group();
  arm.position.y = height - 0.2;
  const chainMat = lambert(THREE, 0xd7dde3);
  const seatMat = lambert(THREE, 0xc45c26, 0x802010, 0.15);
  const seats = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const hanger = new THREE.Group();
    const chain = new THREE.Mesh(new THREE.BoxGeometry(0.06, 6.5, 0.06), chainMat);
    chain.position.y = -3.25;
    const seat = new THREE.Group();
    seat.position.y = -6.5;
    const pan = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.7), seatMat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.1), seatMat);
    back.position.set(0, 0.3, -0.28);
    seat.add(pan, back);
    hanger.add(chain, seat);
    hanger.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    arm.add(hanger);
    seats.push({ hanger, seat, baseR: radius, ang: a });
  }
  g.add(mast, cap, arm);
  parent.add(g);
  return { root: g, arm, seats, height, radius, phase: 0 };
}

export function layoutSwings(state, angle, fly) {
  state.phase = angle;
  state.arm.rotation.y = angle;
  const tilt = fly * 0.55;
  for (const row of state.seats) {
    row.hanger.position.set(Math.cos(row.ang) * (state.radius + fly * 1.4), 0, Math.sin(row.ang) * (state.radius + fly * 1.4));
    row.seat.rotation.z = Math.cos(row.ang) * tilt;
    row.seat.rotation.x = Math.sin(row.ang) * tilt;
  }
}

export function buildDrop(THREE, parent, spec) {
  const g = new THREE.Group();
  g.name = spec.id + '-drop';
  g.position.set(spec.x, 0, spec.z);
  const height = spec.height || 28;
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.8, height, 0.8), lambert(THREE, 0x4a4038));
  mast.position.y = height / 2;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 3.2), lambert(THREE, 0xc4382a, 0x802018, 0.35));
  cap.position.y = height;
  const cab = new THREE.Group();
  cab.name = spec.id + '-cabin';
  const shell = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 2.4), lambert(THREE, 0xc45c26, 0x802010, 0.12));
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.5), lambert(THREE, 0x241810));
  seat.position.set(0, -0.2, 0.2);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.08), lambert(THREE, 0xf4efe6));
  bar.position.set(0, 0.35, 0.55);
  cab.add(shell, seat, bar);
  cab.position.y = 2.2;
  const magnet = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.28, 2.9), lambert(THREE, 0x8aa4b8, 0x9ad7ff, 0.55));
  magnet.position.y = 6.2;
  magnet.name = spec.id + '-magnet';
  const platform = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 6), lambert(THREE, 0xc4b49a));
  platform.position.y = 0.15;
  g.add(mast, cap, cab, magnet, platform);
  parent.add(g);
  return { root: g, cab, height, phase: 0 };
}

export function layoutDrop(state, phase) {
  state.phase = phase;
  if (state.physY != null) {
    state.cab.position.y = state.physY;
    return;
  }
  const climb = phase < 0.55 ? phase / 0.55 : phase < 0.7 ? 1 : Math.max(0, 1 - (phase - 0.7) / 0.12);
  const bounce = phase > 0.82 ? Math.sin((phase - 0.82) * 40) * 0.15 * (1 - phase) : 0;
  state.cab.position.y = 2.2 + climb * (state.height - 4.2) + bounce;
}

export function buildSpin(THREE, parent, spec) {
  const g = new THREE.Group();
  g.name = spec.id + '-spin';
  g.position.set(spec.x, 0, spec.z);
  const radius = spec.radius || 6.5;
  const count = spec.seats || 8;
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.35, 24), lambert(THREE, 0xc4b08a, 0x8a7040, 0.08));
  deck.position.y = 0.35;
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.4, 12), lambert(THREE, 0xe07a4a, 0xc45c26, 0.2));
  hub.position.y = 1.1;
  const cars = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const car = new THREE.Group();
    car.name = spec.id + '-bumper-' + i;
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.7, 1.5), lambert(THREE, i % 2 ? 0xe07a4a : 0x6a8a40, 0x402010, 0.1));
    body.position.y = 0.7;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.5), lambert(THREE, 0x241810));
    seat.position.set(0, 0.85, 0);
    car.add(body, seat);
    car.position.set(Math.cos(a) * (radius - 1.3), 0, Math.sin(a) * (radius - 1.3));
    car.userData.ang = a;
    g.add(car);
    cars.push(car);
  }
  g.add(deck, hub);
  parent.add(g);
  return { root: g, cars, radius, phase: 0 };
}

export function layoutSpin(state, angle, lean) {
  state.phase = angle;
  state.root.rotation.y = angle;
  const tilt = lean || 0;
  for (const car of state.cars) {
    const a = car.userData.ang || 0;
    const r = car.userData.orbitR;
    if (r != null) car.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    car.rotation.z = Math.sin(a + angle) * Math.min(0.35, tilt * 0.15);
  }
}
