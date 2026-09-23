/** Rails, ties, supports, trim lights, tunnels, brakes. Heartline samples are world-space. */
import { frameFromTangent, pointAt } from './path-math.js';
import { sampleHeight, supportSpan } from '../terrain/height.js';
import { seatRiders } from '../alive/bots.js';

function mat(THREE, color, emissive, intensity) {
  return new THREE.MeshLambertMaterial({
    color,
    emissive: emissive || 0x000000,
    emissiveIntensity: intensity || 0,
  });
}

function basisMatrix(THREE, frame, position) {
  const m = new THREE.Matrix4();
  m.makeBasis(
    new THREE.Vector3(frame.right.x, frame.right.y, frame.right.z),
    new THREE.Vector3(frame.up.x, frame.up.y, frame.up.z),
    new THREE.Vector3(frame.forward.x, frame.forward.y, frame.forward.z),
  );
  m.setPosition(position.x, position.y, position.z);
  return m;
}

function poseAt(table, s) {
  const p = pointAt(table, s);
  const ahead = pointAt(table, s + 0.75);
  const frame = frameFromTangent(
    { x: ahead.x - p.x, y: ahead.y - p.y, z: ahead.z - p.z },
    p.bank || 0,
  );
  return { p, ...frame };
}

export function buildTrack(THREE, parent, table, opts) {
  const samples = table.samples;
  const n = samples.length;
  const gauge = opts.gauge || 1.05;
  const railMat = mat(THREE, opts.rail || 0xf4f7fb, opts.railEmissive || 0xb7c4d4, 0.45);
  const tieMat = mat(THREE, opts.tie || 0x6a5038);
  const spineMat = mat(THREE, opts.spine || 0x8d939c);
  const supportMat = mat(THREE, opts.support || 0x4a4038, opts.supportEmissive || 0, opts.supportGlow || 0);
  const lightMat = mat(THREE, opts.lamp || 0xffb060, opts.lamp || 0xff7a20, 0.9);
  const brakeMat = mat(THREE, 0xc4382a, 0x802018, 0.35);
  const chainMat = mat(THREE, 0xf0c040, 0xc48a10, 0.25);

  const railBulk = opts.railBulk || 1;
  const postBulk = opts.postBulk || 1;
  const railGeo = new THREE.BoxGeometry(0.22 * railBulk, 0.18 * railBulk, 1);
  const tieGeo = new THREE.BoxGeometry(gauge * 2 + 0.35, 0.08, 0.18);
  const supportGeo = new THREE.BoxGeometry(1, 1, 1);
  const lightGeo = new THREE.SphereGeometry(0.09, 6, 5);
  const chainGeo = new THREE.BoxGeometry(0.08, 0.08, 0.35);
  const dogGeo = new THREE.BoxGeometry(0.16, 0.22, 0.12);
  const brakeGeo = new THREE.BoxGeometry(0.22, 0.28, 0.55);
  const dogMat = mat(THREE, 0xd7c4a4, 0xc9b48a, 0.15);

  const railL = new THREE.InstancedMesh(railGeo, railMat, n);
  const railR = new THREE.InstancedMesh(railGeo, railMat, n);
  const beam = opts.ribbon
    ? new THREE.InstancedMesh(new THREE.BoxGeometry(1.15, 0.55, 1), mat(THREE, 0xf4efe6, 0xffe1b8, 0.75), n)
    : null;
  const boneMat = opts.ribbon ? mat(THREE, opts.spine == null ? 0xf4efe6 : opts.spine, opts.spineEmissive == null ? 0xffe1b8 : opts.spineEmissive, opts.spineGlow == null ? 0.75 : opts.spineGlow) : null;
  const bonePost = opts.ribbon ? mat(THREE, opts.support || 0xf3efe6, opts.supportEmissive || 0xffe1b0, opts.supportGlow || 0.85) : null;
  const spineWide = opts.spineWide || 1.35;
  const spineHigh = opts.spineHigh || 0.85;
  const postWide = opts.postWide || 0.85;
  const wantLsm = samples.some((p) => p.lsm);
  const lsmMat = wantLsm ? mat(THREE, 0x140814, 0xff3ec8, 1.15) : null;
  const lsmArch = wantLsm ? mat(THREE, 0x2a1840, 0x6a3cff, 0.55) : null;
  const planted = [];
  if (beam) beam.name = (opts.name || 'track') + '-ribbon';
  const ties = new THREE.InstancedMesh(tieGeo, tieMat, n);
  const lights = new THREE.InstancedMesh(lightGeo, lightMat, n);
  let supportCount = 0;
  let chainCount = 0;
  let brakeCount = 0;
  for (let i = 0; i < n; i++) {
    if (samples[i].y > 2.4) supportCount++;
    if (samples[i].lift) chainCount++;
    if (samples[i].brake) brakeCount++;
  }
  const supports = supportCount ? new THREE.InstancedMesh(supportGeo, supportMat, supportCount) : null;
  const chains = chainCount ? new THREE.InstancedMesh(chainGeo, chainMat, chainCount) : null;
  const dogs = chainCount ? new THREE.InstancedMesh(dogGeo, dogMat, chainCount) : null;
  const brakes = brakeCount ? new THREE.InstancedMesh(brakeGeo, brakeMat, brakeCount) : null;
  if (chains) chains.name = (opts.name || 'track') + '-chain';
  if (dogs) dogs.name = (opts.name || 'track') + '-dogs';
  if (brakes) brakes.name = (opts.name || 'track') + '-brakes';
  railL.name = (opts.name || 'track') + '-rail-l';
  railR.name = (opts.name || 'track') + '-rail-r';

  const dummy = new THREE.Object3D();
  let si = 0;
  let ci = 0;
  let di = 0;
  let bi = 0;
  let prevRight = null;
  for (let i = 0; i < n; i++) {
    const p = samples[i];
    const q = samples[(i + 1) % n];
    const span = Math.max(0.4, Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z));
    const frame = frameFromTangent(
      { x: q.x - p.x, y: q.y - p.y, z: q.z - p.z },
      p.bank || 0,
      prevRight,
    );
    prevRight = frame.right;
    const heart = new THREE.Vector3(p.x, p.y, p.z);
    const right = new THREE.Vector3(frame.right.x, frame.right.y, frame.right.z);
    const up = new THREE.Vector3(frame.up.x, frame.up.y, frame.up.z);
    const fwd = new THREE.Vector3(frame.forward.x, frame.forward.y, frame.forward.z);

    for (const [mesh, side] of [[railL, -1], [railR, 1]]) {
      const pos = heart.clone().addScaledVector(right, side * gauge).addScaledVector(up, -0.28);
      dummy.position.copy(pos);
      dummy.scale.set(1, 1, span * 1.08);
      dummy.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, fwd));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    if (beam) {
      dummy.position.copy(heart.clone().addScaledVector(up, -0.85));
      dummy.scale.set(1, 1, span * 1.05);
      dummy.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, fwd));
      dummy.updateMatrix();
      beam.setMatrixAt(i, dummy.matrix);
      if (i % 2 === 0) {
        const chunk = new THREE.Mesh(new THREE.BoxGeometry(spineWide, spineHigh, Math.max(span, 0.8)), boneMat);
        chunk.position.copy(heart);
        chunk.quaternion.copy(dummy.quaternion);
        chunk.frustumCulled = false;
        chunk.userData.hubKeep = true;
        chunk.userData.dryKeep = true;
        chunk.userData.waterKeep = true;
        chunk.userData.tidyKeep = true;
        chunk.name = (opts.name || 'track') + '-bone';
        planted.push(chunk);
        if (p.y > 3.2) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(postWide, p.y, postWide), bonePost);
          post.position.set(p.x, p.y / 2, p.z);
          post.frustumCulled = false;
          post.userData.hubKeep = true;
          post.userData.dryKeep = true;
          post.userData.waterKeep = true;
          post.userData.tidyKeep = true;
          post.name = (opts.name || 'track') + '-post';
          planted.push(post);
        }
      }
    }
    if (p.lsm && lsmMat && i % 2 === 0) {
      dummy.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, fwd));
      const plate = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.07, Math.max(span, 0.65)), lsmMat);
      plate.position.copy(heart.clone().addScaledVector(up, -0.58));
      plate.quaternion.copy(dummy.quaternion);
      plate.frustumCulled = false;
      plate.userData.hubKeep = true;
      plate.userData.dryKeep = true;
      plate.userData.tidyKeep = true;
      plate.name = (opts.name || 'track') + '-lsm';
      planted.push(plate);
      if (i % 4 === 0 && lsmArch) {
        for (const side of [-1, 1]) {
          const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.4), lsmMat);
          fin.position.copy(heart.clone().addScaledVector(right, side * (gauge + 0.42)).addScaledVector(up, 0.2));
          fin.quaternion.copy(dummy.quaternion);
          fin.frustumCulled = false;
          fin.userData.hubKeep = true;
          fin.userData.dryKeep = true;
          fin.userData.tidyKeep = true;
          fin.name = (opts.name || 'track') + '-stator';
          planted.push(fin);
        }
        const bar = new THREE.Mesh(new THREE.BoxGeometry(gauge * 2 + 1.5, 0.14, 0.16), lsmArch);
        bar.position.copy(heart.clone().addScaledVector(up, 2.5));
        bar.quaternion.copy(dummy.quaternion);
        bar.frustumCulled = false;
        bar.userData.hubKeep = true;
        bar.userData.dryKeep = true;
        bar.userData.tidyKeep = true;
        bar.name = (opts.name || 'track') + '-truss';
        planted.push(bar);
      }
    }

    dummy.position.copy(heart.clone().addScaledVector(up, -0.38));
    dummy.scale.set(1, 1, 1);
    dummy.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, fwd));
    dummy.updateMatrix();
    ties.setMatrixAt(i, dummy.matrix);

    const lampPos = heart.clone().addScaledVector(right, gauge + 0.15).addScaledVector(up, 0.05);
    dummy.position.copy(lampPos);
    dummy.scale.set(1, 1, 1);
    dummy.quaternion.identity();
    dummy.updateMatrix();
    lights.setMatrixAt(i, dummy.matrix);

    if (supports && p.y > 2.4) {
      const span = supportSpan(p.y, sampleHeight(p.x, p.z));
      dummy.position.set(p.x, span.foot + span.height / 2, p.z);
      dummy.scale.set(0.62 * postBulk, span.height, 0.62 * postBulk);
      dummy.quaternion.identity();
      dummy.updateMatrix();
      supports.setMatrixAt(si++, dummy.matrix);
    }
    if (chains && p.lift) {
      dummy.position.copy(heart.clone().addScaledVector(up, -0.18));
      dummy.scale.set(1, 1, 1);
      dummy.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, fwd));
      dummy.updateMatrix();
      chains.setMatrixAt(ci++, dummy.matrix);
      if (dogs) {
        dummy.position.copy(heart.clone().addScaledVector(up, -0.02).addScaledVector(right, 0.22));
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        dogs.setMatrixAt(di++, dummy.matrix);
      }
    }
    if (brakes && p.brake) {
      dummy.position.copy(heart.clone().addScaledVector(up, -0.15).addScaledVector(right, gauge * 0.4));
      dummy.scale.set(1, 1, 1);
      dummy.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, fwd));
      dummy.updateMatrix();
      brakes.setMatrixAt(bi++, dummy.matrix);
    }
  }
  railL.instanceMatrix.needsUpdate = true;
  railR.instanceMatrix.needsUpdate = true;
  ties.instanceMatrix.needsUpdate = true;
  lights.instanceMatrix.needsUpdate = true;
  if (supports) supports.instanceMatrix.needsUpdate = true;
  if (chains) chains.instanceMatrix.needsUpdate = true;
  if (dogs) dogs.instanceMatrix.needsUpdate = true;
  if (brakes) brakes.instanceMatrix.needsUpdate = true;
  for (const mesh of [railL, railR, ties, lights, beam, supports, chains, dogs, brakes]) {
    if (!mesh) continue;
    mesh.frustumCulled = false;
    mesh.userData.hubKeep = true;
    mesh.userData.dryKeep = true;
    mesh.userData.waterKeep = true;
    mesh.userData.tidyKeep = true;
  }
  parent.add(railL, railR, ties, lights);
  if (planted.length) parent.add(...planted);
  if (beam) {
    beam.instanceMatrix.needsUpdate = true;
    parent.add(beam);
  }
  if (supports) parent.add(supports);
  if (chains) parent.add(chains);
  if (dogs) parent.add(dogs);
  if (brakes) parent.add(brakes);

  let tunnel = 0;
  for (let i = 0; i < n; i++) if (samples[i].tunnel) tunnel++;
  if (tunnel > 8) {
    const shellMat = new THREE.MeshLambertMaterial({ color: opts.tunnel || 0x2a241c, side: THREE.DoubleSide });
    const shell = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.6, 1), shellMat);
    const shellMesh = new THREE.InstancedMesh(shell.geometry, shellMat, tunnel);
    let ti = 0;
    prevRight = null;
    for (let i = 0; i < n; i++) {
      if (!samples[i].tunnel) continue;
      const p = samples[i];
      const q = samples[(i + 1) % n];
      const frame = frameFromTangent({ x: q.x - p.x, y: q.y - p.y, z: q.z - p.z }, p.bank || 0, prevRight);
      prevRight = frame.right;
      const span = Math.max(0.5, Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z));
      dummy.position.set(p.x, p.y + 0.7, p.z);
      dummy.scale.set(1, 1, span);
      dummy.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(
        new THREE.Vector3(frame.right.x, frame.right.y, frame.right.z),
        new THREE.Vector3(frame.up.x, frame.up.y, frame.up.z),
        new THREE.Vector3(frame.forward.x, frame.forward.y, frame.forward.z),
      ));
      dummy.updateMatrix();
      shellMesh.setMatrixAt(ti++, dummy.matrix);
    }
    shellMesh.instanceMatrix.needsUpdate = true;
    shellMesh.name = (opts.name || 'track') + '-tunnel';
    parent.add(shellMesh);
  }

  const glowEvery = Math.max(8, Math.floor(n / 18));
  for (let i = 0; i < n; i += glowEvery) {
    const p = samples[i];
    const light = new THREE.PointLight(opts.lamp || 0xffb060, 0.35, 9);
    light.position.set(p.x, p.y + 0.4, p.z);
    parent.add(light);
  }
  return { poseAt: (s) => poseAt(table, s), chains, brakes, dogs, lamps: lights, chainMat, brakeMat };
}

