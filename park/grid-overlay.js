/** CRS ground grid: 25 m minor / 100 m major, G-cell labels every 100 m. */
import { LOCK } from './lock.js';

export const GRID_MINOR = 25;
export const GRID_MAJOR = 100;

export function cellId(x, z) {
  return `G${Math.floor(x / GRID_MINOR)},${Math.floor(z / GRID_MINOR)}`;
}

function lineMeshes(THREE, x0, z0, x1, z1, w, y, mat) {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, len), mat);
  mesh.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  mesh.rotation.y = Math.atan2(x1 - x0, z1 - z0);
  mesh.name = 'park-grid-line';
  return mesh;
}

function labelSprite(THREE, text) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 256, 64);
  ctx.fillStyle = 'rgba(18,16,14,0.55)';
  ctx.roundRect?.(8, 8, 240, 48, 12);
  if (ctx.roundRect) ctx.fill();
  else {
    ctx.fillRect(8, 8, 240, 48);
  }
  ctx.fillStyle = '#f4efe6';
  ctx.font = '600 28px ui-sans-serif,system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, depthTest: true, depthWrite: false,
  }));
  spr.scale.set(22, 5.5, 1);
  spr.name = 'park-grid-label';
  return spr;
}

export function addParkGrid(THREE, scene) {
  const group = new THREE.Group();
  group.name = 'park-grid';
  group.visible = false;

  const xMin = -LOCK.A;
  const xMax = LOCK.A;
  const zMin = -LOCK.B;
  const zMax = LOCK.B;
  const minorMat = new THREE.MeshLambertMaterial({
    color: 0x8a7a58, transparent: true, opacity: 0.32,
  });
  const majorMat = new THREE.MeshLambertMaterial({
    color: 0xe8d5a3, transparent: true, opacity: 0.7,
  });

  for (let x = Math.ceil(xMin / GRID_MINOR) * GRID_MINOR; x <= xMax + 0.01; x += GRID_MINOR) {
    const major = Math.abs(x) % GRID_MAJOR < 0.01 || Math.abs(Math.abs(x) % GRID_MAJOR - GRID_MAJOR) < 0.01;
    group.add(lineMeshes(THREE, x, zMin, x, zMax, major ? 0.28 : 0.08, major ? 0.11 : 0.08, major ? majorMat : minorMat));
  }
  for (let z = Math.ceil(zMin / GRID_MINOR) * GRID_MINOR; z <= zMax + 0.01; z += GRID_MINOR) {
    const major = Math.abs(z) % GRID_MAJOR < 0.01 || Math.abs(Math.abs(z) % GRID_MAJOR - GRID_MAJOR) < 0.01;
    group.add(lineMeshes(THREE, xMin, z, xMax, z, major ? 0.28 : 0.08, major ? 0.11 : 0.08, major ? majorMat : minorMat));
  }

  for (let x = Math.ceil(xMin / GRID_MAJOR) * GRID_MAJOR; x <= xMax + 0.01; x += GRID_MAJOR) {
    for (let z = Math.ceil(zMin / GRID_MAJOR) * GRID_MAJOR; z <= zMax + 0.01; z += GRID_MAJOR) {
      const spr = labelSprite(THREE, cellId(x, z));
      spr.position.set(x, 1.2, z);
      group.add(spr);
    }
  }

  scene.add(group);

  function setVisible(v) {
    group.visible = !!v;
  }
  function setMode(m) {
    group.visible = m === 'above';
  }

  addEventListener('keydown', (e) => {
    if (e.code !== 'KeyG' || e.repeat) return;
    if (e.target && /input|textarea/i.test(e.target.tagName)) return;
    group.visible = !group.visible;
  });

  return { group, setVisible, setMode };
}
