// VIME slice — Ori Hale artist-room door: placement vs LAYOUT.md locks + label/URL strings.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { LOCK, BUILDINGS, GATE, STATIONS, inStadium, inWater, inCanopy, onSpine, occupiesSpine, nearRing } from './lock.js';
import { ARTIST_DOOR as D, doorUrl, doorActive } from './artist-door.js';

const here = dirname(fileURLToPath(import.meta.url));
const corners = () => {
  const hw = D.w / 2, hd = D.d / 2;
  return [[D.x, D.z], [D.x - hw, D.z - hd], [D.x + hw, D.z - hd], [D.x - hw, D.z + hd], [D.x + hw, D.z + hd]];
};

test('door strings', () => {
  assert.equal(D.label, 'Ori Hale — room');
  assert.equal(D.target, '../vime/?artist=ori-hale');
  assert.equal(doorUrl('https://rydelicmusic.github.io/octave/park/'), 'https://rydelicmusic.github.io/octave/vime/?artist=ori-hale');
  assert.equal(doorUrl('https://rydelicmusic.github.io/octave/park/index.html#drone'), 'https://rydelicmusic.github.io/octave/vime/?artist=ori-hale');
  assert.equal(doorUrl('http://localhost:8765/park/'), 'http://localhost:8765/vime/?artist=ori-hale');
});

test('door sits in The Pocket, +Z Gate arrival, off the 14 m spine', () => {
  assert.ok(D.z > 0 && D.z < LOCK.gate.z, 'south (+Z) of hub, inside the Gate');
  assert.ok(LOCK.gate.z - D.z <= 40, 'near the Gate arrival');
  for (const [x, z] of corners()) {
    assert.ok(inStadium(x, z));
    assert.equal(onSpine(x, z), false, 'on spine ' + x + ',' + z);
    assert.equal(occupiesSpine(x, z), false);
    assert.ok(Math.abs(x) >= LOCK.spineWidth / 2 + 0.5);
    assert.equal(inWater(x, z, 2), false);
    assert.equal(nearRing(x, z, 8), false);
    assert.ok(Math.hypot(x, z) > LOCK.hubOuter);
  }
  assert.ok(inCanopy(D.x, D.z, 'The Pocket') || Math.abs(D.x) < 20, 'Pocket corridor');
});

test('door clears BUILDINGS / GATE / STATIONS footprints (2 m pad)', () => {
  for (const b of [...BUILDINGS, ...GATE, ...STATIONS]) {
    const gapX = Math.abs(D.x - b.x) - (D.w + b.w) / 2;
    const gapZ = Math.abs(D.z - b.z) - (D.d + b.d) / 2;
    assert.ok(gapX >= 2 || gapZ >= 2, 'overlaps ' + b.id);
  }
});

test('door reachable on foot from spawn and gated by mode', () => {
  // spawn pos in park/index.html: (0, EYE, B-6)
  const sx = 0, sz = LOCK.B - 6;
  assert.ok(Math.hypot(D.x - sx, D.z - sz) < 40);
  // spine edge (|x| = 6.9) stands inside the 4 m trigger
  assert.ok(doorActive('walk', LOCK.spineWidth / 2 - 0.1, D.z));
  assert.ok(doorActive('third', D.x - 3, D.z));
  assert.equal(doorActive('above', D.x - 1, D.z), false);
  assert.equal(doorActive('walk', 0, D.z), false);
});

test('park/index.html wires the door minimally; vime back link is static', () => {
  const html = readFileSync(join(here, 'index.html'), 'utf8');
  assert.match(html, /import \{ installArtistDoor \} from '\.\/artist-door\.js/);
  assert.equal((html.match(/installArtistDoor\(\{/g) || []).length, 1);
  const src = readFileSync(join(here, 'artist-door.js'), 'utf8');
  assert.match(src, /KeyE/);
  const vime = readFileSync(join(here, '..', 'vime', 'index.html'), 'utf8');
  assert.match(vime, /<a id="back-to-park" href="\.\.\/park\/"/);
  assert.match(vime, /Back to park/);
});
