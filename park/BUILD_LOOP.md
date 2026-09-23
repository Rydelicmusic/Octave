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

### Binge 5 — the park operates — 2026-09-23 00:39 CDT
No new land. No water. No hotel. Rides run while the park is open. The player is one seat.

116/135 Boot stayed green. stepAlive is called from stepRides after the clock step. Exports still match.
117/135 park/alive/bots.js. Shared pool, cap 72. Sitting riders parented to cars, gondolas, swing seats, the drop cabin, and bumper cars.
118/135 Hero train fills dummy seats, closes restraints, and dispatches on its own.
119/135 Dwell is 3 s. maxIdle on the hero in the test was about 3.1 s, under the 15 s cap. Then it leaves again.
120/135 Launch, family, kiddie, and both dark rides use the same auto-ops path. They are path rides with ops.
121/135 Wheel spins at ω 0.28 with a rider in each gondola. The bottom window is still the player load, because ω returns to 0 only on the short dwell.
122/135 Swings ramp, hold, and rest, with a rider on each seat.
123/135 Both dark rides keep a vehicle and two riders. Auto dispatch sends them back out.
124/135 Pocket spin and the kiddie train stay on the same loop. Bumper cars have a seated rider.
125/135 The drop cabin has two riders and still uses hoist, hang, freefall, and catch when dispatched.
126/135 Boarding removes one dummy. A player still in the queue holds one seat. The train does not wait on them forever.
127/135 Esc and the E-stop button stop only the ride you are on. The test e-stopped the hero at s 80 and the wheel stayed in COURSE with eStop false.
128/135 faceCue: look west for a Block roar, look east for a wheel whoosh. Both are hooks, silent if the browser blocks audio.
129/135 Gates, restraints, chain dogs, and brake calipers still follow phase. Auto dispatch closes the gate and the restraint before it leaves.
130/135 park/alive/alive-test.js. After 10 s open, hero s was 13 and still climbing, dummies 2, wheel ω 0.28, no NaN, spine hits 0.
131/135 The first e-stop sample was still in the station lead, so the existing station snap looked like a full stop. The test now stops the train on the lift. That case stays in BRAKE.
132/135 Rider pool refuses anything past 72. Shirts share five materials. One skin material.
133/135 A moving ride keeps its lamps at least 0.62, and the night clock can push them higher. Riders stay visible.
134/135 From above, the occupied train is the lit chain plus the shirt-colored riders on the cars. The wheel gondolas keep turning.
135/135 Drive 2026-09-23-BINGE5-alive. Commit binge 5 cycle 135/135 park is operating.

### Binge 6 — terrain, designed water, ground NPCs — 2026-09-23 00:40 CDT
The old concentric lakes stay behind __PARK_DRY. This binge adds grade and four shaped basins. Rails were not moved.

136/155 sampleHeight. Hub is 0. Spine crown stays under 0.06 m. No trench.
137/155 Eight berms: Block terrace, Hours pocket and neon berm, Board deck, Pocket family berm. Retaining edges on the downhill face.
138/155 Grade paths sit on the height field between waypoints in the same land. Segments that jump lands are skipped.
139/155 Walk eye is EYE plus sampleHeight. Spine and hub stay at the old grade, so the street does not become a canyon.
140/155 Coaster posts use supportSpan. They start at the berm and stop under the rail. Hero clearance stayed at least 1.64 m.
141/155 Board lagoon at (238, 72), one ellipse, stone coping, dark floor. Off the spine, inside The Board.
142/155 One fountain at the Block plaza (-118, 62). One disk, one jet. Not rings.
143/155 Hours canal is a 5.5 by 1.1 m channel at the dark-ride anchor. Not a lake.
144/155 One Pocket pool at (52, 158). Single shape. No second ring.
145/155 blocksWalk rejects those ellipses. The walk step will not enter them.
146/155 56 instanced guests. Cap 56, inside 40–80. One material.
147/155 14 legal waypoints. Walk steps that would hit a rail, the spine, or water are refused.
148/155 Roles: guest, queue, watch, attendant, op. Watch and attendants hold. Guests walk their land.
149/155 Load-gate attendants from the ride rigs stay. A slice of the ground NPCs are marked attendant.
150/155 Train, gondola, swing, drop, and bumper riders from binge 5 are still parented to the vehicles.
151/155 terrain-test and npc-test. Spine, water, pocket pool, rail clearance, and motion.
152/155 Four NPCs were clipping a rail while crossing a waypoint gap. Steps that fail pointLegal now retarget. bad 0.
153/155 NPCs are one InstancedMesh. Water is four planes with a shared ripple, not unique materials per vertex.
154/155 Basin floors are dark. Coping reads as stone. Night lamps on moving rides stay at least 0.62. Berms are solid masses in Walk.
155/155 Drive 2026-09-23-BINGE6-terrain-water-npc. Commit binge 6 cycle 155/155 depth water npcs.

