# Grok Build — Park iteration 1 passdown
2026-09-20 11:58 CDT

Director: Ryan / Rydelic. You are hands. Slow moves. Edit existing park/ files only.

## What iteration 1 is
A walkable theme-park kit for artist Rydelic. Frozen layout from cleaned Disneyland-derived map (no names, no buildings, no mountains). Skin later. Geometry now.

## Open these first
1. https://rydelicmusic.github.io/octave/park/
2. https://rydelicmusic.github.io/octave/park/blueprint.html
3. park/index.html + park/KIT.md + park/blueprint.html in this repo

## Locked (do not change unless director says)
- Stadium 760×460, A=380 B=230
- 14 m Pocket spine, hub r 18/32
- Lands names and axis
- Walk 1.34 m/s
- GitHub Pages delivery under park/
- Theme park only — not the hotel tower

## What works
- Walk / 3rd / Drone cameras
- Visible sand paths + curbs
- Water blobs at blueprint coords
- Figure-8 rings at (95,95) and (118,108)
- Gate volume at south rail
- Land name HUD + meter readout

## Known gaps (iteration 2 candidates — pick ONE per pass)
1. Paths still boxy vs the illustrated winding lakeside walks. Trace blueprint water edges into path ribbons.
2. Tree massing is sparse cones, not the map’s belts (west lakes, SE grove, north split).
3. Hub eight radial beds not modeled in 3D.
4. No collision / stay-on-path.
5. Drone default height 90 m — director may want a start-in-drone option.
6. Mobile look + stick still coarse.

## Build rules
- EDIT park/index.html or park/blueprint.html. Never rebuild from scratch.
- Formula: LOCKED + GOAL + CHANGES only + SHIP (commit to main).
- One visual goal per commit.
- After each pass: hard-refresh Pages and say what changed in meters.

## First suggested Build pass
GOAL: make the Pocket spine + hub + stadium rail read from Drone as the blueprint (thicker rail bed, continuous 14 m path, hub plaza fill). Do not add rides.
