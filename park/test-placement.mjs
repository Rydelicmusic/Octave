import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  LOCK, BUILDINGS, GATE, STATIONS, PLACEMENTS, LAND_PALETTE,
  occupancyAABB, hitsHub, hitsSpine, hitsWater, hitsRail,
  placementIssues, stationBesideRing, inCanopy, canPlaceBuilding,
} from './lock.js';
import { FACADE_PARTS, collectSkuKit, skuKitReport, skuKit, paletteFor } from './sku-kit.js';

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

test('skuKit always emits roof overhang window queue marquee service with palette colors', () => {
  assert.ok(PLACEMENTS.length >= 16);
  for (const p of PLACEMENTS) {
    const report = skuKitReport(p);
    assert.equal(report.ok, true, `${p.id} missing ${report.missing}`);
    const pal = paletteFor(p);
    const marquee = report.parts.find((x) => x.name === 'marquee');
    assert.equal(marquee.color, pal.marquee, `${p.id} marquee color`);
    assert.equal(marquee.color, LAND_PALETTE[p.land].marquee, `${p.id} LAND_PALETTE.marquee`);
    assert.ok(marquee.y <= 3.6, `${p.id} marquee y ${marquee.y} must be walk-under (<=3.6 m)`);
    const window0 = report.parts.find((x) => x.name === 'window');
    assert.ok(window0.y >= 1.2 && window0.y <= 1.75, `${p.id} ground window y ${window0.y}`);
    const overhang = report.parts.find((x) => x.name === 'overhang');
    assert.ok(overhang.w > p.w, `${p.id} overhang must outspan body`);
    assert.ok(overhang.z > 0, `${p.id} overhang must project forward`);
    const body = report.parts.find((x) => x.name === 'body');
    const roof = report.parts.find((x) => x.name === 'roof');
    const service = report.parts.find((x) => x.name === 'service');
    assert.ok(body.h > service.h, `${p.id} body ${body.h} must be taller than door ${service.h}`);
    const gap = (roof.y - roof.h / 2) - (body.y + body.h / 2);
    assert.ok(gap >= -0.02 && gap < 0.45, `${p.id} roof gap ${gap.toFixed(2)} m`);
    assert.ok(service.z < 0, `${p.id} service door on rear`);
    const queues = report.parts.filter((x) => x.name === 'queue');
    assert.ok(queues.length >= 6, `${p.id} queue rails+posts ${queues.length}`);
    if (p.role === 'station') {
      assert.ok(queues.length >= 20, `${p.id} zig queue parts ${queues.length}`);
      assert.ok(queues.some((x) => x.yaw), `${p.id} zig bars need yaw`);
      assert.ok(queues.some((x) => x.w > 4), `${p.id} zig bar width`);
    } else {
      assert.ok(queues[0].h >= 1.0 && queues[0].h <= 1.12, `${p.id} queue H ${queues[0].h}`);
    }
    if (p.role === 'gate') {
      const rail = queues.find((x) => x.d > 1);
      assert.ok(rail && rail.d <= 2.25, `${p.id} gate queue ${rail && rail.d} must stay ~2.2 m`);
    }
    for (const name of FACADE_PARTS) {
      const hit = report.parts.find((x) => x.name === name);
      assert.ok(hit && hit.w > 0 && hit.h > 0 && hit.d > 0, `${p.id} ${name}`);
    }
  }
});

test('skuKit is a callable emit unit (not regex bait)', () => {
  const fake = { sku: 'kiosk', land: 'The Block', w: 3.8, d: 3.8, h: 3.15, x: 0, z: 0, yaw: 0 };
  const names = [];
  skuKit(fake, {
    box(desc) {
      names.push(desc.name);
      assert.ok(desc.w > 0 && desc.h > 0 && desc.d > 0);
    },
  });
  for (const name of FACADE_PARTS) assert.ok(names.includes(name), name);
  collectSkuKit(fake);
});

test('index.html mounts sku-kit and drives GATE/STATIONS footprints', () => {
  const src = readFileSync(join(here, 'index.html'), 'utf8');
  assert.match(src, /import \{ addSkuKit \} from ['"]\.\/sku-kit\.js['"]/);
  assert.match(src, /addSkuKit/);
  assert.match(src, /GATE\.forEach/);
  assert.match(src, /STATIONS\.forEach\(rideStation\)/);
  assert.match(src, /function rideStation\(s\)/);
  assert.match(src, /s\.w/);
  assert.match(src, />Walk</);
  assert.match(src, />3rd</);
  assert.match(src, />Drone</);
  const landBinds = [
    /import \{[^}]*\bLAND_PALETTE\b/.test(src),
    /const \{\s*[^}]*\bLAND_PALETTE\b/.test(src),
  ].filter(Boolean).length;
  assert.equal(landBinds, 1, 'LAND_PALETTE must be bound once (duplicate is a SyntaxError)');
  assert.doesNotMatch(src, /overhang\s*=\s*null/);
  assert.doesNotMatch(src, /BoxGeometry\(14,0\.32,7\.5\)/);
  assert.match(src, /deckH=1\.1/);
  assert.doesNotMatch(src, /gap\+GATE\[0\]\.w\),3\.4/);
  assert.doesNotMatch(src, /BoxGeometry\(b\.w,b\.h\*0\.56,b\.d\)/);
  assert.doesNotMatch(src, /BoxGeometry\(1\.7,2\.7,0\.12\)/);
  assert.match(src, /BoxGeometry\(1\.1,2\.1,0\.12\)/);
  assert.doesNotMatch(src, /\bhotel\b/i);
  assert.doesNotMatch(src, /\belevator\b/i);
});
