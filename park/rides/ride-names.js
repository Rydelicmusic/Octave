/** Hovering ride names. Billboard planes over the crest so drone and walk both read them. */
import { RIDE_ANCHORS } from './coaster-paths.js';

const plates = [];

function paint(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 256);
  ctx.fillStyle = 'rgba(18,14,10,0.72)';
  ctx.fillRect(24, 48, 976, 160);
  ctx.strokeStyle = 'rgba(244,239,230,0.85)';
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 48, 976, 160);
  ctx.fillStyle = '#f4efe6';
  ctx.font = 'bold 96px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 512, 128);
  return canvas;
}

function crestOf(scene, id, fallback) {
  const world = scene.getObjectByName(id + '-world');
  const mark = scene.getObjectByName(id + '-crest');
  if (mark) return { x: mark.position.x, y: mark.position.y, z: mark.position.z };
  if (world) {
    let best = null;
    world.traverse((node) => {
      if (!node.isMesh || !node.position) return;
      if (!best || node.position.y > best.y) best = node.position;
    });
    if (best && best.y > 6) return { x: best.x, y: best.y, z: best.z };
  }
  return { x: fallback.x, y: (fallback.h || 8) + 10, z: fallback.z };
}

export function mountRideNames(THREE, scene) {
  if (!THREE || !scene || typeof document === 'undefined') return;
  if (scene.getObjectByName('ride-nameplates')) return;
  const root = new THREE.Group();
  root.name = 'ride-nameplates';
  root.userData.hubKeep = true;
  root.userData.dryKeep = true;
  plates.length = 0;
  for (const ride of Object.values(RIDE_ANCHORS)) {
    const at = crestOf(scene, ride.id, ride);
    const map = new THREE.CanvasTexture(paint(ride.name));
    map.needsUpdate = true;
    const mat = new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(28, 7), mat);
    mesh.name = ride.id + '-name';
    mesh.position.set(at.x, Math.max(18, at.y + 10), at.z);
    root.add(mesh);
    plates.push(mesh);
  }
  scene.add(root);
}

export function tickRideNames(camera) {
  if (!camera || !plates.length) return;
  for (const mesh of plates) mesh.lookAt(camera.position);
}
