import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LOCK, BUILDINGS, GATE, STATIONS, BLUEPRINT, canPlaceBuilding, inCanopy, inStadium, inWater,
  onSpine, nearRing, hoverLabel, svgToMeters, placementIssues, occupancyAABB, hitsSpine, stationBesideRing,
  spineCadPolyline, northSpineCadPolyline, WALKS, ITINERARY, walkById, walkLake, walkPairs, walkSegmentCrossesSpine,
  measureItinerary, walkPathMeters, metersToMin, distMeters,
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
assert.equal(metersToMin(LOCK.walk * 60), 1);
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
{
  const half = LOCK.spineWidth / 2;
  assert.equal(hoverLabel(BLUEPRINT.CX - half, BLUEPRINT.CY), `x ${(-half).toFixed(0)} m   z 0 m`);
  assert.equal(hoverLabel(BLUEPRINT.CX + half, BLUEPRINT.CY + LOCK.gate.z), `x ${half.toFixed(0)} m   z ${LOCK.gate.z.toFixed(0)} m`);
  const west = spineCadPolyline(-1);
  const east = spineCadPolyline(1);
  assert.equal(west[0][0], -half);
  assert.equal(east[0][0], half);
  assert.equal(west[0][1], 0);
  assert.equal(west[west.length - 1][1], LOCK.gate.z);
  assert.equal(east[east.length - 1][1], LOCK.gate.z);
  assert.ok(west.every(([x]) => x === -half));
  assert.ok(east.every(([x]) => x === half));
  const nWest = northSpineCadPolyline(-1);
  const nEast = northSpineCadPolyline(1);
  assert.equal(nWest[0][0], -half);
  assert.equal(nEast[0][0], half);
  assert.equal(nWest[0][1], 0);
  assert.equal(nWest[nWest.length - 1][1], -LOCK.B);
  assert.equal(nEast[nEast.length - 1][1], -LOCK.B);
  assert.ok(nWest.every(([x]) => x === -half));
  assert.ok(nEast.every(([x]) => x === half));
}
assert.match(indexHtml, /spineCadPolyline\(-1\)/);
assert.match(indexHtml, /spineCadPolyline\(1\)/);
assert.match(indexHtml, /northSpineCadPolyline\(-1\)/);
assert.match(indexHtml, /northSpineCadPolyline\(1\)/);
assert.doesNotMatch(indexHtml, /0\.55\*Math\.sin/);