/** Lead car is `${id}-car`. Following cars are `${id}-car-1`, and so on. */
export function carName(id, index) {
  const base = id || 'car';
  return index ? base + '-car-' + index : base + '-car';
}

export function buildTrain(THREE, parent, count, colors, id) {
  const cars = [];
  const bodyMat = mat(THREE, colors.body || 0xc45c26, colors.body || 0x802010, 0.15);
  const seatMat = mat(THREE, 0x241810);
  const barMat = mat(THREE, 0xf2efe6, 0xc9b48a, 0.2);
  for (let i = 0; i < count; i++) {
    const car = new THREE.Group();
    car.name = carName(id, i);
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.42, 2.15), bodyMat);
    chassis.position.y = -0.35;
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.28, 0.35), barMat);
    nose.position.set(0, -0.15, 1.05);
    const seatL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.48), seatMat);
    seatL.position.set(-0.28, -0.05, 0.15);
    const seatR = seatL.clone();
    seatR.position.x = 0.28;
    const backL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.62, 0.12), seatMat);
    backL.position.set(-0.28, 0.22, -0.12);
    const backR = backL.clone();
    backR.position.x = 0.28;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.08), barMat);
    bar.position.set(0, 0.32, 0.35);
    bar.name = 'restraint';
    const wheelGeo = new THREE.BoxGeometry(0.18, 0.22, 0.22);
    const wheelMat = mat(THREE, 0x1a1a1c);
    for (const [x, z] of [[-0.55, 0.7], [0.55, 0.7], [-0.55, -0.7], [0.55, -0.7]]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(x, -0.58, z);
      car.add(w);
    }
    car.add(chassis, nose, seatL, seatR, backL, backR, bar);
    car.userData.bots = seatRiders(THREE, car, [
      { x: -0.22, y: 0.12, z: 0.05 },
      { x: 0.22, y: 0.12, z: 0.05 },
    ]);
    parent.add(car);
    cars.push(car);
  }
  return cars;
}