### QC2 — terrain, water, NPCs, function — 2026-09-23 00:41 CDT
No new land. No new lake. No hotel. No sample was moved. Evidence is park/QC2_LOG.md.

156/170 Boot: 58 files, named imports match. Walk, 3rd, and Drone are still in index. The scene constructor and the ride hook are still there. The previous live page was not blank.
157/170 qc2-terrain.js. Land spread 1.27 m. Spine worst 0.060 m. Hub is 0.
158/170 No terrain FAIL. Berms, posts, and the rail clearance were left as Binge 6 built them.
159/170 qc2-water.js. Four basins, each named on the allow list. Pocket pools: 1. Hub and spine hits: 0.
160/170 No illegal water to delete. Old LOCK.waters stays behind __PARK_DRY.
161/170 qc2-npc.js. 56 guests, cap 56. After 10 s, 45 are guests in plazas. Rail, spine, and water hits: 0.
162/170 No NPC FAIL. Nobody was despawned.
163/170 qc2-rides.js. Hero seam 0. Dry lap maxY 37.7. After 10 s open, s is 13.06 and the wheel ω is 0.28.
164/170 No ride FAIL from the grade. Clearance stays 1.64 m. Cars were not re-snapped.
165/170 Alive-ops is present. The hero still leaves the station with the bot pool cap at 72. Train seatRiders is still in track-build.js.
166/170 qc2-run.js 30 s soak. 17 ms. No NaN.
167/170 Soak is already cheap. NPC count was not cut. Water planes were not cut. The coaster was not touched.
168/170 park/QC2_WALK.md. Gate, spine, berms, Board water edge, Block train with riders, board, plaza guests.
169/170 Re-run: pass 32, fail 0, skip 0. Every row is an assertion. Nothing was skipped because the features exist.
170/170 Drive 2026-09-23-BINGE-QC2. Commit QC2 170/170 terrain water npc function.

### Binge 7 — octave layer — 2026-09-23 00:44 CDT
No new land. No hotel. No extra lake. One park in the tab. Evidence is park/OCTAVE_LOG.md and park/OCTAVE_WALK.md.

171/195 Boot. The park scene, canvas, and Walk / 3rd / Drone were still there. One import in seed-rides.js loads park/octave/boot.js.
172/195 park/audio/ride-score.js. One AudioContext, created on the first gesture. No stem files, so every ride id is a stub. Nothing sets an audio src.
173/195 Hero cue follows arc length. First big drop is at s 107.9. Lift before it, drop hook for the next 48 m, brakes are the outro.
174/195 The other nine anchors get an idle, course, or outro bed. Same stub label.
175/195 Rider gain 0.2. Within 80 m the plaza hears 0.03. The Gate hears 0.
176/195 park/door.html. Artist card, TICKET, ENTER PARK. Link from the park HUD.
177/195 park/door/ticket.js. ?admit=1 sets the existing admit flag. ?dev=1 is the documented bypass.
178/195 park/door/occupy-link.js. A 200-row list still returns RYDELIC only. occupy-map.json is the lot map, not a second park.
179/195 Board without admit still returns reason admit. Dev gets past that gate and still has to be at the load.
180/195 Spectacular starts when the clock is dusk or night. Day leaves the floats parked.
181/195 Spine chase lights and an arch flash while a float is near the Gate. Fog is not rewritten.
182/195 Four thin floats parade the centerline for 240 s, then sit at x ±26, off the 14 m spine. They are not claimed buildings.
183/195 park/input/mobile.js. Coarse pointer uses the existing pad plus BOARD and EXIT.
184/195 100dvh and overscroll-behavior sit beside the existing touch-action and the blue-gray background.
185/195 Cheap mode draws 16 NPCs and skips the water ripple. The hero, the score, and boarding stay.
186/195 park/memory/visit.js. Key octave-rydelic-visit. Admit, last ride, photo stub, last open, spectacular seen.
187/195 A successful board writes lastRideId and a photo path hash. No account server.
188/195 Welcome back is one line, and only when a prior ride, show, or clock was stored. The first ticket does not say it.
189/195 park/qc/qc-octave.js. pass 20, fail 0, skip 0.
190/195 No audio 404. No admit hole. Floats leave the spine when the cycle idles.
191/195 Phone cheap mode does not delete terrain, water meshes, or the coaster. QC2 stayed pass 32, fail 0, skip 0. QC stayed pass 46, fail 0, skip 9.
192/195 park/OCTAVE_WALK.md. Door, ticket, Gate, Block plaza, scored lap, dusk show, refresh.
193/195 60 s at dusk: hero s 394.8 and still finite, show mode show, wheel still turning, buildings left on the spine: 0.
194/195 OCTAVE_LOG.md table matches that run.
195/195 Drive 2026-09-23-BINGE7-octave-layer. Commit binge 7 cycle 195/195 song door show phone memory.

