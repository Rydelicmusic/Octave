import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LOCK, BUILDINGS, BLUEPRINT, canPlaceBuilding, inCanopy, inStadium, inWater,
  onSpine, nearRing, hoverLabel, svgToMeters, occupiesSpine, canPlaceSoft,
  onRingWalk, beltTreePositions, TREE_BELTS, MATERIALS, GROUNDS_DRESSING, hubBedCenters,
  allLakesideRibbons, lakesideRibbonMesh,
} from './lock.js';

const dir = dirname(fileURLToPath(import.meta.url));
const indexHtml = readFileSync(join(dir, 'index.html'), 'utf8');
const blueprintHtml = readFileSync(join(dir, 'blueprint.html'), 'utf8');

assert.equal(LOCK.A, 380);
assert.equal(LOCK.B, 230);
assert.equal(LOCK.capR, 230);
assert.equal(LOCK.straight, 300);
assert.equal(LOCK.hubInner, 18);
assert.equal(LOCK.hubOuter, 32);
assert.equal(LOCK.spineWidth, 14);
assert.equal(LOCK.walk, 1.34);
assert.deepEqual(LOCK.origin, { x: 0, z: 0 });
assert.deepEqual(LOCK.gate, { x: 0, z: 230 });
assert.deepEqual(LOCK.rings.A, { x: 95, z: 95, inner: 14, outer: 20 });
assert.deepEqual(LOCK.rings.B, { x: 118, z: 108, inner: 6, outer: 11 });
assert.equal(LOCK.A - LOCK.capR, 150);
assert.equal(LOCK.straight, 2 * (LOCK.A - LOCK.capR));
assert.equal(LOCK.A * 2, 760);
assert.equal(LOCK.B * 2, 460);

assert.deepEqual(LOCK.waters, [
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
]);
assert.deepEqual(LOCK.canopies['The Block'], { cx: -165, cz: -10, rx: 130, rz: 160 });
assert.deepEqual(LOCK.canopies['After Hours'], { cx: 10, cz: -140, rx: 150, rz: 70 });
assert.deepEqual(LOCK.canopies['The Board'], { cx: 160, cz: 10, rx: 130, rz: 130 });

assert.equal(onSpine(0, 120), true);
assert.equal(onSpine(8, 120), false);
assert.equal(onSpine(0, -40), false);
assert.equal(inStadium(0, 0), true);
assert.equal(inStadium(0, 230), true);
assert.equal(inStadium(400, 0), false);
assert.equal(inWater(-210, -20), true);
assert.equal(inWater(0, 120), false);
assert.equal(inCanopy(-165, -10, 'The Block'), true);
assert.equal(nearRing(95, 95), true);

assert.ok(BUILDINGS.length >= 9);
const skus = new Set(BUILDINGS.map((b) => b.sku));
assert.deepEqual([...skus].sort(), ['album', 'kiosk', 'pavilion']);
for (const b of BUILDINGS) {
  assert.ok(canPlaceBuilding(b), b.id);
  assert.ok(inCanopy(b.x, b.z, b.land), b.id + ' canopy');
  assert.equal(onSpine(b.x, b.z), false, b.id + ' spine');
  assert.equal(inWater(b.x, b.z, 3), false, b.id + ' water');
  assert.ok(inStadium(b.x, b.z), b.id + ' stadium');
}

assert.equal(canPlaceBuilding({ ...BUILDINGS[0], x: 0, z: 100, land: 'The Block' }), false);
assert.equal(canPlaceBuilding({ ...BUILDINGS[0], x: -210, z: -20 }), false);
assert.equal(canPlaceBuilding({ ...BUILDINGS[0], x: 500, z: 0 }), false);

const hub = svgToMeters(BLUEPRINT.CX, BLUEPRINT.CY);
assert.equal(hub.x, 0);
assert.equal(hub.z, 0);
const gate = svgToMeters(BLUEPRINT.CX, BLUEPRINT.CY + 230);
assert.equal(gate.x, 0);
assert.equal(gate.z, 230);
assert.equal(hoverLabel(BLUEPRINT.CX, BLUEPRINT.CY), 'x 0 m   z 0 m');
assert.equal(hoverLabel(BLUEPRINT.CX + 25, BLUEPRINT.CY + 230), 'x 25 m   z 230 m');

