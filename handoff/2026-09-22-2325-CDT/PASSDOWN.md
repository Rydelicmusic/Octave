# PASSDOWN — Halloween Haunt machines
**From:** Grok Build · **To:** Keith / Ryan / next Grok
**Date:** Tuesday, September 22, 2026 · **Time:** 11:25 PM CDT
**Timestamp:** 2026-09-22T23:25:00-05:00
**Stamp folder:** `handoff/2026-09-22-2325-CDT/`

## Repo + live
- **Repo:** https://github.com/Rydelicmusic/octave (branch `main`)
- **3D Park:** https://rydelicmusic.github.io/octave/park/
- **Blueprint 2D:** https://rydelicmusic.github.io/octave/park/blueprint.html
- **Landing (untouched):** https://rydelicmusic.github.io/octave/

## What this stamp is
Director asked to revamp the current model into a theme park with typical rides, Halloween theme, animation / motion, density, write-check-improve loop, GitHub + Drive stamp.

Locked XZ held. Existing nine ride ids held. Kiosk boxes swapped for moving machines. Night overlay added.

## Typical-park map (research → this park)
Thrill: drop tower, pendulum ship, ring-circuit coaster overlay.
Family: carousel, ferris wheel, teacups, bumper cars.
Dark / haunt: crypt kiosk + haunted hall.
Gate: jack-o posts + arch.
Skipped: log flume (water lock).

## Lands
| Land | Axis | Machines |
|---|---|---|
| The Board | +X | Harvest Cups, Bone Carousel |
| The Block | −X | Ledger Drop, Concrete Hymn Ship |
| After Hours | −Z | Last Call Crypt, Velvet Crypt Hall |
| The Pocket | +Z | Spine Bumper Cars, Gate Pumpkin Wheel, Night Circuit |

## Files
- `park/rides/attractions.js` — motion registry + 8 machines
- `park/halloween/haunt-scene.js` — moon, fog, bats, pumpkins, lanterns, ring train
- `park/index.html` — night sky + tickMotion + addHauntScene
- ride-*.js add() now mounts machines; claim lots unchanged

## LOCKED still
Stadium 760×460, hub r18/32, 14 m spine, Gate (0,+230), land canopies, rings A/B, no hotel, no water, no Math.random x/z, root index.html off-limits.

## Next Grok
1. Hard-refresh /park/ — Walk from gate, Drone alt 90 over each land.
2. If a machine is dark vs grass, raise emissive, do not move the lot.
3. Do not open new occupy lots unless Keith dates an OPEN row.