assert.match(indexHtml, /from ['"]\.\/lock\.js['"]/);
assert.match(indexHtml, /BUILDINGS/);
assert.match(indexHtml, /LOCK\.walk/);
assert.match(indexHtml, /function pathRibbon/);
assert.match(indexHtml, /function lakeWalk/);
assert.match(indexHtml, /named circuits \(WALKS/);
assert.match(indexHtml, /WALKS\.forEach/);
assert.doesNotMatch(indexHtml, /2 nearest neighbors/);
assert.ok(WALKS.length >= 2);
assert.ok(WALKS.length >= 4);
assert.ok(WALKS.find((w) => w.id === 'after-hours-quiet'));
assert.ok(WALKS.find((w) => w.id === 'pocket-rim'));
assert.equal(ITINERARY.id, 'park-circuit');
{
  const m = measureItinerary();
  assert.equal(ITINERARY.totalMin, m.totalMin);
  assert.ok(ITINERARY.totalMin > 0);
  assert.equal(ITINERARY.stops.length, m.stops.length);
  for (let i = 0; i < m.stops.length; i++) {
    assert.equal(ITINERARY.stops[i].legMin, m.stops[i].legMin, m.stops[i].walk);
    assert.equal(ITINERARY.stops[i].meters, m.stops[i].meters);
  }
  const first = walkById(ITINERARY.sequence[0]);
  const approach = distMeters(ITINERARY.sign.x, ITINERARY.sign.z, first.sign.x, first.sign.z);
  const onWalk = walkPathMeters(first);
  assert.equal(ITINERARY.stops[0].meters, Math.round(approach + onWalk));
  assert.ok(Math.abs(ITINERARY.stops[0].legMin - metersToMin(approach + onWalk)) < 1);
  assert.equal(ITINERARY.returnToGate.atMin, m.totalMin);
}
assert.ok(ITINERARY.returnToGate);
assert.match(indexHtml, /returnToGatePath/);
assert.match(indexHtml, /Pass 36/);
assert.match(indexHtml, /windowGlowPass/);
assert.match(indexHtml, /walkPathFurniture/);
assert.match(indexHtml, /measured itinerary durations/);
assert.match(indexHtml, /measureItinerary|totalMin/);
assert.ok(ITINERARY.stops.length === ITINERARY.sequence.length);
assert.ok(ITINERARY.stops.every((s) => s.atMin >= 0 && walkById(s.walk)));
assert.match(indexHtml, /tourMarker/);
assert.match(indexHtml, /afterHoursShore/);
assert.match(indexHtml, /wayChevrons/);
assert.match(indexHtml, /boardShore/);
assert.match(indexHtml, /blockShore/);
assert.match(indexHtml, /pocketShore/);
assert.match(indexHtml, /corridorLanterns/);
assert.match(indexHtml, /hubLanternRing/);
assert.match(indexHtml, /ringApproachAprons/);
assert.match(indexHtml, /gateArrivalPlaza/);
assert.match(indexHtml, /hubBenches/);
assert.match(indexHtml, /canopyEdgeRibbons/);
assert.match(indexHtml, /railFenceDensify/);
assert.match(indexHtml, /Pass 32/);
assert.match(indexHtml, /HemisphereLight/);
assert.match(indexHtml, /Pass 33/);
assert.match(indexHtml, /earthGrassPatches/);
assert.match(indexHtml, /emissiveIntensity:0\.45/);


assert.ok(ITINERARY.sequence.every((id) => walkById(id)));
assert.match(indexHtml, /ITINERARY/);
assert.match(indexHtml, /parkItinerary/);

assert.ok(WALKS.every((w) => w.name && w.land && Array.isArray(w.lakes)));
assert.deepEqual(WALKS.find((w) => w.id === 'block-lakeshore').lakes, [0, 4, 3, 2, 1]);
assert.deepEqual(WALKS.find((w) => w.id === 'board-promenade').lakes, [10, 11]);
for (const w of WALKS) {
  for (const i of w.lakes) {
    assert.ok(i >= 0 && i < LOCK.waters.length, w.id + ' lake ' + i);
    const L = walkLake(i);
    if (w.land === 'The Block') assert.ok(L.x < -LOCK.spineWidth / 2, w.id);
    if (w.land === 'The Board') assert.ok(L.x > LOCK.spineWidth / 2, w.id);
    // After Hours / Pocket may straddle hub; no hard side rule
  }
  for (const [ia, ib] of walkPairs(w)) {
    const A = walkLake(ia), B = walkLake(ib);
    assert.equal(walkSegmentCrossesSpine(A.x, A.z, B.x, B.z), false, w.id);
  }
  if (w.spur) {
    const L = walkLake(w.lakes[0]);
    assert.equal(walkSegmentCrossesSpine(L.x, L.z, w.spur[0], w.spur[1]), false, w.id + ' spur');
    assert.ok(Math.abs(w.spur[0]) >= LOCK.spineWidth / 2);
  }
  if (w.sign) {
    assert.ok(inCanopy(w.sign.x, w.sign.z, w.land), w.id + ' sign canopy');
    assert.equal(onSpine(w.sign.x, w.sign.z), false, w.id + ' sign spine');
  }
}
assert.match(blueprintHtml, /WALKS/);
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
assert.match(indexHtml, /function addPilaster/);
assert.match(indexHtml, /function addWindowBay/);
assert.match(indexHtml, /function addPortico/);
assert.match(indexHtml, /addWindowBay\(/);
assert.match(indexHtml, /addPilaster\(/);
assert.match(indexHtml, /addPortico\(/);
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

assert.equal(GATE.length, 2);
assert.equal(STATIONS.length, 2);
for (const g of GATE) {
  assert.deepEqual(placementIssues(g), [], g.id);
  assert.equal(hitsSpine(occupancyAABB(g)), false, g.id);
}
{
  const maxWest = Math.max(...GATE.filter((g) => g.x < 0).map((g) => occupancyAABB(g).maxX));
  const minEast = Math.min(...GATE.filter((g) => g.x > 0).map((g) => occupancyAABB(g).minX));
  assert.ok(minEast - maxWest >= LOCK.spineWidth, 'gate opening');
}
for (const s of STATIONS) {
  assert.ok(stationBesideRing(s), s.id);
  assert.deepEqual(placementIssues(s), [], s.id);
}

assert.match(blueprintHtml, /from ['"]\.\/lock\.js['"]/);
assert.match(blueprintHtml, /GATE/);
assert.match(blueprintHtml, /STATIONS/);
assert.match(blueprintHtml, /hoverLabel/);
assert.match(blueprintHtml, /id="hud"/);
assert.doesNotMatch(blueprintHtml, /\bhotel\b/i);
assert.doesNotMatch(blueprintHtml, /\btower\b/i);
assert.doesNotMatch(blueprintHtml, /\belevator\b/i);

console.log('lock tests ok', BUILDINGS.length, 'buildings');
