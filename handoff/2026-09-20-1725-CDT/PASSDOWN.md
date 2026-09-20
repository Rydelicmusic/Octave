# PASSDOWN — Park merge (buildings + grounds)
**From:** Grok Build · **To:** Ryan / next Grok  
**Date:** Sunday, September 20, 2026 · **Time:** 5:25 PM CDT  
**Timestamp:** 2026-09-20T17:25:00-05:00  
**Stamp folder:** `handoff/2026-09-20-1725-CDT/`  
**Status:** SHIPPED — merge on `origin/main`

## Repo + live
- **Repo:** https://github.com/Rydelicmusic/octave (branch `main`)
- **Tip SHA:** `74cc53f3c3b453b53d01afb8fdfeeac2d7c248a5`
- **Commit:** Merge park-grounds planting/lighting into main park page
- **3D Park:** https://rydelicmusic.github.io/octave/park/
- **Blueprint 2D:** https://rydelicmusic.github.io/octave/park/blueprint.html
- **Luxury site:** https://rydelicmusic.github.io/octave/park-site/
- **Drive (canon folder):** https://drive.google.com/drive/folders/1D9R9wXMiDDEYJfbQl4cTKR-NC-R8E023
- **This pack (Drive):** https://drive.google.com/drive/folders/1hFVybGNEsvwcvUFHi4b3l9WCh9sj81Lm

## What this stamp is
Merged `park-grounds` planting/lighting into the existing main 3D page. Did **not** rewrite `park/index.html` from scratch. Did **not** take the grounds-only box facades.

### Kept (buildings lane / main)
- SKU-kit mounts on GATE, STATIONS, and land kiosk / pavilion / album
- Itinerary, named WALKS, stay-on-path, CAD spine
- LAYOUT.md Pocket canopy `(80, 105, 95, 80)`

### Ported (grounds lane)
- Overlapping land tree belts (`beltTreePositions` + `treeMetrics`)
- Meter-true water coping `0.5 × 0.32 m` (`waterCopingSegments`)
- Lakeside walks `3.2 m` (`GROUNDS_SCALE.lakesideW`)
- Hub radial beds `0.38 m` + `0.12 m` lip
- Lamps `3.6 m`, benches `0.45 m`
- Land wash, spine ropes `1.55 m` off the 14 m walk
- Tree trunks `5.2–11.2 m`

## LOCKED (do not reopen)
- Stadium 760×460, A=380, B=230, cap R=230, Gate (0,+230)
- Hub r18/32, 14 m spine Gate→Hub
- Rings A (95,95) 14/20, B (118,108) 6/11
- 12 water ellipses in LAYOUT.md / lock.js
- Pocket canopy (80, 105, 95, 80)
- No hotel / tower / elevator
- Park work is `park/` only — never root `index.html`

## Tests at stamp
- `node park/lock.test.mjs` — exit 0 (twice)
- `node park/test-placement.mjs` — 15 pass, 0 fail (twice)
- Playwright: two loads, canvas 1280×720, zero page errors, painted bbox = full canvas

## Files in this pack
See `MANIFEST.md`. Snapshot zip is a frozen copy of `park/` + screenshots at this SHA.
