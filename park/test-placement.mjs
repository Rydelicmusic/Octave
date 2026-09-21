import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  LOCK, BUILDINGS, GATE, STATIONS, PLACEMENTS, LAND_PALETTE,
  occupancyAABB, hitsHub, hitsSpine, hitsWater, hitsRail,
  placementIssues, stationBesideRing, inCanopy, canPlaceBuilding,
  GROUNDS_SCALE, treeMetrics, waterCopingSegments, lakesideRibbonMesh,
  hubBedCenters, occupiesSpine, canPlaceSoft, beltTreePositions,
  inWater, nearRing,
} from './lock.js';
import { FACADE_PARTS, collectSkuKit, skuKitReport, skuKit, paletteFor } from './sku-kit.js';
import { ROAD_W, ROAD_DECK, HUB_RING_R, LAND_DRIVES, roadOk, roadGradeY, hubRingPoints } from './roads.js';
import { HUB_INNER, HUB_OUTER, HUB_T_JUNCTIONS, inHubDisc } from './hub-clean.js';
import { BLOCK_WATERS, BLOCK_DRIVE_AROUND, BERM_M, inBlockWater, roadClearsBlockWater } from './water-clean.js';
import { DRY_FOOTPRINTS, RING_XZ } from './dry-park.js';
import { parkToGeo } from './gps-hud.js';
import { GRID_MINOR, GRID_MAJOR, cellId } from './grid-overlay.js';
import { seedPark, claim, treeLot, lots, clearDynamic, whyBlocked, dump } from './occupy.js';

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
  assert.deepEqual(LOCK.canopies['The Pocket'], { cx: 80, cz: 105, rx: 95, rz: 80 });
  const layout = readFileSync(join(here, 'LAYOUT.md'), 'utf8');
  assert.match(layout, /760\s*[×x]\s*460/);
  assert.match(layout, /\(80,\s*105,\s*95,\s*80\)/);
  assert.equal(LOCK.A * 2, 760);
  assert.equal(LOCK.B * 2, 460);
  assert.equal(LOCK.capR, 230);
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
    const bodies = report.parts.filter((x) => x.name === 'body');
    assert.ok(bodies.length >= 3, `${p.id} Pass 51 mid-block body parts ${bodies.length}`);
    const wins = report.parts.filter((x) => x.name === 'window');
    assert.ok(wins.length >= 3, `${p.id} Pass 51 muntins/windows ${wins.length}`);
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

test('hub ring road on r32 and 9 m land drives skip spine water rings', () => {
  assert.equal(HUB_RING_R, LOCK.hubOuter);
  assert.equal(HUB_RING_R, 32);
  assert.ok(ROAD_W >= 8 && ROAD_W <= 10);
  assert.notEqual(ROAD_W, LOCK.spineWidth);
  assert.equal(LAND_DRIVES.length, 4);
  const lands = LAND_DRIVES.map((d) => d.land).sort();
  assert.deepEqual(lands, ['After Hours', 'The Block', 'The Board', 'The Pocket']);
  for (const d of LAND_DRIVES) {
    assert.ok(d.pts.length >= 3, d.id);
    for (let i = 0; i < d.pts.length - 1; i++) {
      const mx = (d.pts[i][0] + d.pts[i + 1][0]) / 2;
      const mz = (d.pts[i][1] + d.pts[i + 1][1]) / 2;
      assert.equal(roadOk(mx, mz), true, d.id + ' ' + mx + ',' + mz);
      assert.equal(occupiesSpine(mx, mz, ROAD_W / 2), false, d.id + ' second spine');
      assert.equal(inWater(mx, mz, 0.8), false, d.id + ' water');
      assert.equal(nearRing(mx, mz, 8), false, d.id + ' rings');
    }
  }
  const ring = hubRingPoints();
  const drawn = ring.filter(Boolean);
  assert.ok(drawn.length >= 70, 'ring must read from drone, got ' + drawn.length);
  for (const [x, z] of drawn) {
    assert.ok(Math.hypot(x, z) >= HUB_RING_R - 0.05, 'inner lip r32');
    assert.equal(occupiesSpine(x, z, ROAD_W / 2), false);
    assert.equal(inWater(x, z, 0.8), false);
    assert.equal(nearRing(x, z, 8), false);
  }
  assert.equal(roadGradeY(), ROAD_DECK);
  const src = readFileSync(join(here, 'index.html'), 'utf8');
  assert.match(src, /from ['"]\.\/roads\.js(\?[^'"]*)?['"]/);
  assert.match(src, /addParkRoads\(THREE,scene\)/);
  assert.doesNotMatch(src, /\bhotel\b/i);
});

