/** Walk speed. Base 5× LOCK.walk. Shift = 10×. Wire in tick: spd=walkSpeed(WALK,keys) */
export function walkSpeed(WALK, keys) {
  const sprint = !!(keys && (keys.ShiftLeft || keys.ShiftRight));
  return WALK * (sprint ? 10 : 5);
}
