/** Park is dry. Strip leftover water discs / lily pads / pink plates. lock.js waters data stays. */
import { LOCK, inEllipse } from './lock.js';
import { HUB_OUTER, inHubDisc } from './hub-clean.js';

export const PARK_DRY = true;

function worldXZ(obj) {
  obj.updateWorldMatrix(true, false);
  const e = obj.matrixWorld.elements;
  return [e[12], e[14]];
}

function atRideRing(x, z) {
  const a = LOCK.rings.A;
  const b = LOCK.rings.B;
  return Math.hypot(x - a.x, z - a.z) < a.outer + 4 || Math.hypot(x - b.x, z - b.z) < b.outer + 4;
}

function nearWaterPlot(x, z, extra = 8) {
  return LOCK.waters.some(([cx, cz, rx, rz]) => inEllipse(x, z, cx, cz, rx + extra, rz + extra));
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

export function isWaterMesh(obj) {
  if (keep(obj)) return false;
  const name = String(obj.name || '');
  if (name === 'dry-park-pad' || name.startsWith('block-water')) return true;
  const [x, z] = worldXZ(obj);
  if (atRideRing(x, z)) return false;
  if (inHubDisc(x, z, HUB_OUTER + 1)) return false;
  const g = obj.geometry;
  const t = g?.type;
  const p = g?.parameters;
  const sx = Math.abs(obj.scale?.x || 1);
  if (t === 'CircleGeometry' && (sx >= 2 || nearWaterPlot(x, z, 2))) return true;
  if (t === 'RingGeometry' && (nearWaterPlot(x, z, 10) || (p && p.outerRadius > 4))) return true;
  if (t === 'BoxGeometry' && p && p.height <= 0.4 && nearWaterPlot(x, z, 8)) return true;
  if ((t === 'BufferGeometry' || t === 'TubeGeometry') && nearWaterPlot(x, z, 10) && obj.position.y < 0.5) return true;
  return false;
}

export function addNoWater(THREE, scene) {
  const dump = [];
  scene.traverse((o) => {
    if (o === scene) return;
    if (isWaterMesh(o)) dump.push(o);
  });
  for (const o of dump) {
    if (o.parent) o.parent.remove(o);
  }
}