test('hub-clean is r18 plaza + r32 curb T-junctions, no plaza sheds', () => {
  assert.equal(HUB_INNER, 18);
  assert.equal(HUB_OUTER, 32);
  assert.equal(HUB_INNER, LOCK.hubInner);
  assert.equal(HUB_OUTER, LOCK.hubOuter);
  assert.equal(HUB_T_JUNCTIONS.length, 4);
  const lands = HUB_T_JUNCTIONS.map((t) => t.land).sort();
  assert.deepEqual(lands, ['After Hours', 'The Block', 'The Board', 'The Pocket']);
  for (const t of HUB_T_JUNCTIONS) {
    assert.ok(Math.abs(Math.hypot(t.x, t.z) - HUB_OUTER) < 0.05, t.land + ' on r32');
    assert.equal(occupiesSpine(t.x, t.z, ROAD_W / 2), false, t.land + ' cuts spine');
    assert.equal(inHubDisc(t.x, t.z, HUB_OUTER - 0.05), false, t.land + ' inside disc');
  }
  for (const b of BUILDINGS) {
    assert.equal(inHubDisc(b.x, b.z), false, b.id + ' shed on plaza');
  }
  const src = readFileSync(join(here, 'index.html'), 'utf8');
  assert.match(src, /from ['"]\.\/hub-clean\.js(\?[^'"]*)?['"]/);
  assert.match(src, /addHubClean\(THREE,scene\)/);
  assert.doesNotMatch(src, /\bhotel\b/i);
});

test('Block water is one pool per locked ellipse, drive around with 4 m berm', () => {
  assert.equal(BERM_M, 4);
  assert.equal(BLOCK_WATERS.length, 5);
  const expected = LOCK.waters.filter(([x, z]) => inCanopy(x, z, 'The Block'));
  assert.deepEqual(BLOCK_WATERS, expected);
  const layout = [
    [-210, -20, 48, 70],
    [-165, 10, 55, 42],
    [-120, 70, 32, 26],
    [-95, -85, 28, 22],
    [-150, -40, 24, 18],
  ];
  assert.deepEqual(BLOCK_WATERS, layout);
  assert.ok(BLOCK_DRIVE_AROUND.length >= 4);
  assert.ok(Math.abs(BLOCK_DRIVE_AROUND[0][0] + 41) < 12, 'T off hub r32');
  for (let i = 0; i < BLOCK_DRIVE_AROUND.length - 1; i++) {
    const [x0, z0] = BLOCK_DRIVE_AROUND[i];
    const [x1, z1] = BLOCK_DRIVE_AROUND[i + 1];
    const len = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.max(2, Math.ceil(len / 3));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const x = x0 + (x1 - x0) * t;
      const z = z0 + (z1 - z0) * t;
      assert.equal(roadClearsBlockWater(x, z), true, `drive ${x.toFixed(1)},${z.toFixed(1)}`);
      assert.equal(inBlockWater(x, z, BERM_M + ROAD_W / 2), false);
      assert.equal(occupiesSpine(x, z, ROAD_W / 2), false);
    }
  }
  const end = BLOCK_DRIVE_AROUND[BLOCK_DRIVE_AROUND.length - 1];
  assert.equal(inCanopy(end[0], end[1], 'The Block'), true);
  const src = readFileSync(join(here, 'index.html'), 'utf8');
  assert.match(src, /from ['"]\.\/water-clean\.js(\?[^'"]*)?['"]/);
  assert.match(src, /addWaterClean\(THREE,scene\)/);
  assert.doesNotMatch(src, /\bhotel\b/i);
});

test('dry-park fills every locked water ellipse with grass, no new water, rings unmoved', () => {
  assert.equal(DRY_FOOTPRINTS.length, LOCK.waters.length);
  assert.equal(DRY_FOOTPRINTS.length, 12);
  DRY_FOOTPRINTS.forEach((p, i) => {
    const [x, z, rx, rz] = LOCK.waters[i];
    assert.equal(p.x, x);
    assert.equal(p.z, z);
    assert.equal(p.rx, rx);
    assert.equal(p.rz, rz);
  });
  assert.equal(RING_XZ[0].x, 95);
  assert.equal(RING_XZ[0].z, 95);
  assert.equal(RING_XZ[0].inner, 14);
  assert.equal(RING_XZ[0].outer, 20);
  assert.equal(RING_XZ[1].x, 118);
  assert.equal(RING_XZ[1].z, 108);
  assert.equal(RING_XZ[1].inner, 6);
  assert.equal(RING_XZ[1].outer, 11);
  const drySrc = readFileSync(join(here, 'dry-park.js'), 'utf8');
  assert.doesNotMatch(drySrc, /new THREE\.MeshPhongMaterial/);
  assert.match(drySrc, /MATERIALS\.grass/);
  const src = readFileSync(join(here, 'index.html'), 'utf8');
  assert.match(src, /from ['"]\.\/dry-park\.js(\?[^'"]*)?['"]/);
  assert.match(src, /addDryPark\(THREE,scene\)/);
  assert.doesNotMatch(src, /\bhotel\b/i);
});

