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

### Binge 3 — physics and function — 2026-09-23 00:34 CDT
The hero was already a closed coaster, so cycle 51 started on that path. No new land. No water. No hotel. Same ride ids.

51/75 park/rides/physics.js and ride-ops.js. Hero train steps s and v from the integrator. Prescribed sample.speed remains only in dryRunRide so the old lap test still times the speed table.
52/75 Block coaster energy: chain lift about 2.5 m/s, gravity on the drop to about 23.6 m/s, drag, brakes, station snap inside 1.5 m. The chain stays on until the slope goes downhill, so the crest does not stall.
53/75 IDLE/BOARDING/DISPATCH/COURSE/BRAKE/UNLOAD. Board only in BOARDING. Dispatch refused while the restraint is open.
54/75 Launch physics on ride-block-02 (Block Launch), not the hero. Hold, tangent accel spike, then the same energy model. Peak clamped at 38 m/s. Lap returns to s = 0.
55/75 Loop and helix floor. If speed would die on an inversion or a later uphill, trim assist adds force and increments trimAssist. Hero logged 2. No teleport.
56/75 blockOccupied on the hero. A second dispatch returns false. One train. Sequential board only.
57/75 Wheel ω is constant on COURSE, zero in the station. Gondola local rotation stays 0 so world up stays +Y. Board only the gondola inside the bottom 20° while ω is 0.
58/75 Swings ramp, hold, ramp down. Kick is ω²r/g. Board only at ω = 0.
59/75 Board Drop: hoist, hang, freefall under g, magnetic catch, reset. Fall rate about 21 m/s versus hoist 2.4 m/s. Pendulum θ'' = -(g/L)sinθ - drag is tested. It is not a new ride.
60/75 Dark rides cruise. Two waypoint holds (v = 0 for 0.6 s). Show panels still light from arc fraction. Board only in the station.
61/75 Pocket spin ramps and leans. Bumper cars bounce inside the ring, not against the spine. Kiddie uses the energy model and returns to load.
62/75 HUD row: phase, v, wait minutes, restraint, block. Buttons: board, Close restraint, Dispatch, E-stop, exit.
63/75 Load-gate mesh on each station. Open (y 2.35) in BOARDING, IDLE, UNLOAD. Closed (y 1.15) on the course.
64/75 Lift chain and anti-rollback dogs brighten and jog only while the chain is driving. Brake calipers glow in BRAKE.
65/75 Ride camera looks along the tangent, blends camera.up from the physics bank, and shakes with |a|. The look height stays near the rail.
66/75 park/rides/physics-test.js. runPhysicsTests() is the hook.
67/75 node --test physics-test.js ride-test.js: 13 pass, 0 fail. No new ride type.
68/75 ride-board-family uses the same integrator. Lift about 3.3 m/s, drop about 15.9 m/s, back to s = 0.
69/75 Lift click spacing follows chain speed. Drop whoosh pitch follows |v| when acceleration is strongly downhill.
70/75 Restraint close arms a 3 s auto dispatch if the guest is aboard and the block is clear. Unload dwell is 1.4 s, then BOARDING.
71/75 Integrator samples through pointInto into two reused vectors. placeCars reuses one basis matrix per frame.
72/75 Esc on COURSE, DISPATCH, or BRAKE calls e-stop. The train is towed forward to the station and unloads there. A stop at s = 181 m returned to s = 0 after the brake run. It does not jump off a loop.
73/75 Drop catch has a magnet box at 6.2 m. Brake meshes are calipers. Lift dogs refuse a negative step: s does not decrease while the chain is on.
74/75 Walk script: spawn at the Gate (0, +230) looking north. Turn left into The Block or press Block Coaster. That boards only while the phase is BOARDING. Press Close restraint. Press Dispatch (or wait 3 s). The train climbs the lit chain, drops, runs the loop, corkscrew, helix, and second loop, then brakes to s = 0 and opens the restraint. Esc mid-lap e-stops and finishes at the station. Press Board Wheel only while a gondola is parked at the bottom.
75/75 Drive folder 2026-09-23-BINGE3-physics. Commit binge 3/3 cycle 75/75 physics layer. Live park must still load.

### Binge 4 — logic and realism — 2026-09-23 00:35 CDT
Same footprint. No new land. No water. No hotel. Physics from binge 3 stays the mover. These rules sit in front of dispatch.

