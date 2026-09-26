/** Harvest Cups. One pad, one cycle, E to ride and E to get off. */
const PAD = { x: 160, z: 14 };
const EXIT = { x: 160, z: 8 };
const REACH = 7;
const CYCLE = 14;
const EYE = 1.72;

let root = null;
let platter = null;
let seat = null;
let riding = false;
let elapsed = 0;
let wasE = false;
let prompt = null;
let blockedPrev = null;

function ensurePrompt() {
  if (typeof document === 'undefined') return null;
  if (prompt) return prompt;
  const el = document.createElement('div');
  el.id = 'harvest-cups-prompt';
  el.style.cssText = 'position:fixed;left:50%;bottom:18%;transform:translateX(-50%);z-index:8;text-align:center;font:16px/1.35 -apple-system,sans-serif;letter-spacing:.04em;color:#f4efe6;background:rgba(18,16,14,.88);border:1px solid rgba(201,180,138,.45);padding:10px 16px;border-radius:12px;pointer-events:none;display:none;';
  document.body.appendChild(el);
  prompt = el;
  return el;
}

function say(text) {
  const el = ensurePrompt();
  if (!el) return;
  if (!text) {
    el.style.display = 'none';
    el.textContent = '';
    return;
  }
  el.style.display = 'block';
  el.textContent = text;
  const other = document.getElementById('walk-ride-prompt');
  if (other) other.style.display = 'none';
}

function hideWheel(scene) {
  const world = scene.getObjectByName('ride-board-01-world');
  if (world) world.visible = false;
  const anchor = scene.getObjectByName('ride-board-01-anchor');
  if (anchor) anchor.visible = false;
}

function cupMesh(THREE, color) {
  const g = new THREE.Group();
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.62, 0.7, 16),
    new THREE.MeshLambertMaterial({ color, emissive: 0x3a1808, emissiveIntensity: 0.15 })
  );
  bowl.position.y = 0.45;
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.82, 0.08, 8, 20),
    new THREE.MeshLambertMaterial({ color: 0xf4efe6, emissive: 0xc9b48a, emissiveIntensity: 0.2 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.78;
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.16, 0.35, 8),
    new THREE.MeshLambertMaterial({ color: 0x2a241c })
  );
  stem.position.y = 0.16;
  g.add(stem, bowl, rim);
  return g;
}

function build(THREE, scene) {
  if (scene.getObjectByName('harvest-cups')) return;
  hideWheel(scene);
  root = new THREE.Group();
  root.name = 'harvest-cups';
  root.position.set(PAD.x, 0, PAD.z);
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(4.2, 4.4, 0.16, 24),
    new THREE.MeshLambertMaterial({ color: 0x6a4030 })
  );
  floor.position.y = 0.08;
  const lip = new THREE.Mesh(
    new THREE.TorusGeometry(4.15, 0.08, 6, 28),
    new THREE.MeshLambertMaterial({ color: 0xc9b48a, emissive: 0x8a6230, emissiveIntensity: 0.25 })
  );
  lip.rotation.x = Math.PI / 2;
  lip.position.y = 0.18;
  platter = new THREE.Group();
  platter.position.y = 0.2;
  const colors = [0xc45c26, 0xe8a040, 0x8a4030];
  for (let i = 0; i < 3; i += 1) {
    const cup = cupMesh(THREE, colors[i]);
    const a = (i / 3) * Math.PI * 2;
    cup.position.set(Math.cos(a) * 2.15, 0, Math.sin(a) * 2.15);
    cup.name = 'harvest-cup-' + i;
    platter.add(cup);
  }
  seat = platter.getObjectByName('harvest-cup-0');
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 1.4, 8),
    new THREE.MeshLambertMaterial({ color: 0x2c2824 })
  );
  pole.position.y = 0.7;
  const sign = signMesh(THREE, 'HARVEST CUPS');
  sign.position.set(0, 2.4, -3.3);
  root.add(floor, lip, platter, pole, sign);
  scene.add(root);
}