/** Short hybrid train. Two seats, tall lap bar. Lead is `${id}-car`. */
export function buildHybridTrain(THREE, parent, count, colors, id) {
  const cars = [];
  const n = count || 2;
  const bodyMat = mat(THREE, colors.body || 0x2a2420, 0x4a3020, 0.2);
  const seatMat = mat(THREE, 0x1a1410);
  const steel = mat(THREE, 0xd5dce4, 0x9aa3ac, 0.25);
  const barMat = mat(THREE, 0xf2efe6, 0xc9b48a, 0.15);
  const wheelMat = mat(THREE, 0x141414);
  for (let i = 0; i < n; i++) {
    const car = new THREE.Group();
    car.name = carName(id, i);
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.22, 1.7), bodyMat);
    chassis.position.y = -0.28;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 1.45), steel);
    rail.position.y = -0.12;
    const nose = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.28, 0.22), steel);
    nose.position.set(0, -0.05, 0.86);
    const seats = [];
    const riders = [];
    for (let s = 0; s < 2; s++) {
      const x = s === 0 ? -0.28 : 0.28;
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.36), seatMat);
      seat.position.set(x, -0.02, 0);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.55, 0.08), seatMat);
      back.position.set(x, 0.28, -0.18);
      seats.push(seat, back);
      riders.push({ x, y: 0.08, z: 0 });
    }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.08, 0.08), barMat);
    bar.position.set(0, 0.22, 0.32);
    bar.name = 'restraint';
    const wheelGeo = new THREE.BoxGeometry(0.16, 0.18, 0.18);
    const wheels = [];
    for (const [x, z] of [[-0.55, 0.5], [0.55, 0.5], [-0.55, -0.5], [0.55, -0.5]]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(x, -0.42, z);
      wheels.push(w);
    }
    car.add(chassis, rail, nose, bar, ...seats, ...wheels);
    car.userData.bots = seatRiders(THREE, car, riders);
    parent.add(car);
    cars.push(car);
  }
  return cars;
}

