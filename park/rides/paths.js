/** The mounted Block coaster. Geometry lives in coaster-paths.js. */
import { LOCK, inCanopy, occupiesSpine } from '../lock.js';
import { giantBlockPack as giantPack, giantBlockSamples } from './coaster-paths.js';

export function heroSamples() {
  return giantBlockSamples();
}

export function heroIssues(samples) {
  const bad = [];
  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    if (!inCanopy(p.x, p.z, 'The Block')) bad.push(i + ' canopy');
    if (occupiesSpine(p.x, p.z, 2)) bad.push(i + ' spine');
    if (Math.hypot(p.x, p.z) < LOCK.hubOuter + 4) bad.push(i + ' hub');
    if (bad.length > 6) break;
  }
  return bad;
}

export function heroBlockPack() {
  return giantPack();
}
