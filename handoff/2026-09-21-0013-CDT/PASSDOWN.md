# PASSDOWN — Four lands + ride pads
**From:** Grok Build · **To:** Ryan / next Grok  
**Date:** Monday, September 21, 2026 · **Time:** 12:13 AM CDT  
**Timestamp:** 2026-09-21T00:13:00-05:00  
**Stamp folder:** `handoff/2026-09-21-0013-CDT/`  
**Status:** SHIPPED — `origin/main`

## Repo + live
- **Repo:** https://github.com/Rydelicmusic/octave (branch `main`)
- **Tip SHA:** `f70133106d0ed79c89a1650b18e5131bc1c9d981`
- **Commit:** park organize: four land belts, 1.2 m ride pads
- **3D Park:** https://rydelicmusic.github.io/octave/park/
- **Blueprint 2D:** https://rydelicmusic.github.io/octave/park/blueprint.html
- **Drive (canon folder):** https://drive.google.com/drive/folders/1D9R9wXMiDDEYJfbQl4cTKR-NC-R8E023
- **This pack (Drive):** https://drive.google.com/drive/folders/1Bfx6NBH3LzmLJhZvHpbJDCnXv3mIM3ix

## What this stamp is
Oval reads as four lands. RIDE_QUEUE #1–#9 DONE. Trees in belts 6 m off drives/spine. Land rides sit on 1.2 m stone pads so they read from drone alt 90.

## Rides (keep ids + lands)
| Id | Land | Address |
|---|---|---|
| ride-board-01 | The Board | G6,0 / x 160 z 14 / 6 × 4 m |
| ride-board-02 | The Board | G7,0 / x 187.5 z 14 / 12 × 8 m |
| ride-block-01 | The Block | G-8,1 / x -187.5 z 37.5 / 6 × 4 m |
| ride-block-02 | The Block | G-8,-1 / x -187.5 z -20 / 12 × 8 m |
| ride-hours-01 | After Hours | G-2,-7 / x -36 z -175 / 6 × 4 m |
| ride-hours-02 | After Hours | G-3,-7 / x -60 z -175 / 12 × 8 m |
| ride-pocket-01 | The Pocket | G2,2 / x 70 z 50 / 6 × 4 m |
| ride-pocket-02 | The Pocket | G1,3 / x 40 z 80 / 12 × 8 m |
| ride-gate-signs | Gate | x ±24 z 210 |

Queue rails face each land T-drive. Hub r32 and 14 m spine stay clear.

## Trees
- 6 m off drives and spine, 8–10 m spacing, 0–2 per G-cell
- Claim rides before canopy so trees skip ride lots
- Not on asphalt, hub r32, or ride footprints
- cells-over-cap = 0

## Walk
`if (inStadium(nx,nz)) { pos.x=nx; pos.z=nz; }` — no nearestWalk snap. Drone unchanged.

## Blender (off to the side)
`blender/rydelic_park.py` rebuilds occupy-map lots. Also copied to `Downloads/rydelic-park-blender/`. Does not change Pages.

## LOCKED
- LAYOUT.md XZ, THEME_PARK.md, occupy.js, lock.js
- Stadium 760×460, hub r18/32, 14 m spine, Gate (0,+230)
- Rings A (95,95) 14/20, B (118,108) 6/11
- No hotel / water / second spine / Math.random x/z
- RIDE_QUEUE OPEN list is empty — do not add rides unless a new OPEN row appears

## Next Grok
1. Re-read `park/THEME_PARK.md` + `park/RIDE_QUEUE.md`
2. If OPEN is empty, do not invent rides
3. Hard-refresh drone: four clusters, rides on stone pads

## Tests at stamp
- `node park/lock.test.mjs` — pass
- `node park/test-placement.mjs` — 22 pass, 0 fail