/** Low Intamin-style row. Two seats across, three cars. Lead is `${id}-car`. */
export function buildLaunchTrain(THREE, parent, count, colors, id) {
  const cars = [];
  const n = count || 3;
  const bodyMat = mat(THREE, colors.body || 0x1a1020, 0x5a2080, 0.35);
  const seatMat = mat(THREE, 0x120810);
  const neon = mat(THREE, 0xff4ad0, 0xff4ad0, 0.9);
  const barMat = mat(THREE, 0xe8d8f4, 0xc4a0e0, 0.2);
  const wheelMat = mat(THREE, 0x101014);
  for (let i = 0; i < n; i++) {
    const car = new THREE.Group();
    car.name = carName(id, i);
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.14, 2.05), bodyMat);
    chassis.position.y = -0.32;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.05, 1.7), neon);
    stripe.position.y = -0.2;
    const nose = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.22), neon);
    nose.position.set(0, -0.22, 1.02);
    const seats = [];
    const riders = [];
    for (let s = 0; s < 2; s++) {
      const x = s === 0 ? -0.32 : 0.32;
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.4), seatMat);
      seat.position.set(x, -0.12, 0.02);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.08), seatMat);
      back.position.set(x, 0.1, -0.2);
      seats.push(seat, back);
      riders.push({ x, y: 0.02, z: 0 });
    }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.06, 0.06), barMat);
    bar.position.set(0, 0.08, 0.28);
    bar.name = 'restraint';
    const wheelGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
    const wheels = [];
    for (const [x, z] of [[-0.62, 0.62], [0.62, 0.62], [-0.62, -0.62], [0.62, -0.62]]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(x, -0.44, z);
      wheels.push(w);
    }
    car.add(chassis, stripe, nose, bar, ...seats, ...wheels);
    car.userData.bots = seatRiders(THREE, car, riders);
    parent.add(car);
    cars.push(car);
  }
  return cars;
}

