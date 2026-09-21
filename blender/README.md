# Rydelic Park — Blender 4.x

Rebuilds the surveyed park from `park/occupy-map.json` plus LOCK meters (`park/lock.js` values copied into the script). Does not run the live walk, HUD, or GitHub Pages.

## Coordinates

1 unit = 1 meter.

| Park | Blender |
|---|---|
| X (east Board) | X |
| Z (south Gate) | Y |
| height | Z (up) |

No water.

## Run

From the repo root, Blender 4.x:

```bash
blender --background --python blender/rydelic_park.py
```

Or: Blender → Scripting → Open `blender/rydelic_park.py` → Run Script.

On run it prints lot counts (mass / tree / road / plate / spine).

## Collections

- `park_ground` — stadium lawn, 4 land canopy ellipses, hub r18/r32, occupy plates
- `park_roads` — 14 m spine, hub ring at r32, four T-drives, occupy road lots
- `park_mass` — claimed buildings / gates / stations as boxes
- `park_canopy` — claimed trees as instances
- `park_grid` — 25 m minor / 100 m major

## Sources (read only)

- `park/occupy-map.json` — every claimed lot
- LOCK: stadium 760×460, hub r18/32, spine 14 m, Gate (0,+230), four canopy ellipses
- Drives: Block −X, After Hours −Z, Board +X, Pocket +Z, T at r32