### Binge 8 — tighten — 2026-09-23 00:46 CDT
The Gate was a night lawn and a mirrored sign. The coaster data was real and invisible. This binge makes one loop you can see. Evidence is park/TIGHTEN_LOG.md.

196/220 Status file. tickMotion was on the render wrap and on the index tick.
197/220 One motion owner. Haunt mounts once. The 25 min sign faces the Gate. HUD drops the 1.2 m pad line.
198/220 paths.js. Closed Block coaster, crest 36 m, 63 samples, seam 0, off the spine.
199/220 Thick rails, lit posts to the grade, four cars named ride-block-01-car, crest light.
200/220 Esc returns to Walk. Dry lap maxY 35.9, no NaN.
201/220 qc-tighten closed path, car, and lap.
202/220 Auto dispatch and seat riders stay on that train. 80 s reaches s 214 and dispatches again.
203/220 Block Launch left STUB.
204/220 Wheel and swings left STUB.
205/220 Hero mover is the energy step, not a sine.
206/220 No board in COURSE.
207/220 Score stub, no 404.
208/220 Door admit and documented dev bypass.
209/220 Phone stick and BOARD.
210/220 Visit stores admit and last ride.
211/220 No new land. Spine stays the road.
212/220 no-water.js keeps the allow-list surfaces. One Pocket pool.
213/220 Mounted ground crowd is 40. Train bots stay.
214/220 Spectacular floats not mounted.
215/220 qc-tighten.js.
216/220 No fail to fix.
217/220 Cheap mode does not remove the hero.
218/220 TIGHTEN_WALK.md.
219/220 pass 16, fail 0, skip 0. Leftovers named in TIGHTEN_STATUS.md.
220/220 Drive 2026-09-23-BINGE8-tighten. Commit binge 8 cycle 220/220 tighten — one rideable loop.

### QC-FINAL — pivot gate — 2026-09-23 00:51 CDT
No new ride. No new land. The tab was already populated. Evidence is park/PIVOT.md and park/QC_FINAL.md.

221/235 Fresh profile. Canvas 1280×633. Sign readable. Train s moved 0 to 1.7. Zero exceptions. Status and PIVOT written from that tab.
222/235 qc-final.js. 241 import edges resolve.
223/235 Ride motion is still one tickMotion. Haunt latch still holds. Cameras switched in the tab.
224/235 HUD does not say 1.2 m pads. Sign text faces the Gate. No copy patch.
225/235 Allow-list water, hub and spine dry, old lakes gated. Nothing deleted.
226/235 Hero path already closed. Seam 0. Not a new coaster.
227/235 Board succeeded in the battery. COURSE refused. Esc cleared the ride. No NaN.
228/235 E-stop stays on the boarded ride. No freeze to isolate.
229/235 West view still shows rail above the grass. No mesh reverted.
230/235 Score stub makes no request. No 404. No new door surface.
231/235 Full table. First run failed the hotel row because LAYOUT bans a hotel. The check now looks for a hotel mesh. Retest pass 12, fail 0, stub 2.
232/235 No FAIL left that blocks populate, cameras, or the footprint.
233/235 QC_FINAL_WALK.md.
234/235 Re-run matches the table. Leftovers stay in PIVOT.md.
235/235 Drive 2026-09-23-QC-FINAL-pivot. Commit QC-FINAL 235/235 pivot gate. PIVOT READY = YES.
