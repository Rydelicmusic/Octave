/** Rails, ties, supports, trim lights, tunnels, brakes. Heartline samples are world-space. */
import { frameFromTangent, pointAt } from './path-math.js';
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
  const supportMat = mat(THREE, opts.support || 0x4a4038);
  const lightMat = mat(THREE, opts.lamp || 0xffb060, opts.lamp || 0xff7a20, 0.9);
  const brakeMat = mat(THREE, 0xc4382a, 0x802018, 0.35);
  const chainMat = mat(THREE, 0xf0c040, 0xc48a10, 0.25);

  const railGeo = new THREE.BoxGeometry(0.22, 0.18, 1);
  const tieGeo = new THREE.BoxGeometry(gauge * 2 + 0.35, 0.08, 0.18);
  const supportGeo = new THREE.BoxGeometry(1, 1, 1);
  const lightGeo = new THREE.SphereGeometry(0.09, 6, 5);
  const chainGeo = new THREE.BoxGeometry(0.08, 0.08, 0.35);
  const dogGeo = new THREE.BoxGeometry(0.16, 0.22, 0.12);
  const brakeGeo = new THREE.BoxGeometry(0.22, 0.28, 0.55);
  const dogMat = mat(THREE, 0xd7c4a4, 0xc9b48a, 0.15);

  const railL = new THREE.InstancedMesh(railGeo, railMat, n);
  const railR = new THREE.InstancedMesh(railGeo, railMat, n);
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
      const foot = p.y - 0.4;
      dummy.position.set(p.x, foot / 2, p.z);
      dummy.scale.set(0.62, Math.max(0.4, foot), 0.62);
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
  parent.add(railL, railR, ties, lights);
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
