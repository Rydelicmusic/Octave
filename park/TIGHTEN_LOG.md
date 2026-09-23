# Tighten log

Date: 2026-09-23 00:46 CDT
Command: `node park/qc/qc-tighten.js`
Result: pass 16, fail 0, skip 0
Leftover FAILs: none

| Cycle | Built | Tested | Fail | Leftover |
| --- | --- | --- | --- | --- |
| 196 | TIGHTEN_STATUS.md. Export audit of haunt-boot, attractions, seed-rides. | Live page already had a scene. `tickMotion(` was in both `__tickRides` and the render wrap. | Double step. | Coaster not readable from the Gate. |
| 197 | Render wrap no longer calls tickMotion. Haunt latch. Itinerary sign yaw 0 so the guest at the Gate sees the front. HUD no longer says “1.2 m pads”. | Source check: one `tickMotion(` call. | none | Kit and gate icon stay stubs. |
| 198 | park/rides/paths.js. Station, lift, 36 m crest, drop, helix, brakes, station. | 63 samples, seam 0, canopy issues 0, off spine and hub. | none | |
| 199 | Thicker rails, lit supports to grade, 4 cars scaled 1.55, crest beacon. Car name `ride-block-01-car`. | track-build carName and seatRiders. | none | The 1.2 m kiosk pads remain. |
| 200 | exitRide always clears the board camera. Esc is Walk. | Dry lap maxY 35.9, no NaN. | none | |
| 201 | qc-tighten covers closed path, car name, and the lap. | pass on those rows | none | |
| 202 | Existing auto-dispatch and seatRiders kept on this train. | 80 s energy run, crest 36 m, max s 214.4, then DISPATCH again. | none | |
| 203 | Block Launch left as it was. | not enlarged | none | STUB in the status file |
| 204 | Wheel and swings left as they were. | not enlarged | none | STUB in the status file |
| 205 | Hero mover is stepEnergy. | v and s finite, height follows the rail | none | Other rides were not refit. |
| 206 | COURSE board still refused. | reason course | none | |
| 207 | Hero score stays a silent stub. | url null, label score: stub | none | No audio file, so no 404. |
| 208 | Door already entered with admit=1. Dev bypass documented. | door.html strings | none | |
| 209 | Phone stick and BOARD on a coarse pointer. | phone layout row | none | |
| 210 | Visit stores admit and lastRideId. | roundtrip row | none | |
| 211 | No new berms. Spine stays the road. Supports use sampleHeight. | path stays off the spine | none | Terrain remains a stub relative to the Gate view. |
| 212 | no-water.js keeps water-surface, coping, basin floor, and the fountain jet. | one Pocket pool, no rings field | none | |
| 213 | Mounted ground crowd is 40. Train bots kept. | bootNpcs(40) in the mount | none | The helper cap used by older tests is still 56. |
| 214 | Spectacular float mount skipped. | boot.js has no armShow( | none | STUB |
| 215 | park/qc/qc-tighten.js | first full run | none | |
| 216 | No fail rows to fix. | re-run | none | |
| 217 | Cheap mode still keeps the coaster. Phone layout does not delete it. | policy unchanged | none | |
| 218 | TIGHTEN_WALK.md | walk script | none | |
| 219 | Status file rewritten from this run. | pass 16 fail 0 skip 0 | none | Launch, wheel, swings, kit, pads, queue house, terrain-from-the-Gate, spectacular. |
| 220 | Drive 2026-09-23-BINGE8-tighten | live Gate check after the push | | |
