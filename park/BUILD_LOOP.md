# BUILD LOOP
Date: 2026-09-20 20:29 CDT
Hands: Grok Build. Chat is not the worker.
Canon: park/LAYOUT.md XZ + park/DIRECTOR_LOCK.md (dated locks win).

## This run
LOOK → strip water → clean hub → keep roads → one commit.

## Priority queue
W1. Delete all water meshes / pond discs / lake materials. Fill with park ground. This is a park.
H1. Hub only r18 + r32 + 14 m spine gaps. No stacked rings. No trees inside r32.
R1. Keep / finish hub ring + land drives. Not more grass.
Then ride kiosks on pads, not on y=0.

park/ only. One small file + one wire per pass.

## Cycle 1 — 2026-09-22
File: park/park-kit.js. Wire: one import in park/rides/seed-rides.js.
Checked: kitClear vs occupiesSpine, hub r32, nearRing; land names The Block / After Hours / The Board / The Pocket; queue poses on the eight claimed rides; no water mesh; cameras untouched. lock.test + test-placement 23 pass.
Pass: arches, plaza paint, lamps, trash, path edges, queue switchbacks stay off spine and hub.
Fail: gate landmark absent; ride vehicles still static; Halloween skin absent; main not updated until this commit.
Next: park/gate-icon.js at Gate (0,+230), one wire.

## Cycle 2 — 2026-09-22
File: park/gate-icon.js. Wire: one import in park/rides/seed-rides.js.
Checked: piers (±10, 216) and map/ticket props pass gateClear (occupiesSpine, hub r32, nearRing). Crown mesh anchor is (0, +230) overhead in the wing opening. No ground foot on the spine. No water. Cameras untouched. Crown spins on its own RAF.
Pass: first view is the RYDELIC PARK arch; tickets and map are props, not a new building SKU.
Fail: ride vehicles still static; Halloween skin absent; land beds absent.
Next: park/halloween/haunt-scene.js night skin, one wire.

## Cycle 3 — 2026-09-22
File: park/halloween/haunt-scene.js. Wire: one import in park/rides/seed-rides.js.
Checked: four pumpkins and four bat orbits pass hauntClear (occupiesSpine, hub r32, nearRing). Pumpkins sit inside their land canopies. Moon stays in the sky. Fog color/near only; fog.far left for Walk / 3rd / Above. No water.
Pass: night clear, moon orbit, pumpkin bob and flicker, bat orbit. Land materials untouched.
Fail: ride vehicles still static; land beds absent.
Next: park/rides/attractions.js motion on the eight claimed pads, one wire.

## Cycle 4 — 2026-09-22
File: park/rides/attractions.js. Wire: one import in park/rides/seed-rides.js.
Checked: eight existing ids kept. Exit photos pass rideClear and sit in their land canopy, outside the mass pad. Types: Block launch/coaster, Hours dark, Board wheel/swings, Pocket spin/kiddie. Motion registry self-starts. claimRide/markRide untouched. No new spine or hub lot. No water.
Pass: queue already in the kit; load posts, moving vehicle, unload posts, exit frame on each pad.
Fail: land beds absent.
Next: park/land-beds.js emissive trim and music-bed stub, one wire.

## Cycle 5 — 2026-09-22
File: park/land-beds.js. Wire: one import in park/rides/seed-rides.js.
Checked: four trims pass bedClear (occupiesSpine, hub r32, nearRing) and sit in their canopy. playLandBed returns src null. No rings. No water. Cameras untouched. Emissive pulse is its own RAF.
Pass: music-bed hook stubbed. Trim is land color, not a new lot on the spine.
Ship gates: footprint still the locked park; gate arch + crown, spine untouched, four land arches, eight rides moving; ground not removed; no water added; motion does not need an index.html rewrite.
Next: none. Five cycles spent. Drive copy of these files is the handoff, not another park rewrite.

## Heavy rides — 2026-09-23 00:30 CDT
25 cycles. Battery at the end of the stack: `node --test park/rides/ride-test.js` — 8 pass, 0 fail.
Hero coaster v3: 558 samples, apex 33.3 m, length about 494 m, seam 0, 4 cars, loop + corkscrew + helix + second loop. Off spine, off hub, inside The Block.

1/25 Boot. attractions.js exports tickMotion, addAttraction, armAttractions, mountAttractions, attractionRows. No ride-module import cycle. path-math, ride-cam, ride-runtime, ride-test added.
2/25 Block coaster v1. Lift to 33 m, drop, airtime, brakes, station, ribbon rails, ties, supports, 4-car train.
3/25 Block coaster v2/v3. Vertical loop, corkscrew, helix, second wraparound loop. Test requires an inversion sample.
4/25 Block launch v2. Spike to 30 m, full twist, extra airtime hill, closed return, 2-car train.
5/25 Board wheel. Radius 14 m, 16 gondolas, 12 spokes, station, boardable gondola eye.
6/25 Board swings. 20 m mast, 12 chains and seats, fly-out, boardable seat.
7/25 After Hours dark 1. Show building, interior path, timed props, one car.
8/25 After Hours dark 2. Wider hall, five show beats, different path.
9/25 Pocket spin. 8 bumper cars on a 6.5 m deck.
10/25 Pocket kiddie. Closed figure track, apex under 4 m, 3 cars, still a lap.
11/25 Board drop. 28 m mast, climb-hold-drop cabin, id ride-board-drop.
12/25 ride-cam HUD lists all 9 ids. Esc clears the board. Look vector follows the tangent. Bank uses the track up.
13/25 Stations. Queue rails, load gate, name sign, exit frame, merch stub on every built ride.
14/25 Track dress. Trim lamps, chain dogs, brake fins, tunnel shells, point lights.
15/25 Motion. Arc-length step, per-sample speed, 2 s station hold, lap wrap with seam 0.
16/25 Launch path v2. Extra airtime between the spike and the return. blockCoaster v3 kept as the hero.
17/25 Night practicals. Emissive rails, lamps, dark-ride show beats. No water.
18/25 Audio stub. playRideBed / clickLift / stopRideBed. Oscillator if AudioContext exists, otherwise a silent hook.
19/25 Support feet. Every heartline sample passed landOk (stadium, canopy, occupiesSpine, hub, Pocket rings). Violations 0.
20/25 Full battery. 8 tests, 8 pass: named exports, tickMotion, hero lap, launch/kiddie/dark, south-facing right is west, dry-run lap, seam, camera api.
21/25 Density. Perimeter fence posts and banners along the coaster samples.
22/25 Feel. Camera shake scales with speed. Lift click while boarded.
23/25 Extra inversion. Hero version 3 adds a second loop after the helix.
24/25 Integration. seed-rides.js imports attractions, ride-cam, ride-runtime, ride-audio. Import scan of park/rides found zero missing names.
25/25 Ship. Same battery still 8/8. Commit cycle 25/25 heavy rides. Drive folder 2026-09-23-0030-CDT-rides-heavy.
