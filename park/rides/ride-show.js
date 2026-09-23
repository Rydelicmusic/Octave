/** Stations, queues, exit photos, merch stubs, dark-ride shells, perimeter fence. Person scale. */

function lambert(THREE, color, emissive, intensity) {
  return new THREE.MeshLambertMaterial({
    color,
    emissive: emissive || 0x000000,
    emissiveIntensity: intensity || 0,
  });
}

function sign(THREE, text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#16120e';
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = color || '#f4efe6';
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);
  return new THREE.MeshLambertMaterial({
    map: new THREE.CanvasTexture(canvas),
    emissive: 0x3a2818,
    emissiveIntensity: 0.3,
  });
}

export function buildStation(THREE, parent, spec) {
  const g = new THREE.Group();
  g.name = spec.id + '-station';
  g.position.set(spec.x, 0, spec.z);
  const yaw = spec.yaw || 0;
  g.rotation.y = yaw;
  const wood = lambert(THREE, spec.trim || 0x4a3428);
  const roofM = lambert(THREE, spec.roof || 0x2a2018);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.28, 7.2), lambert(THREE, 0xc4b49a));
  floor.position.y = 0.14;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.22, 7.8), roofM);
  roof.position.y = 4.15;
  for (const [x, z] of [[-4.4, -3.2], [4.4, -3.2], [-4.4, 3.2], [4.4, 3.2]]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.0, 0.28), wood);
    post.position.set(x, 2.0, z);
    g.add(post);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(9.2, 3.2, 0.18), lambert(THREE, spec.body || 0x6a4030));
  back.position.set(0, 1.8, -3.35);
  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.0, 6.4), lambert(THREE, spec.body || 0x6a4030));
  sideL.position.set(-4.55, 1.7, 0);
  const sideR = sideL.clone();
  sideR.position.x = 4.55;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 0.9), sign(THREE, spec.name || 'RIDE', '#f4efe6'));
  board.position.set(0, 3.55, 3.5);
  g.add(floor, roof, back, sideL, sideR, board);

  const railMat = lambert(THREE, 0x3d3428);
  for (let lane = 0; lane < 4; lane++) {
    const x = -1.6 + lane * 1.05;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 6.2), railMat);
    rail.position.set(x, 1.05, 6.6);
    g.add(rail);
    for (const z of [4.2, 6.6, 9.0]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.05, 0.07), railMat);
      post.position.set(x, 0.52, z);
      g.add(post);
    }
  }
  const gateL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.2, 0.16), lambert(THREE, 0xc9b48a, 0xc9b48a, 0.25));
  gateL.position.set(-0.7, 1.1, 3.5);
  const gateR = gateL.clone();
  gateR.position.x = 0.7;
  const gateBar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.08), lambert(THREE, 0xf4efe6));
  gateBar.position.set(0, 1.15, 3.5);
  gateBar.name = 'load-gate';
  g.add(gateL, gateR, gateBar);

  const photo = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.8, 0.12), lambert(THREE, 0x241c16));
  photo.position.set(5.6, 1.3, 2.2);
  const photoFace = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.7), sign(THREE, 'EXIT', '#f4efe6'));
  photoFace.position.set(5.6, 1.5, 2.28);
  const merch = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.4, 1.6), lambert(THREE, spec.body || 0x6a4030, spec.trim || 0x000000, 0.05));
  merch.position.set(6.4, 1.2, -1.4);
  const merchSign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.4), sign(THREE, 'MERCH', '#f4efe6'));
  merchSign.position.set(6.4, 2.5, -0.55);
  g.add(photo, photoFace, merch, merchSign);
  parent.add(g);
  return g;
}