test('GPS HUD wires walk player pos, CRS hub/gate, stays top-right', () => {
  const hub = parkToGeo(0, 0);
  assert.equal(hub.cell, 'G0,0');
  assert.ok(Math.abs(hub.lat - 29.973) < 1e-8);
  assert.ok(Math.abs(hub.lng + 95.694) < 1e-8);
  const gate = parkToGeo(0, 230);
  assert.equal(gate.cell, 'G0,9');
  assert.ok(Math.abs(gate.lat - (29.973 - 230 / 111320)) < 1e-8);
  assert.ok(Math.abs(gate.lng + 95.694) < 1e-8);
  const src = readFileSync(join(here, 'index.html'), 'utf8');
  assert.match(src, /import \{ mountGpsHud \} from '\.\/gps-hud\.js'/);
  assert.match(src, /mountGpsHud\(\(\) => \(mode==='above'\|\|mode==='drone'\?drone:pos\)\)/);
  assert.match(src, /\.hud\{position:fixed;left:12px;bottom:12px/);
  assert.doesNotMatch(src, /#rydelic-gps\{[^}]*bottom:/);
  const hudJs = readFileSync(join(here, 'gps-hud.js'), 'utf8');
  assert.match(hudJs, /top:14px/);
  assert.match(hudJs, /right:14px/);
  assert.doesNotMatch(src, /\bhotel\b/i);
});

test('CRS ground grid is 25 m minor / 100 m major with G-cell labels', () => {
  assert.equal(GRID_MINOR, 25);
  assert.equal(GRID_MAJOR, 100);
  assert.equal(cellId(0, 0), 'G0,0');
  assert.equal(cellId(160, 10), 'G6,0');
  assert.equal(cellId(0, 230), 'G0,9');
  assert.equal(cellId(-165, -10), 'G-7,-1');
  assert.equal(cellId(80, 105), 'G3,4');
  const src = readFileSync(join(here, 'index.html'), 'utf8');
  assert.match(src, /from ['"]\.\/grid-overlay\.js['"]/);
  assert.match(src, /addParkGrid\(THREE,scene\)/);
  assert.match(src, /parkGrid\.setMode\(m\)/);
  assert.doesNotMatch(src, /\bhotel\b/i);
});

test('occupy lots: seed locked volumes, trees skip overlap, no spine nudge', () => {
  clearDynamic();
  const seeded = seedPark(LOCK, BUILDINGS, GATE, STATIONS);
  assert.equal(seeded.locked, BUILDINGS.length + GATE.length + STATIONS.length);
  assert.equal(seeded.spine, true);
  assert.equal(seeded.plates, 4);
  const hall = BUILDINGS.find((b) => b.id === 'block-album');
  assert.equal(claim(treeLot('tree-on-hall', hall.x, hall.z, 4)), false);
  assert.ok(whyBlocked(treeLot('tree-on-hall', hall.x, hall.z, 4)).some((h) => h.id === hall.id));
  assert.equal(occupiesSpine(0, 80, 4), true);
  const onSpine = { id: 'nudge-spine', kind: 'kiosk', x: 0, z: 80, w: 4, d: 4, pad: 2 };
  assert.ok(whyBlocked(onSpine).some((h) => h.id === 'spine-14'));
  assert.equal(claim(onSpine), false);
  const hubTree = treeLot('tree-on-hub', 0, 0, 3);
  assert.ok(whyBlocked(hubTree).some((h) => h.id === 'spine-14') || Math.hypot(0, 0) < 32);
  assert.equal(claim(hubTree), false);
  const src = readFileSync(join(here, 'index.html'), 'utf8');
  assert.match(src, /from ['"]\.\/occupy\.js['"]/);
  assert.match(src, /seedPark\(LOCK, BUILDINGS, GATE, STATIONS\)/);
  assert.match(src, /whyBlocked\(/);
  assert.match(src, /claim\(treeLot\(/);
  assert.match(src, /claimStruct\(/);
  assert.match(src, /__parkOccupyDump=dump\(\)/);
  assert.match(src, /__parkGpsGet/);
  assert.doesNotMatch(src, /\bhotel\b/i);
  assert.doesNotMatch(src, /Math\.random\(\)/);
  assert.ok(lots().length >= seeded.locked + 1 + seeded.plates);
  writeFileSync(join(here, 'occupy-map.json'), JSON.stringify(dump(), null, 2) + '\n');
  const map = JSON.parse(readFileSync(join(here, 'occupy-map.json'), 'utf8'));
  assert.equal(map.crs, 'park/CRS.md');
  assert.equal(map.index, '25m-hash');
  for (const id of ['spine-14', 'block-album', 'gate-west', 'plate-block', 'plate-hours', 'plate-board', 'plate-pocket']) {
    assert.ok(map.lots.some((l) => l.id === id), id);
  }
  for (const l of map.lots) {
    assert.equal(typeof l.id, 'string');
    assert.equal(typeof l.kind, 'string');
    assert.equal(typeof l.layer, 'string');
    assert.equal(typeof l.x, 'number');
    assert.equal(typeof l.z, 'number');
    assert.equal(typeof l.w, 'number');
    assert.equal(typeof l.d, 'number');
    assert.match(l.cell, /^G-?\d+,-?\d+$/);
  }
  const spine = map.lots.find((l) => l.id === 'spine-14');
  assert.equal(spine.cell, 'G0,0');
  const board = map.lots.find((l) => l.id === 'plate-board');
  assert.equal(board.x, 160);
  assert.equal(board.z, 10);
  assert.equal(board.cell, 'G6,0');
});

test('shipped GROUNDS_SCALE meters are the lock return values drawn in index.html', () => {
  assert.equal(GROUNDS_SCALE.lakesideW, 3.2);
  assert.equal(GROUNDS_SCALE.lampH, 3.6);
  assert.equal(GROUNDS_SCALE.copingW, 0.5);
  assert.equal(GROUNDS_SCALE.copingH, 0.32);
  assert.equal(GROUNDS_SCALE.hubBedH, 0.38);
  assert.equal(GROUNDS_SCALE.benchSeat, 0.45);
  assert.deepEqual(GROUNDS_SCALE.treeTrunkH, [5.2, 11.2]);
  const [cx, cz, rx, rz] = LOCK.waters[0];
  const cope = waterCopingSegments(cx, cz, rx, rz);
  assert.ok(cope.length >= 24);
  for (const s of cope) {
    assert.equal(s.w, GROUNDS_SCALE.copingW);
    assert.equal(s.w, 0.5);
  }
  const mesh = lakesideRibbonMesh(cx, cz, rx, rz);
  assert.ok(mesh.segs.length > 8);
  for (const s of mesh.segs) {
    assert.equal(s.w, GROUNDS_SCALE.lakesideW);
    assert.equal(occupiesSpine(s.x, s.z, s.w / 2), false);
  }
  const m0 = treeMetrics(1, 0);
  assert.ok(m0.trunkH >= 5.2 && m0.trunkH <= 11.2);
  assert.ok(m0.trunkR >= 0.12 && m0.trunkR <= 0.28);
  assert.equal(hubBedCenters().length, 8);
  assert.equal(canPlaceSoft(0, 120, 1), false);
  const src = readFileSync(join(here, 'index.html'), 'utf8');
  assert.match(src, /waterCopingSegments/);
  assert.match(src, /GROUNDS_SCALE\.copingH/);
  assert.match(src, /GROUNDS_SCALE\.lakesideW|lakesideRibbonMesh|PATH_SCALE\.lakesideW/);
  assert.match(src, /GROUNDS_SCALE\.lampH/);
  assert.match(src, /GROUNDS_SCALE\.benchSeat/);
  assert.match(src, /GROUNDS_SCALE\.hubBedH/);
  assert.match(src, /treeMetrics/);
  assert.match(src, /beltTreePositions/);
  assert.match(src, /function lamp/);
  assert.match(src, /benchAt/);
  for (const name of ['west lakes', 'SE grove', 'north split']) {
    assert.ok(beltTreePositions(name).length >= 40, name);
  }
});

test('3D page mounts SKU kit on GATE / STATIONS / land SKUs after grounds merge', () => {
  const src = readFileSync(join(here, 'index.html'), 'utf8');
  assert.match(src, /addSkuKit\(THREE,scene,wing\)/);
  assert.match(src, /addSkuKit\(THREE,scene,s\)/);
  assert.match(src, /addSkuKit\(THREE,scene,b\)/);
  assert.match(src, /sku===['"]kiosk['"]/);
  for (const b of BUILDINGS) {
    assert.ok(canPlaceBuilding(b), b.id);
    assert.equal(hitsSpine(occupancyAABB(b)), false, b.id);
    assert.equal(hitsWater(occupancyAABB(b)), false, b.id);
  }
  for (const g of GATE) {
    const report = skuKitReport(g);
    assert.equal(report.ok, true, g.id);
  }
  for (const s of STATIONS) {
    const report = skuKitReport(s);
    assert.equal(report.ok, true, s.id);
  }
});
