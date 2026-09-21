/** Lawn over leftover plots. Streets: hub ring + spine + one T-drive per land. */
import { LOCK, occupiesSpine, inEllipse } from './lock.js';
import { HUB_OUTER, inHubDisc } from './hub-clean.js';

function worldXZ(obj) {
  obj.updateWorldMatrix(true, false);
  const e = obj.matrixWorld.elements;
  return [e[12], e[14]];
}

function nearWaterPlot(x, z, extra = 6) {
  return LOCK.waters.some(([cx, cz, rx, rz]) => inEllipse(x, z, cx, cz, rx + extra, rz + extra));
}

function atRideRing(x, z) {
  const a = LOCK.rings.A;
  const b = LOCK.rings.B;
  return Math.hypot(x - a.x, z - a.z) < a.outer + 4 || Math.hypot(x - b.x, z - b.z) < b.outer + 4;
}

function keep(obj) {
  if (!obj || obj.userData?.hubKeep || obj.userData?.tidyKeep) return true;
  if (obj.isLight || obj.isCamera || obj.isScene) return true;
  const name = String(obj.name || '');
  if (name === 'road-deck' || name === 'road-curb') return true;
  if (name.startsWith('hub-')) return true;
  const p = obj.geometry?.parameters;
  if (obj.geometry?.type === 'PlaneGeometry' && p && p.width > 200) return true;
  return false;
}

export function shouldStripPlot(obj) {
  if (keep(obj)) return false;
  const [x, z] = worldXZ(obj);
  const g = obj.geometry;
  const t = g?.type;
  const p = g?.parameters;
  const name = String(obj.name || '');
  if (name === 'dry-park-pad') return true;

  if (t === 'CircleGeometry') {
    if (inHubDisc(x, z, HUB_OUTER - 0.5)) return false;
    const sx = Math.abs(obj.scale?.x || 1);
    if (sx >= 2.5) return true;
    if (nearWaterPlot(x, z, 2)) return true;
  }

  if (t === 'RingGeometry') {
    if (atRideRing(x, z)) return false;
    if (inHubDisc(x, z, HUB_OUTER + 2)) return false;
    if (nearWaterPlot(x, z, 10)) return true;
    if (p && p.outerRadius > 4) return true;
  }

  if (t === 'BoxGeometry' && p && p.height <= 0.22 && p.width >= 0.2 && p.width <= 4.5 && nearWaterPlot(x, z, 8)) {
    return true;
  }

  if (t === 'PlaneGeometry' && p && p.width < 80 && obj.position.y > 0.3 && nearWaterPlot(x, z, 12)) return true;
  if (t === 'PlaneGeometry' && p && p.width >= 50 && p.width <= 100 && p.height >= 30 && p.height <= 80) return true;

  return false;
}

function looksTree(obj) {
  if (!obj.isGroup) return false;
  let cyl = 0;
  let sph = 0;
  for (const c of obj.children) {
    const t = c.geometry?.type;
    if (t === 'CylinderGeometry') cyl += 1;
    if (t === 'SphereGeometry' || t === 'ConeGeometry' || t === 'CapsuleGeometry') sph += 1;
  }
  return cyl >= 1 && sph >= 2 && obj.children.length <= 14;
}

function stripTreesOnPavement(scene) {
  const dump = [];
  scene.traverse((o) => {
    if (!looksTree(o)) return;
    const [x, z] = worldXZ(o);
    if (inHubDisc(x, z, HUB_OUTER)) dump.push(o);
    else if (occupiesSpine(x, z, 1.2)) dump.push(o);
  });
  for (const o of dump) {
    if (o.parent) o.parent.remove(o);
  }
}

export function addTidyOval(THREE, scene) {
  const dump = [];
  scene.traverse((o) => {
    if (o === scene) return;
    if (shouldStripPlot(o)) dump.push(o);
  });
  for (const o of dump) {
    if (o.parent) o.parent.remove(o);
  }
  stripTreesOnPavement(scene);
}
