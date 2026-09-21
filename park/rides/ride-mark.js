/** Stone pad under a claimed ride so it reads vs grass from drone. Queue yaw unchanged. */
export const PAD_H = 1.2;
const PAD = 0xe8e0d4;

export function markRide(THREE, scene, p, g) {
  if (!p || !scene) return g || null;
  const w = (p.w || 6) + 1.8;
  const d = (p.d || 4) + 1.8;
  const mat = new THREE.MeshLambertMaterial({ color: PAD });
  const pad = new THREE.Mesh(new THREE.BoxGeometry(w, PAD_H, d), mat);
  pad.position.set(p.x, PAD_H / 2, p.z);
  if (p.yaw) pad.rotation.y = p.yaw;
  pad.name = (p.id || 'ride') + '-pad';
  scene.add(pad);
  if (g) g.position.y = PAD_H;
  return g || null;
}
