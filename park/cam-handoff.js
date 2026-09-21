/** Carry park XZ between Walk / 3rd / Drone. Ground modes land at drone XZ, y = eye. */
export function applyCamHandoff({ mode, next, pos, drone, EYE, yaw }) {
  const aerial = next === 'above' || next === 'drone';
  const was = mode === 'above' || mode === 'drone';
  if (was && !aerial) {
    pos.x = drone.x;
    pos.z = drone.z;
    pos.y = EYE;
  }
  if (aerial && !was) {
    const alt = Number.isFinite(drone.y) ? Math.max(24, drone.y) : 90;
    drone.set(pos.x, alt, pos.z);
    if (yaw != null) {
      /* caller sets droneYaw */
    }
  }
  window.__parkGpsGet = () => ((next === 'above' || next === 'drone') ? drone : pos);
  return { aerial, was };
}
