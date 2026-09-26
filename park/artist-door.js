/**
 * VIME slice — one walk-up artist-room door (mock artist Ori Hale, The Pocket).
 * Spec: handoff/2026-09-25-VIME-RESTART.md. LAYOUT.md wins; nothing locked moves.
 *
 * Placement: east edge of the 14 m spine (|x| < 7 stays clear), Gate arrival stretch,
 * z = 196 (34 m inside the Gate at z = 230; spawn is z = 224). Door face looks west, onto
 * the spine, so a guest walking north from spawn sees it on the right.
 * E (walk / 3rd only, within RADIUS m) or a click on the door / DOM button opens
 * ../vime/?artist=ori-hale (relative, so it resolves under /octave/ on Pages).
 * Drone / above: prompt hidden, E ignored (E is drone "descend" there).
 */

export const ARTIST_DOOR = {
  id: 'artist-door-ori-hale',
  artist: 'ori-hale',
  name: 'Ori Hale',
  land: 'The Pocket',
  label: 'Ori Hale — room',
  prompt: 'Enter Ori Hale — room',
  target: '../vime/?artist=ori-hale',
  // footprint (meters): thin in x, door width along z
  x: 10.4,
  z: 196,
  w: 1.4,
  d: 3.2,
  h: 3.6,
  facing: -Math.PI / 2, // door face points −X (toward the spine)
  radius: 4,
};

/** Absolute URL for the door target, relative to the current page (park/ → vime/). */
export function doorUrl(href) {
  return new URL(ARTIST_DOOR.target, href).href;
}

export function doorDistance(x, z) {
  return Math.hypot(x - ARTIST_DOOR.x, z - ARTIST_DOOR.z);
}

export function doorActive(mode, x, z) {
  if (mode !== 'walk' && mode !== 'third') return false;
  return doorDistance(x, z) <= ARTIST_DOOR.radius;
}

function signTexture(THREE, text) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(24,20,16,0.92)';
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = '#e8c878';
  g.lineWidth = 10;
  g.strokeRect(10, 10, c.width - 20, c.height - 20);
  g.fillStyle = '#f7e7c0';
  g.font = '600 96px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, c.width / 2, c.height / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function installArtistDoor({ THREE, scene, camera, canvas, getPos, getMode, claim } = {}) {
  if (!THREE || !scene || !camera || typeof getPos !== 'function' || typeof getMode !== 'function') return null;
  const D = ARTIST_DOOR;
  const url = doorUrl(location.href);

  if (typeof claim === 'function') {
    try { claim({ id: D.id, kind: 'prop', layer: 'mass', x: D.x, z: D.z, w: D.w, d: D.d, h: D.h, pad: 0.5 }); } catch (e) { /* occupancy is advisory here */ }
  }

  const g = new THREE.Group();
  g.name = D.id;
  g.position.set(D.x, 0, D.z);
  g.rotation.y = D.facing;
  const frameMat = new THREE.MeshLambertMaterial({ color: 0x3d2e22 });
  const trimMat = new THREE.MeshLambertMaterial({ color: 0xc9a45c });
  const doorMat = new THREE.MeshLambertMaterial({ color: 0x2a1c34, emissive: 0xffb45a, emissiveIntensity: 0.55 });
  // local frame: door face on +Z (after rotation → −X world); width along local X
  const W = D.d, H = 2.8;
  const postL = new THREE.Mesh(new THREE.BoxGeometry(0.28, H + 0.3, 0.5), frameMat);
  postL.position.set(-W / 2 + 0.14, (H + 0.3) / 2, 0);
  const postR = postL.clone();
  postR.position.x = W / 2 - 0.14;
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(W, 0.34, 0.56), trimMat);
  lintel.position.set(0, H + 0.3, 0);
  const back = new THREE.Mesh(new THREE.BoxGeometry(W, H + 0.3, 0.18), frameMat);
  back.position.set(0, (H + 0.3) / 2, -0.2);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.56, H), doorMat);
  panel.position.set(0, H / 2, 0.02);
  panel.name = D.id + '-panel';
  const step = new THREE.Mesh(new THREE.BoxGeometry(W + 0.4, 0.12, 1.2), trimMat);
  step.position.set(0, 0.06, 0.45);
  g.add(postL, postR, lintel, back, panel, step);

  const signMat = new THREE.MeshBasicMaterial({ map: signTexture(THREE, D.label), transparent: true, side: THREE.DoubleSide });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.85), signMat);
  sign.position.set(0, H + 0.95, 0.12);
  sign.name = D.id + '-sign';
  g.add(sign);

  const light = new THREE.PointLight(0xffc27a, 6, 12, 1.6);
  light.position.set(0, H + 0.2, 1.4);
  g.add(light);
  scene.add(g);
  const hitTargets = [panel, sign, postL, postR, lintel];

  // DOM prompt (shown only when near in walk / 3rd)
  const btn = document.createElement('button');
  btn.id = 'artist-door-prompt';
  btn.type = 'button';
  btn.textContent = D.prompt + '  ·  E';
  btn.setAttribute('aria-label', D.prompt);
  btn.style.cssText = 'position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:4;display:none;'
    + 'appearance:none;border:1px solid rgba(232,200,120,.7);background:rgba(24,20,16,.86);color:#f7e7c0;'
    + 'font:600 14px -apple-system,BlinkMacSystemFont,sans-serif;letter-spacing:.04em;padding:10px 16px;border-radius:12px;cursor:pointer';
  document.body.appendChild(btn);

  let navigating = false;
  const inRide = () => !!window.__parkRideDrew; // riding a coaster: door stays inert
  const near = () => {
    const p = getPos();
    return !!p && doorActive(getMode(), p.x, p.z) && !inRide();
  };
  const enter = () => {
    if (navigating || !near()) return false;
    navigating = true;
    location.assign(url);
    return true;
  };
  btn.addEventListener('click', (e) => { e.stopPropagation(); enter(); });
  addEventListener('keydown', (e) => {
    if (e.code !== 'KeyE' || e.repeat) return;
    if (enter()) e.preventDefault();
  });

  if (canvas) {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downX = 0, downY = 0;
    canvas.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
    canvas.addEventListener('click', (e) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return; // was a look-drag
      if (!near()) return;
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.intersectObjects(hitTargets, false).length) enter();
    });
  }

  let shown = false;
  const loop = () => {
    const on = near();
    if (on !== shown) { shown = on; btn.style.display = on ? 'block' : 'none'; }
    doorMat.emissiveIntensity = on ? 0.95 : 0.55;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  const api = { door: D, url, group: g, near, enter };
  window.__artistDoor = api; // read-only debug/QA handle (no teleport)
  return api;
}
