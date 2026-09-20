/** Locked Rydelic Park meters + SKU placement. Used by the 3D/blueprint pages and tests. */
export const LOCK = {
  A: 380,
  B: 230,
  capR: 230,
  straight: 300,
  hubInner: 18,
  hubOuter: 32,
  spineWidth: 14,
  walk: 1.34,
  origin: { x: 0, z: 0 },
  gate: { x: 0, z: 230 },
  rings: {
    A: { x: 95, z: 95, inner: 14, outer: 20 },
    B: { x: 118, z: 108, inner: 6, outer: 11 },
  },
  canopies: {
    'The Block': { cx: -165, cz: -10, rx: 130, rz: 160 },
    'After Hours': { cx: 10, cz: -140, rx: 150, rz: 70 },
    'The Board': { cx: 160, cz: 10, rx: 130, rz: 130 },
    'The Pocket': { cx: 80, cz: 105, rx: 95, rz: 80 },
  },
  waters: [
    [-210, -20, 48, 70],
    [-165, 10, 55, 42],
    [-120, 70, 32, 26],
    [-95, -85, 28, 22],
    [-150, -40, 24, 18],
    [-20, -18, 16, 10],
    [22, -22, 18, 12],
    [-18, 22, 16, 9],
    [28, 20, 17, 10],
    [8, -8, 10, 7],
    [155, -85, 22, 16],
    [200, -40, 18, 12],
  ],
};

export const RINGS = [
  { id: 'A', ...LOCK.rings.A },
  { id: 'B', ...LOCK.rings.B },
];
