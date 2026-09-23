/** Park audio off. Hooks stay so attractions.js does not throw. */

export function playRideBed(id) {
  return { id, src: null, playing: false };
}

export function clickLift(id) {
  return { id, click: false };
}

export function whoosh(id) {
  return { id, whoosh: false };
}

export function dispatchBell(id) {
  return { id, bell: false };
}

export function hissBrakes(id) {
  return { id, hiss: false };
}

export function playLandBed(part) {
  return { part, src: null };
}

export function faceCue(dir) {
  const x = dir && dir.x ? dir.x : 0;
  return { block: x < -0.2, wheel: x > 0.2, roar: false, whoosh: false };
}

export function stopRideBed() {
  return { id: null, playing: false };
}

export function audioNow() {
  return null;
}
