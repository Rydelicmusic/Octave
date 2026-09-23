/** Land grade. Hub and the 14 m spine stay near the old lawn. Interiors step up or down. */
import { LOCK } from '../lock.js';

export function sampleHeight(x, z) {
  const hub = Math.hypot(x, z);
  if (hub < LOCK.hubOuter + 4) return 0;
  if (Math.abs(x) < LOCK.spineWidth / 2 + 2) return 0.06 * Math.sin(z * 0.008);
  let h = 0;
  if (x < -70) h += 0.45 + 0.28 * Math.sin(x * 0.018) * Math.cos(z * 0.012);
  if (z < -90 && Math.abs(x) < 90) h += -0.28 + 0.7 * Math.max(0, Math.sin((x + 30) * 0.04));
  if (x > 100) h += 0.62 + 0.12 * Math.sin(z * 0.02);
  if (z > 90 && x > 30 && x < 150) h += 0.32 + 0.18 * Math.sin(x * 0.03);
  if (!Number.isFinite(h)) return 0;
  return Math.max(-0.55, Math.min(1.35, h));
}

/** Post from the berm up to the rail. The rail stays on the path, above the dirt. */
export function supportSpan(trackY, groundY) {
  const top = trackY - 0.35;
  const foot = Math.min(groundY, top - 0.8);
  return { foot, top, height: Math.max(0.8, top - foot) };
}

export function railClear(trackY, groundY) {
  return trackY - groundY;
}

if (typeof window !== 'undefined') window.__groundY = sampleHeight;