76/100 park/logic/clock.js. Park opens 09:00 and closes 22:00. HUD clock shows the time and OPEN or CLOSED. Day, dusk, and night come from the same clock.
77/100 ride-logic.js tables for all ten ids: hero, launch, family, wheel, swings, drop, both dark rides, spin, kiddie. Seats, thrill, height, cycle.
78/100 attemptDispatch runs before tryDispatch. Restraints, gates, block, e-stop, weather, closed, and a drop hoist fault can all refuse.
79/100 queue.js slots on every load. Join, leave, and advance when the seat frees. Posted wait is parties ahead times the cycle.
80/100 The ride button joins the queue. Board is offered only at slot 0. Leave queue frees the slot.
81/100 ticket.js Admit at the gate. Rides refuse board without it. G is the comp key.
82/100 safety.js trips every ride to brake, holds the gates shut, and a weather flag blocks dispatch until Reset safety.
83/100 Hero block sections: station, lift, course, brake. One train. A hot section refuses a second entry.
84/100 markFault sets temporarily closed and e-stops. The train keeps its arc length and brakes toward the station. It does not jump.
85/100 agents.js boots 28 guests on four land loops. After 30 s, occupiesSpine hits are 0.
86/100 Agents step into dummy seats while one seat stays open for the player. On unload they return to the plaza and the queue advances.
87/100 An attendant mesh stands at each load gate only during BOARDING.
88/100 Close-of-day sets closeAfter. The current cycle unloads, then the phase is CLOSED.
89/100 Ride lamp intensity follows day, dusk, and night. The land bed oscillator follows the same part.
90/100 A finished lap writes a photo id on the ops record. The HUD says photo ready.
91/100 Dispatch plays a bell. BRAKE hisses. Lift clicks still follow chain speed. Drop whoosh still follows speed.
92/100 Status dots for every ride: operating and cycling green, down red, closed gray.
93/100 logic-test.js battery, including the 60 s accelerated soak.
94/100 node --test logic-test.js physics-test.js ride-test.js. The course-board check now rejects COURSE before it checks the queue. No new land.
95/100 Guest cap is 28. One InstancedMesh. Riders scale out instead of spawning meshes.
96/100 Load gates open only while the station is accepting guests and the restraint is open. Chain dogs still drive only on the lift. Brake calipers still glow in BRAKE.
97/100 Board from anywhere but the load slot is refused. Mid-course board is refused.
98/100 Walk script in logic-test: admit, join Block Coaster, board, close restraint, dispatch, lap, photo id, then join the wheel queue.
99/100 60 s soak at 60× clock. No NaN. Clock lands at 11:00, still open.
100/100 Drive 2026-09-23-BINGE4-logic. Commit binge 4/4 cycle 100/100 logic realism. Live park must still load. Stop. No binge 5 until the director pastes it.

### QC — function check — 2026-09-23 00:36 CDT
No new land. No new ride type. No water. No hotel. Evidence is park/QC_LOG.md.

101/115 Boot files are present. index sets __PARK_DRY, imports seed-rides, and calls __tickRides before render. Haunt-boot does not static-import tickMotion.
102/115 park/qc/qc-boot.js. 45 files, named imports match exports.
103/115 park/qc/qc-layout.js. Four land names. Water forEach is behind __PARK_DRY. Path samples: canopy violations 0, spine hits 0, hub hits 0.
104/115 No layout FAIL. No sample was moved.
105/115 park/qc/qc-paths.js. Eight closed paths, seam 0.000. Wheel, swings, spin, and drop are SKIP because they have no rail.
106/115 No open path and no missing path car. Nothing to move.
107/115 park/qc/qc-ride.js. Six path dry laps, no NaN. Hero maxY 37.7. Wheel, swings, drop, and spin each finish a period.
108/115 Lead car name is now `${id}-car` via carName(). ride-block-01-car. Fleet vehicles stay SKIP: gondola, swing seat, drop cabin, bumper.
109/115 park/qc/qc-physics.js. Station v 0 after the lap. Drop 23.6 m/s from a 2.5 m/s lift. E-stop at s 180 stays on the rail at s 189 in BRAKE.
110/115 park/qc/qc-logic.js. Board at load. COURSE rejects board. Open restraints refuse dispatch. Queue advances. E-stop is BRAKE. Close-of-day ends CLOSED.
111/115 park/qc/qc-perf.js. Agent cap 28. 60 s soak, 2 ms, no NaN, spine hits 0. 1899 path samples. Live mesh count is SKIP in headless.
112/115 The same soak is inside qc-run.js. No NaN.
113/115 park/QC_WALK.md. Gate, spine, Block Coaster, board, lap, exit, wheel.
114/115 node park/qc/qc-run.js — pass 46, fail 0, skip 9. ride-test.js 12 pass. Zero boot FAILs. No feature FAIL left over.
115/115 Drive 2026-09-23-BINGE-QC. Commit QC 115/115 function check.