function signMesh(THREE, text) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const g = canvas.getContext('2d');
  g.fillStyle = '#1a140e';
  g.fillRect(0, 0, 512, 128);
  g.strokeStyle = '#c9b48a';
  g.lineWidth = 8;
  g.strokeRect(8, 8, 496, 112);
  g.fillStyle = '#f4efe6';
  g.font = 'bold 54px sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 256, 64);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 0.85),
    new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(canvas), emissive: 0x3a2818, emissiveIntensity: 0.3 })
  );
  return mesh;
}

function holdFeet(on) {
  if (typeof window === 'undefined') return;
  if (on) {
    if (blockedPrev === null) blockedPrev = window.__blockWalk || null;
    const prev = blockedPrev;
    window.__blockWalk = () => true;
    window.__harvestCupsRiding = true;
    void prev;
    return;
  }
  window.__harvestCupsRiding = false;
  if (blockedPrev) window.__blockWalk = blockedPrev;
  else delete window.__blockWalk;
  blockedPrev = null;
}

function near(pos) {
  return Math.hypot(pos.x - PAD.x, pos.z - PAD.z) <= REACH;
}

function sitCamera(THREE, camera) {
  if (!seat || !camera) return;
  seat.updateWorldMatrix(true, true);
  const eye = new THREE.Vector3(0, 1.25, 0);
  const at = new THREE.Vector3(0, 1.05, 1.6);
  seat.localToWorld(eye);
  seat.localToWorld(at);
  camera.up.set(0, 1, 0);
  camera.position.copy(eye);
  camera.lookAt(at);
}

function dismount(camera, pos, mode, yaw) {
  riding = false;
  elapsed = 0;
  holdFeet(false);
  pos.x = EXIT.x;
  pos.z = EXIT.z;
  pos.y = EYE;
  if (!camera || mode === 'above') return;
  camera.up.set(0, 1, 0);
  if (mode === 'walk') {
    camera.position.set(pos.x, EYE, pos.z);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw || 0;
    camera.rotation.x = 0;
  } else {
    const y = yaw || 0;
    camera.position.set(pos.x + Math.sin(y) * 5.2, EYE + 2.1, pos.z + Math.cos(y) * 5.2);
    camera.lookAt(pos.x, EYE - 0.1, pos.z);
  }
}

export function mountHarvestCups(THREE, scene) {
  if (!THREE || !scene) return;
  build(THREE, scene);
}

export function tickHarvestCups(THREE, camera, pos, mode, dt, keys, yaw) {
  if (!root || !pos) return;
  const edge = !!(keys && keys.KeyE) && !wasE;
  wasE = !!(keys && keys.KeyE);
  const onFoot = mode === 'walk' || mode === 'third';
  if (riding && (mode === 'above' || (edge && onFoot))) {
    dismount(camera, pos, mode === 'above' ? 'walk' : mode, yaw);
    say(near(pos) && onFoot ? 'Press E to ride' : '');
    return;
  }
  if (!riding && edge && onFoot && near(pos)) {
    riding = true;
    elapsed = 0;
    holdFeet(true);
    say('Press E to get off');
  }
  if (riding) {
    elapsed += dt || 0;
    const u = Math.min(1, elapsed / CYCLE);
    if (platter) platter.rotation.y = u * Math.PI * 2;
    platter.children.forEach((cup) => {
      cup.rotation.y = -u * Math.PI * 4;
    });
    sitCamera(THREE, camera);
    say('Press E to get off');
    if (u >= 1) dismount(camera, pos, mode, yaw);
    return;
  }
  if (platter) platter.rotation.y = (platter.rotation.y + (dt || 0) * 0.15) % (Math.PI * 2);
  say(onFoot && near(pos) ? 'Press E to ride' : '');
}
