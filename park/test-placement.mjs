import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  LOCK, BUILDINGS, GATE, STATIONS, PLACEMENTS,
  occupancyAABB, hitsHub, hitsSpine, hitsWater, hitsRail,
  placementIssues, stationBesideRing, inCanopy, canPlaceBuilding,
} from './lock.js';

const here = dirname(fileURLToPath(import.meta.url));

test('lock literals match LAYOUT.md', () => {
  assert.equal(LOCK.A, 380);
  assert.equal(LOCK.B, 230);
  assert.equal(LOCK.capR, 230);
  assert.equal(LOCK.hubInner, 18);
  assert.equal(LOCK.hubOuter, 32);
  assert.equal(LOCK.spineWidth, 14);
  assert.deepEqual(LOCK.gate, { x: 0, z: 230 });
  assert.deepEqual(LOCK.rings.A, { x: 95, z: 95, inner: 14, outer: 20 });
  assert.deepEqual(LOCK.rings.B, { x: 118, z: 108, inner: 6, outer: 11 });
  assert.equal(LOCK.waters.length, 12);
});

test('SKU ladder is kiosk / pavilion / album with distinct scales', () => {
  const bySku = Object.fromEntries(['kiosk', 'pavilion', 'album'].map((sku) => {
    const row = BUILDINGS.find((b) => b.sku === sku);
    assert.ok(row, `missing ${sku}`);
    return [sku, row];
  }));
  assert.ok(bySku.kiosk.w < bySku.pavilion.w);
  assert.ok(bySku.pavilion.w < bySku.album.w);
  assert.ok(bySku.kiosk.h < bySku.pavilion.h);
  assert.ok(bySku.pavilion.h < bySku.album.h);
});

test('hub predicate catches a kiosk on the plaza', () => {
  const fake = { sku: 'kiosk', x: 0, z: 0, w: 3.8, d: 3.8, land: 'The Pocket' };
  assert.equal(hitsHub(occupancyAABB(fake)), true);
  assert.ok(placementIssues(fake).includes('hub'));
});

test('spine predicate catches a kiosk on Gate corridor', () => {
  const fake = { sku: 'kiosk', x: 0, z: 120, w: 3.8, d: 3.8, land: 'The Pocket' };
  assert.equal(hitsSpine(occupancyAABB(fake)), true);
  assert.ok(placementIssues(fake).includes('spine'));
});

test('water predicate catches a building in the west lake', () => {
  const fake = { sku: 'album', x: -165, z: 10, w: 22, d: 14, land: 'The Block' };
  assert.equal(hitsWater(occupancyAABB(fake)), true);
  assert.ok(placementIssues(fake).includes('water'));
});

test('rail predicate catches a volume outside the stadium', () => {
  const fake = { sku: 'kiosk', x: 0, z: 400, w: 4, d: 4, land: 'Gate', role: 'land' };
  assert.equal(hitsRail(occupancyAABB(fake), 'land'), true);
});

test('every shipped volume clears hub / spine / water / rail', () => {
  assert.ok(PLACEMENTS.length >= 16);
  const lands = new Set();
  const skus = new Set();
  for (const p of PLACEMENTS) {
    const issues = placementIssues(p);
    assert.deepEqual(issues, [], `${p.id} issues: ${issues.join(',')}`);
    lands.add(p.land);
    skus.add(p.sku);
  }
  for (const land of ['The Block', 'After Hours', 'The Board', 'The Pocket']) {
    assert.ok(lands.has(land), `missing land ${land}`);
    const cluster = BUILDINGS.filter((p) => p.land === land);
    const clusterSkus = new Set(cluster.map((p) => p.sku));
    assert.ok(clusterSkus.has('kiosk'), `${land} missing kiosk`);
    assert.ok(clusterSkus.has('pavilion'), `${land} missing pavilion`);
    assert.ok(clusterSkus.has('album'), `${land} missing album/building`);
  }
  assert.ok(skus.has('kiosk') && skus.has('pavilion') && skus.has('album'));
});

test('land BUILDINGS still pass canPlaceBuilding', () => {
  for (const b of BUILDINGS) {
    assert.ok(canPlaceBuilding(b), b.id);
    assert.ok(inCanopy(b.x, b.z, b.land), b.id);
  }
});

test('gate house sits at the south rail with an opening on the 14 m spine', () => {
  assert.ok(GATE.length >= 2);
  for (const g of GATE) {
    assert.equal(g.sku, 'album');
    const occ = occupancyAABB(g);
    assert.ok(occ.maxZ >= LOCK.B - 12, `${g.id} not at south rail`);
    assert.equal(hitsSpine(occ), false, `${g.id} blocks spine`);
    assert.deepEqual(placementIssues(g), []);
  }
  const maxWest = Math.max(...GATE.filter((g) => g.x < 0).map((g) => occupancyAABB(g).maxX));
  const minEast = Math.min(...GATE.filter((g) => g.x > 0).map((g) => occupancyAABB(g).minX));
  assert.ok(minEast - maxWest >= LOCK.spineWidth, 'gate opening narrower than spine');
});

test('ride stations sit beside locked rings and do not overlap them', () => {
  assert.equal(STATIONS.length, 2);
  for (const s of STATIONS) {
    assert.ok(stationBesideRing(s), s.id);
    assert.deepEqual(placementIssues(s), []);
  }
  assert.equal(LOCK.rings.A.x, 95);
  assert.equal(LOCK.rings.A.z, 95);
  assert.equal(LOCK.rings.B.x, 118);
  assert.equal(LOCK.rings.B.z, 108);
});

test('index.html imports shipped placements and builds facade parts', () => {
  const src = readFileSync(join(here, 'index.html'), 'utf8');
  assert.match(src, /from ['"]\.\/lock\.js['"]/);
  assert.match(src, /BUILDINGS/);
  assert.match(src, /GATE/);
  assert.match(src, /STATIONS/);
  assert.match(src, />Walk</);
  assert.match(src, />3rd</);
  assert.match(src, />Drone</);
  assert.match(src, /roof/i);
  assert.match(src, /overhang|awning/i);
  assert.match(src, /window|pane|glass/i);
  assert.match(src, /queue/i);
  assert.match(src, /marquee|banner|fascia/i);
  assert.match(src, /service|door/i);
  assert.doesNotMatch(src, /\bhotel\b/i);
  assert.doesNotMatch(src, /\belevator\b/i);
});
