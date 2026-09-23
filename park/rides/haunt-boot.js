/** One haunt mount. Ride motion stays in attractions.js via armAttractions(). */
export function bootHaunt(THREE, scene) {
  if (!scene || typeof window === 'undefined' || window.__HAUNT_SCENE) return;
  window.__HAUNT_SCENE = true;
  import('../halloween/haunt-scene.js').then((m) => {
    const add = m.mountHaunt || m.addHauntScene;
    if (typeof add === 'function') add(THREE, scene);
  }).catch((err) => {
    console.warn('haunt-boot', err);
  });
}