/** B&M hyper row. Four seats across, floor, lap bar. Lead is `${id}-car`. */
export function buildHyperTrain(THREE, parent, count, colors, id) {
  const cars = [];
  const n = count || 4;
  const bodyMat = mat(THREE, colors.body || 0x12828a, 0x0c3e46, 0.28);
  const seatMat = mat(THREE, 0x1c1e24);
  const floorMat = mat(THREE, 0x243036);
  const barMat = mat(THREE, 0xd7e4ea, 0x9ec4c8, 0.22);
  const wheelMat = mat(THREE, 0x1a1a1c);
  for (let i = 0; i < n; i++) {
    const car = new THREE.Group();
    car.name = carName(id, i);
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.26, 2.25), bodyMat);
    chassis.position.y = -0.4;
    const floor = new THREE.Mesh(new THREE.BoxGeometry(3.05, 0.08, 1.65), floorMat);
    floor.position.y = -0.22;
    const nose = new THREE.Mesh(new THREE.BoxGeometry(3.05, 0.16, 0.28), bodyMat);
    nose.position.set(0, -0.18, 1.12);
    const seats = [];
    const riders = [];
    for (let s = 0; s < 4; s++) {
      const x = -1.14 + s * 0.76;
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.46), seatMat);
      seat.position.set(x, -0.06, 0.04);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.58, 0.1), seatMat);
      back.position.set(x, 0.26, -0.26);
      seats.push(seat, back);
      if (s % 2 === 0) riders.push({ x, y: 0.12, z: 0.02 });
    }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.08, 0.08), barMat);
    bar.position.set(0, 0.2, 0.36);
    bar.name = 'restraint';
    const wheelGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const wheels = [];
    for (const [x, z] of [[-1.35, 0.72], [1.35, 0.72], [-1.35, -0.72], [1.35, -0.72]]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(x, -0.58, z);
      wheels.push(w);
    }
    car.add(chassis, floor, nose, bar, ...seats, ...wheels);
    car.userData.bots = seatRiders(THREE, car, riders);
    parent.add(car);
    cars.push(car);
  }
  return cars;
}