export function buildDarkShell(THREE, parent, spec) {
  const g = new THREE.Group();
  g.name = spec.id + '-dark';
  g.position.set(spec.x, 0, spec.z);
  const w = spec.w;
  const d = spec.d;
  const h = spec.h;
  const wall = lambert(THREE, spec.body || 0x241828);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), lambert(THREE, 0x1a1418));
  floor.position.y = 0.1;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.28, d + 0.4), lambert(THREE, 0x120e14));
  roof.position.y = h;
  const halfW = w / 2;
  const halfD = d / 2;
  const north = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.25), wall);
  north.position.set(0, h / 2, -halfD);
  const south = new THREE.Mesh(new THREE.BoxGeometry(w * 0.55, h, 0.25), wall);
  south.position.set(-w * 0.18, h / 2, halfD);
  const east = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, d), wall);
  east.position.set(halfW, h / 2, 0);
  const west = east.clone();
  west.position.x = -halfW;
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 0.3), lambert(THREE, spec.trim || 0x6a4cff, spec.trim || 0x6a4cff, 0.4));
  lintel.position.set(w * 0.22, 2.5, halfD);
  g.add(floor, roof, north, south, east, west, lintel);
  const showMat = lambert(THREE, spec.show || 0xd4a0ff, spec.show || 0x6a4cff, 0.15);
  spec.shows.forEach((show, i) => {
    const prop = new THREE.Mesh(new THREE.BoxGeometry(show.w, show.h, show.d), showMat.clone());
    prop.position.set(show.x, show.h / 2, show.z);
    prop.userData.show = show;
    prop.name = spec.id + '-show-' + i;
    g.add(prop);
  });
  parent.add(g);
  return g;
}

export function darkShows(which) {
  if (which === 2) {
    return [
      { x: 2.2, z: -2, w: 1.2, h: 2.4, d: 0.4, t0: 0.05, t1: 0.28 },
      { x: 2.2, z: 1.4, w: 0.8, h: 1.8, d: 0.8, t0: 0.22, t1: 0.45 },
      { x: -2.4, z: 1.6, w: 1.4, h: 2.8, d: 0.35, t0: 0.4, t1: 0.62 },
      { x: -2.2, z: 3.6, w: 0.7, h: 1.4, d: 0.7, t0: 0.55, t1: 0.78 },
      { x: 1.4, z: 3.8, w: 1.6, h: 2.2, d: 0.3, t0: 0.7, t1: 0.82 },
      { x: 0, z: -1.5, w: 1.8, h: 2.6, d: 0.25, t0: 0.82, t1: 0.96 },
    ];
  }
  return [
    { x: 1.4, z: -1.2, w: 0.9, h: 2.2, d: 0.3, t0: 0.05, t1: 0.18 },
    { x: 1.6, z: 0.2, w: 0.7, h: 1.8, d: 0.4, t0: 0.16, t1: 0.3 },
    { x: 1.4, z: 1.6, w: 1.1, h: 1.6, d: 0.5, t0: 0.28, t1: 0.42 },
    { x: 0.2, z: 2.0, w: 1.2, h: 2.0, d: 0.3, t0: 0.4, t1: 0.52 },
    { x: -1.1, z: 1.8, w: 0.8, h: 2.4, d: 0.3, t0: 0.5, t1: 0.66 },
    { x: -1.3, z: 0.2, w: 0.6, h: 1.5, d: 0.6, t0: 0.64, t1: 0.82 },
  ];
}

export function paintShows(ride, u) {
  const root = ride.shell;
  if (!root) return;
  root.traverse((obj) => {
    const show = obj.userData && obj.userData.show;
    if (!show || !obj.material) return;
    const on = u >= show.t0 && u <= show.t1;
    obj.material.emissiveIntensity = on ? 0.95 : 0.08;
  });
}

export function buildFence(THREE, parent, samples, id) {
  const n = Math.min(samples.length, 80);
  const step = Math.max(1, Math.floor(samples.length / n));
  const postMat = lambert(THREE, 0x3a2418);
  const geo = new THREE.BoxGeometry(0.12, 1.15, 0.12);
  const mesh = new THREE.InstancedMesh(geo, postMat, n);
  mesh.name = id + '-fence';
  const dummy = new THREE.Object3D();
  let k = 0;
  for (let i = 0; i < samples.length && k < n; i += step) {
    const p = samples[i];
    const q = samples[(i + step) % samples.length];
    const dx = q.x - p.x;
    const dz = q.z - p.z;
    const h = Math.hypot(dx, dz) || 1;
    const ox = (-dz / h) * 3.2;
    const oz = (dx / h) * 3.2;
    dummy.position.set(p.x + ox, 0.55, p.z + oz);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(k++, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  parent.add(mesh);
  const bannerMat = lambert(THREE, 0xc45c26, 0x802010, 0.2);
  for (let i = 0; i < samples.length; i += Math.floor(samples.length / 6) || 1) {
    const p = samples[i];
    const banner = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 1.4), bannerMat);
    banner.position.set(p.x, p.y + 1.2, p.z);
    parent.add(banner);
    if (i > samples.length * 0.5) break;
  }
}
