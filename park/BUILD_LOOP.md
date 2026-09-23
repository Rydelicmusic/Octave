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

## Binge queue — 2026-09-23 00:33 CDT
Battery this pass: `node --test park/rides/ride-test.js` — 12 pass, 0 fail.
Hero lap returns to the station, climbs above 28 m, seam 0, no spine or hub hits.
Second closed coaster: ride-board-family on The Board. Sequential board only (one train, canDispatch blocks a second dispatch while the first is out).

### Binge 1 — ride the park
1/25 Boot. tickMotion, addAttraction, armAttractions, hookRideStack, publishRideHooks. Import scan of park/rides clean.
2/25 ride-test.js wired. 12 tests, including lap, seam, NaN, frame, dispatch.
3/25 Block coaster. Thicker emissive rails, 0.62 m supports, 4-car train, station offset off the heartline so the track reads.
4/25 Loop, corkscrew, helix, second loop still on version 3. Inversion sample required.
5/25 Block launch v2. Spike, twist, airtime, closed return, 2 cars.
6/25 Board wheel. Radius 14 m, 16 gondolas.
7/25 Board swings. 20 m mast, 12 seats.
8/25 Hours dark 1. Six timed show beats, interior path, board the car.
9/25 Hours dark 2. Seven beats, wider hall.
10/25 Pocket spin. Eight bumper cars.
11/25 Pocket kiddie. Person-scale seats, apex under 4 m, closed lap.
12/25 Board drop on ride-board-drop. Climb, hang, drop, reset.
13/25 HUD lists every id including Board Family and Board Drop. Esc calls exitRide. Ride again only when the block is clear.
14/25 Stations keep queue rails, load gate, exit photo, merch stub. Coaster shed shifted +12 m so it does not swallow the rails.
15/25 Ties, lift dogs, brake fins, tunnel shells, trim lights.
16/25 Arc-length step, 2 s hold, seam 0. Lap elapsed landed between 15 s and 180 s in the dry run.
17/25 Launch v2 airtime kept. Hero opening speed raised so the lift is reachable.
18/25 Night steel. Rail emissive, parade practicals, no water.
19/25 playRideBed / clickLift / stopRideBed.
20/25 Support samples are the heartline feet. landOk violations 0 on hero, launch, family, kiddie, both darks.
21/25 Battery 12/12 after the speed and family additions.
22/25 Fence posts and banners. Parade lamps at x=±9.2, outside occupiesSpine.
23/25 Camera shake with speed. Lift click while boarded.
24/25 Second loop remains the extra inversion on the hero.
25/25 Integration. seed-rides imports the ride stack and park-ops. Drive 2026-09-23-BINGE1-rides-heavy.

### Binge 2 — park ops
26/50 Hero lap confirmed in ride-test (ok, maxY > 28, seam 0). No boot break. Did not open a new land.
27/50 canDispatch. One train. rideAgain refuses while the train is on the course.
28/50 Ride again resets s to 0 and the 2 s hold. Same samples. POV stays on ride.lead.
29/50 Storage siding rails beside the Block station. Points that fail landOk are skipped.
30/50 ride-board-family. Closed oval north of the wheel, lift to about 16 m, 3 cars.
31/50 Family coaster uses the same rail, support, tie, and station builder.
32/50 Games row: Ring Toss, Balloon Pop, Bottle Stand. Only plazas that pass landOk.
33/50 Food carts, shade, trash on Block, After Hours, Board, Pocket.
34/50 Parade lamps down the existing spine at x=±9.2. spineSideOk required. No building on the 14 m road.
35/50 Wait stubs: YOU ARE HERE 12 MIN at Block, WHEEL 8 MIN at Board.
36/50 Photo pass boxes at two exits that pass landOk.
37/50 Wheel still 16 gondolas with a station shed north of the axle.
38/50 Dark show beats: 6 and 7 timed events.
39/50 Lift click plus the oscillator bed on the boarded ride. Brakes are the slow samples at each station.
40/50 Sequential board only. A second camera is not parented. canDispatch documents the block.
41/50 Drop phase: climb to 0.55, hang to 0.70, drop, bounce, reset.
42/50 Pocket spin bumper mesh is the orbit you board.
43/50 Station queues stay 4 lanes, about 6 m, off the spine.
44/50 ride-test v2 covers lap time, second coaster closed, parade spine, show-beat count.
45/50 Same run, 12 pass, 0 fail. Nothing left red.
46/50 Chain dogs, brake fins, station roof and open walls, rail cross-section 0.22 m.
47/50 Gate MAP and TURNSTILE blades at x=±16, z=206. Skipped if they hit the spine.
48/50 Rails, ties, supports, parade lamps, and fences are InstancedMesh. One tab, one clock.
49/50 Walk audit: open the park in Walk. Gate is (0, +230), spawn looks north down the 14 m spine. Turn left into The Block or press Block Coaster. The train holds 2 s, climbs the lit lift, drops, takes the loop, corkscrew, helix, and second loop, then brakes into the station. Esc returns to Walk. Press Board Wheel and the view sits in a gondola. Ride again only works when the train is back in the station.
50/50 Drive 2026-09-23-BINGE2-ops. Commit binge 2/2 cycle 50/50 park ops. No hotel. No water. No third binge.
Shipped both binges. Live park must still load.
