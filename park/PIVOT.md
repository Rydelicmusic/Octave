# Pivot

Date: 2026-09-23 00:51 CDT
This file is the handoff. It records what the tab did, not what the binge logs hoped.

## 1. LIVE SHA + URL

URL: https://rydelicmusic.github.io/octave/park/
SHA verified in the tab: fa718e55fea9e41b582558010a7d637921615f2b
Message: binge 8 cycle 220/220 tighten — one rideable loop
This QC commit does not change the scene, the rides, or index.html. A fresh headless profile loaded that SHA: canvas 1280×633, zero exceptions.

## 2. WORKS

Verified in that tab, one fresh profile:

- The page populates. Night sky, spine, trees, lamps, the kit. Not an empty canvas.
- Walk, 3rd, and Drone are buttons. Clicking 3rd made 3rd the active camera. Clicking Drone made Drone the active camera. Clicking Walk returned Walk.
- The sign in the road reads “Park Circuit · 25 min”. It is not mirrored.
- The corner card says “Block coaster west of the spine”. It does not say “1.2 m pads”.
- The score line says “score: stub · idle”. No audio 404 in the console.
- Clock on the raw URL: “10:00 OPEN NEED TICKET”.
- Hub height at (0, 0) is 0. The Board lagoon blocks a step. The spine at (0, 120) does not.
- Without a click, Block train arc length moved from 0 to about 1.7. Height stayed near 3.2 m, so it was leaving the station, not yet at the crest.
- Looking west from the Gate shows rail and supports on the left. Block Coaster’s row read “cycling” in that view.

Not clicked in that tab: Board, a full lap, Esc, or a refresh of visit memory. Those are in the node battery, not in the WORKS list.

## 3. BROKEN

None in the console on that load. No SyntaxError. No failed export. No audio 404.

## 4. MISSING

- A real music file on any rail. The score is a silent stub on purpose.
- Spectacular floats. The mount is not called.
- A Gate walk that proves Launch, the wheel, or the swings as rides you can see and finish. Their modules still mount.
- A painted queue building. The queue is a slot list.
- Energy physics demonstrated on all eight rides in this tab. The hero is the one that was measured.

## 5. LAW FIGHTS

Contained, not drawing two waters in the 3D tab:

- `lock.js` still holds the old `LOCK.waters` ellipses. `index.html` draws them only when `__PARK_DRY` is false. It is true. Do not delete that list. `lock.js` stays.
- `park/water/water.js` draws four basins: Board lagoon, one fountain, Hours canal, one Pocket pool. Hub and spine samples of those basins: 0 hits. Pocket pools: 1. No rings field.
- `no-water.js` returns early for `water-surface-*`, coping, basin floors, and the fountain jet, and still strips other water-like meshes.
- `blueprint.html` still paints the old ellipses in the 2D map. That is a map of the locked list, not a second 3D lake.

Ride motion: `tickMotion(` appears once, inside `__tickRides`. The render wrap does not step the train. Kit glow, the gate crown, land-bed pulse, haunt bob, and the GPS hud have their own frames. Those are not a second ride loop.

Haunt: `bootHaunt` and `armHaunt` can both call `mountHaunt`. A module latch plus the `haunt-scene` name make the second call return. One group.

Theme kiosk versus heavy ride: GitHub `ride-*.js` files are the small claim modules. They call `addAttraction`. Do not commit a local stale copy over them.

## 6. DO NOT TOUCH

- `park/lock.js`
- `park/LAYOUT.md`
- Do not roll main back to `74cc53f` (2026-09-20 grounds merge) unless a later edit blanks the tab. The boot that just populated is `fa718e55fea9e41b582558010a7d637921615f2b`.

## 7. NEXT PIVOT OPTIONS

Director picks later. Not this binge.

- Music score: real stems, or keep the stub.
- Door: make the door the way people enter.
- A second park map. One park stays in this tab.

PIVOT READY = YES