/** Wide floorless row. Three cars, eight seats across, no side walls. Lead is `${id}-car`. */
export function buildDiveTrain(THREE, parent, count, colors, id) {
  const cars = [];
  const n = count || 3;
  const bodyMat = mat(THREE, colors.body || 0xc45c26, 0x8a3018, 0.2);
  const seatMat = mat(THREE, 0x2a2118);
  const steel = mat(THREE, 0xf4f7fb, 0xd5deea, 0.35);
  const barMat = mat(THREE, 0xf2efe6, 0xc9b48a, 0.25);
  for (let i = 0; i < n; i++) {
    const car = new THREE.Group();
    car.name = carName(id, i);
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.22, 2.35), steel);
    chassis.position.y = -0.42;
    const nose = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.16, 0.28), bodyMat);
    nose.position.set(0, -0.22, 1.15);
    const seats = [];
    const riders = [];
    for (let s = 0; s < 8; s++) {
      const x = -2.45 + s * 0.7;
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.42), seatMat);
      seat.position.set(x, -0.18, 0.05);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.1), seatMat);
      back.position.set(x, 0.12, -0.22);
      seats.push(seat, back);
      if (s % 2 === 0) riders.push({ x, y: 0.05, z: 0.02 });
    }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.08, 0.08), barMat);
    bar.position.set(0, 0.28, 0.42);
    bar.name = 'restraint';
    const wheelGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const wheelMat = mat(THREE, 0x1a1a1c);
    const wheels = [];
    for (const [x, z] of [[-2.8, 0.75], [2.8, 0.75], [-2.8, -0.75], [2.8, -0.75]]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(x, -0.62, z);
      wheels.push(w);
    }
    car.add(chassis, nose, bar, ...seats, ...wheels);
    car.userData.bots = seatRiders(THREE, car, riders);
    parent.add(car);
    cars.push(car);
  }
  return cars;
}

let carBasis = null;
let carRight = null;
let carUp = null;
let carFwd = null;

export function placeCars(THREE, cars, table, s, gap, restraintClosed) {
  if (!carBasis) {
    carBasis = new THREE.Matrix4();
    carRight = new THREE.Vector3();
    carUp = new THREE.Vector3();
    carFwd = new THREE.Vector3();
  }
  let lead = null;
  for (let i = 0; i < cars.length; i++) {
    const pose = poseAt(table, s - i * gap);
    if (i === 0) lead = pose;
    const car = cars[i];
    car.position.set(pose.p.x, pose.p.y, pose.p.z);
    carRight.set(pose.right.x, pose.right.y, pose.right.z);
    carUp.set(pose.up.x, pose.up.y, pose.up.z);
    carFwd.set(pose.forward.x, pose.forward.y, pose.forward.z);
    car.quaternion.setFromRotationMatrix(carBasis.makeBasis(carRight, carUp, carFwd));
    const bar = car.getObjectByName('restraint');
    if (bar) {
      bar.rotation.x = restraintClosed ? -1.05 : 0.15;
      bar.position.y = restraintClosed ? 0.16 : 0.32;
    }
  }
  return lead || poseAt(table, s);
}
