# Tighten status

Date: 2026-09-23 00:46 CDT
Live before this binge: a night lawn, the kit, and a mirrored “Park Circuit · 25 min” sign. The coaster math existed and the train moved in data, about 180 m west on a thin rail. From the Gate it did not read as a coaster.
Scoreboard after cycle 219: `node park/qc/qc-tighten.js` pass 16, fail 0, skip 0.

| Feature | Status | Note |
| --- | --- | --- |
| boot | SHIPPED | Scene, canvas, Walk / 3rd / Drone. |
| tickMotion | SHIPPED | One call, from `__tickRides`. The render wrap no longer steps the train. |
| haunt once | SHIPPED | `mountHaunt` sets a latch and refuses a second group. |
| park-kit | STUB | Arches, lamps, and plazas. Not a ride. |
| gate-icon | STUB | Crown and ticket props. Not a ride. |
| 8 pads | STUB | The 1.2 m stone pads are still under the kiosk anchors. They are not the coaster. |
| paths.js | SHIPPED | Hero Block path, 63 samples, seam 0, crest 36 m, inside the Block, off the spine and the hub. |
| ride-cam | SHIPPED | Board and exit. Esc returns to Walk even if the train is braking. |
| physics.js | SHIPPED | Hero uses the energy step. In 80 s it reached the crest (36 m) and max s 214 of 216, then dispatched again. Not a sine mover. |
| ride-ops | SHIPPED | COURSE refuses a board. |
| queue | STUB | The slot queue works. There is no new painted queue house. |
| clock | SHIPPED | Opens 10:00. |
| ticket | SHIPPED | `?admit=1` admits. `?dev=1` is the documented bypass. No ticket returns `admit`. |
| alive bots | SHIPPED | `seatRiders` still parents riders to `${id}-car`. Auto dispatch still runs while OPEN. |
| terrain | STUB | Berms and grade are in the terrain module. The Gate road is still the level spine. This binge did not add land. |
| water allow-list | SHIPPED | Four basins, one Pocket pool, no rings field. `no-water.js` keeps `water-surface-*`. Old lakes stay behind `__PARK_DRY`. |
| npc ground | SHIPPED | The mounted crowd is 40. The train rider pool is separate and still capped at 72. |
| ride-score | STUB | No stem file. HUD says `score: stub`. One context, silent until a gesture. |
| door | SHIPPED | `park/door.html` lists RYDELIC only and enters `index.html?admit=1`. |
| spectacular | STUB | Float meshes are not mounted. No new spine building. |
| mobile stick | SHIPPED | Coarse pointer uses the existing pad plus BOARD. Wide desktop does not force it. |
| visit memory | SHIPPED | `octave-rydelic-visit` stores admit and lastRideId. |
| QC logs | STUB | QC_LOG, QC2_LOG, and OCTAVE_LOG are older scoreboards. They do not prove the Gate can see this coaster. This binge’s scoreboard is TIGHTEN_LOG. |

Not this loop, so not marked shipped: Block Launch, the wheel, and the swings. Their modules still mount. They were not enlarged or re-proven as a Gate walk.

The old 500 m sample set in `coaster-paths.js` is still what the older QC files measure. The scene’s Block Coaster is `paths.js`.
