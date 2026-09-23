/** Seated riders. One shared pool. They live on the vehicle, not on the spine. */

export const BOT_CAP = 72;

const SHIRTS = [0xc45c26, 0x3a6ea5, 0x6a8f4a, 0xe0c36a, 0x8a4a6a];
let spawned = 0;
let shirtMats = null;
let skinMat = null;

export function resetBots() {
  spawned = 0;
}

export function botsSpawned() {
  return spawned;
}

export function reserveBots(n) {
  const got = Math.max(0, Math.min(n, BOT_CAP - spawned));
  spawned += got;
  return got;
}

function materials(THREE) {
  if (!shirtMats) {
    shirtMats = SHIRTS.map((color) => new THREE.MeshLambertMaterial({ color }));
    skinMat = new THREE.MeshLambertMaterial({ color: 0xe7c4a8 });
  }
  return { shirtMats, skinMat };
}

/** Parent a sitting person to a car, gondola, or seat. Local offsets stay inside the vehicle. */
export function seatRiders(THREE, parent, points) {
  const spots = points || [{ x: 0, y: 0.2, z: 0 }];
  const allowed = reserveBots(spots.length);
  const mats = materials(THREE);
  const bots = [];
  for (let i = 0; i < allowed; i++) {
    const spot = spots[i];
    const rider = new THREE.Group();
    rider.name = 'bot-rider';
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.48, 0.26), mats.shirtMats[(spawned + i) % mats.shirtMats.length]);
    body.position.y = 0.42;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 5), mats.skinMat);
    head.position.y = 0.78;
    rider.add(body, head);
    rider.position.set(spot.x || 0, spot.y || 0, spot.z || 0);
    parent.add(rider);
    bots.push(rider);
  }
  return bots;
}

export function showBots(bots, visible) {
  if (!bots) return;
  for (const bot of bots) if (bot) bot.visible = !!visible;
}