assert.match(indexHtml, /from ['"]\.\/lock\.js['"]/);
assert.match(indexHtml, /BUILDINGS/);
assert.match(indexHtml, /LOCK\.walk/);
assert.match(indexHtml, /function pathRibbon/);
assert.match(indexHtml, /function lakeWalk/);
assert.match(indexHtml, /8 radial walk spokes \+ planted beds/);
assert.match(indexHtml, /West lakes \/ The Block/);
assert.match(indexHtml, /SE grove/);
assert.match(indexHtml, /North \/ After Hours split/);
assert.match(indexHtml, /function landSign/);
assert.match(indexHtml, /The Block/);
assert.match(indexHtml, /After Hours/);
assert.match(indexHtml, /The Board/);
assert.match(indexHtml, /The Pocket/);
assert.match(indexHtml, /function gateHouse/);
assert.match(indexHtml, /function rideStation/);
assert.match(indexHtml, /function queueZig/);
assert.match(indexHtml, /function lamp/);
assert.match(indexHtml, /asphaltMat/);
assert.match(indexHtml, /concreteMat/);
assert.match(indexHtml, /earthMat|EARTH/);
assert.match(indexHtml, /inStadium\(nx,nz\)/);
assert.match(indexHtml, /let yaw=0/);
assert.match(indexHtml, /location.hash==='#drone'/);
assert.match(indexHtml, />Walk</);
assert.match(indexHtml, />3rd</);
assert.match(indexHtml, />Drone</);
assert.match(indexHtml, /id="c"/);
assert.match(indexHtml, /mode===['"]walk['"]/);
assert.match(indexHtml, /mode===['"]third['"]/);
assert.match(indexHtml, /mode===['"]above['"]/);
assert.doesNotMatch(indexHtml, /\bhotel\b/i);
assert.doesNotMatch(indexHtml, /\btower\b/i);
assert.doesNotMatch(indexHtml, /\belevator\b/i);

assert.match(blueprintHtml, /from ['"]\.\/lock\.js['"]/);
assert.match(blueprintHtml, /hoverLabel/);
assert.match(blueprintHtml, /id="hud"/);
assert.doesNotMatch(blueprintHtml, /\bhotel\b/i);
assert.doesNotMatch(blueprintHtml, /\btower\b/i);
assert.doesNotMatch(blueprintHtml, /\belevator\b/i);

const layout = readFileSync(join(dir, 'LAYOUT.md'), 'utf8');
assert.equal(LOCK.A, Number(layout.match(/A = (\d+)/)[1]));
assert.equal(LOCK.B, Number(layout.match(/B = (\d+)/)[1]));
assert.equal(LOCK.capR, Number(layout.match(/Cap R = (\d+)/)[1]));
assert.equal(LOCK.straight, Number(layout.match(/Straight = (\d+)/)[1]));
assert.equal(LOCK.spineWidth, Number(layout.match(/Spine: (\d+) m/)[1]));
assert.equal(LOCK.gate.z, Number(layout.match(/Gate = \(0, \+(\d+)\)/)[1]));
const waterBlock = layout.split('Water ellipses')[1].split('```')[1];
const parsedWater = [...waterBlock.matchAll(/\((-?\d+),\s*(-?\d+),\s*(\d+),\s*(\d+)\)/g)]
  .map((m) => m.slice(1).map(Number));
assert.deepEqual(LOCK.waters, parsedWater);

assert.equal(occupiesSpine(0, 100, 1), true);
assert.equal(occupiesSpine(20, 100, 1), false);
assert.equal(canPlaceSoft(0, 120, 1), false);
assert.equal(canPlaceSoft(20, 100, 1), true);
{
  const [wx, wz] = LOCK.waters[0];
  assert.equal(inWater(wx, wz), true);
  assert.equal(canPlaceSoft(wx, wz, 1), false);
}
{
  const rb = LOCK.rings.B;
  const bandZ = rb.z + (rb.inner + rb.outer) / 2;
  assert.equal(onRingWalk(rb.x, bandZ, 1), true);
  assert.equal(canPlaceSoft(rb.x, bandZ, 1), false);
}
for (const name of GROUNDS_DRESSING.treeBelts) {
  const pts = beltTreePositions(name);
  assert.ok(pts.length >= 40, name + ' sparse ' + pts.length);
  for (const p of pts) {
    const rad = 2.2 * p.s;
    assert.equal(occupiesSpine(p.x, p.z, rad), false, name + ' spine');
    assert.equal(inWater(p.x, p.z), false, name + ' in-water ' + p.x + ',' + p.z);
    assert.equal(onRingWalk(p.x, p.z, rad), false, name + ' ring-walk ' + p.x + ',' + p.z);
    assert.equal(canPlaceSoft(p.x, p.z, rad), true, name + ' canPlaceSoft');
  }
  assert.match(indexHtml, new RegExp(name.replace('north split', 'North \\/ After Hours split').replace('west lakes', 'West lakes').replace('SE grove', 'SE grove')));
}
assert.match(indexHtml, /overlapping canop|canopy overlap/i);
assert.match(indexHtml, /trunk/);
assert.equal(hubBedCenters().length, 8);
assert.match(indexHtml, /radial planting bed/i);
assert.match(indexHtml, /lakesideRibbon/);
assert.match(indexHtml, /lakesideRibbonMesh/);
assert.match(indexHtml, /closedRing/);
assert.doesNotMatch(indexHtml, /segs\.length\s*>=\s*38/);
assert.match(indexHtml, /recessed/i);
const ribbons = allLakesideRibbons();
assert.equal(ribbons.length, LOCK.waters.length);
let clipped = 0;
for (const r of ribbons) {
  const mesh = lakesideRibbonMesh(r.x, r.z, r.rx, r.rz);
  assert.equal(mesh.closedRing, mesh.skipped === 0);
  assert.equal(mesh.closedRing, r.closedRing);
  assert.ok(r.segs.length > 8, 'ribbon ' + r.x + ',' + r.z);
  for (const s of r.segs) assert.equal(occupiesSpine(s.x, s.z, s.w / 2), false);
  if (mesh.skipped > 0) {
    clipped += 1;
    assert.equal(mesh.closedRing, false);
  }
}
assert.ok(clipped >= 1, 'expected at least one spine-clipped lakeside ribbon');
assert.match(indexHtml, /if\s*\(\s*mesh\.closedRing\s*\)/);
for (const name of GROUNDS_DRESSING.materials) {
  assert.ok(name in MATERIALS);
  assert.match(indexHtml, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}
assert.match(indexHtml, /land wash/i);
assert.match(indexHtml, /water reflection/i);
assert.match(indexHtml, /function lamp/);
assert.match(indexHtml, /benchAt/);
assert.match(indexHtml, /trashCan/);
assert.match(indexHtml, /planters/);
assert.match(indexHtml, /ropes/);
assert.match(indexHtml, /occupiesSpine|canPlaceSoft/);
assert.doesNotMatch(indexHtml, /from ['"]\.\/buildings\.js['"]/);

console.log('lock tests ok', BUILDINGS.length, 'buildings', Object.keys(TREE_BELTS).join(','));
