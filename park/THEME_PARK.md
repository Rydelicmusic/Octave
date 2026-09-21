# Theme park loop law
Director: Ryan. Hands: Grok Build.
Re-read this file at the START of every pass. Do not invent a new brief.

## What “a real park” means here
Not a lawn with boxes. A guest can walk a circuit:
Gate → hub → land drive → queue → ride / kiosk → path home.

SKU = Monopoly (locked):
- 1 song = kiosk / small ride pad
- EP = pavilion / mid ride
- album = hall (only after songs exist for that land)
Song = ride. Do not design a hotel tower.

## Every pass (same 6 steps)
1. READ park/THEME_PARK.md + park/RIDE_QUEUE.md + occupy-map.json + LAYOUT.md
2. PICK the first queue item whose status is OPEN
3. SURVEY that cell with at/near/whyBlocked. If blocked, next free G-cell in THAT land only
4. CLAIM the lot. Fail = skip, mark BLOCKED in RIDE_QUEUE.md, next item
5. MESH in a NEW small file under park/rides/ then ONE wire in index.html
6. DUMP occupy-map.json + one line in park/SURVEY_LOG.md. Mark item DONE.
   REPEAT from 1. One item per pass. Tiny file + tiny wire.

## Hard no
- Math.random for x/z
- rewrite lock.js
- rewrite index.html in one shot
- water / ponds / lily pads
- hotel tower / mix of park+hotel
- second spine
- road that dies in grass
- tree or prop on asphalt, hub r32, or 14 m spine
- putting a ride in the wrong land

## Place rules
Land only: Block −X, After Hours −Z, Board +X, Pocket +Z.
Gaps: mass≥4 m, tree-to-mass≥3 m, queue in front of ride facing the drive.
Cell cap: 0–1 new mass per G-cell.

## Done for a land (then next land)
Gate visible, drive T’d at r32, ≥1 song kiosk, ≥1 queue rail, trees in leftover cells only.
Full park done when all four lands meet that bar AND RIDE_QUEUE OPEN list is empty.
