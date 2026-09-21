# Director lock — water cluster (The Block)
Date: 2026-09-20 20:12 CDT
From drone screenshot: overlapping ponds + cream roads cutting through water.

LOCKED list from LAYOUT.md (x, z, rx, rz). Do not add ponds. Do not merge them into one flower.
```
(-210,-20,48,70)
(-165,10,55,42)
(-120,70,32,26)
(-95,-85,28,22)
(-150,-40,24,18)
(-20,-18,16,10)
(22,-22,18,12)
(-18,22,16,9)
(28,20,17,10)
(8,-8,10,7)
(155,-85,22,16)
(200,-40,18,12)
```

GOAL: each ellipse is its own pool with a single coping ring. Grass or a thin berm between pools. Roads go AROUND water, never through it.

CHANGES only:
- Kill extra concentric rims / figure-8 paths drawn on top of the Block ponds.
- If two locked ellipses overlap in XZ, keep both footprints but do not draw a third merged lake or a road on the overlap. Leave the overlap as water+coping only.
- Land drives T around the copings. Minimum 4 m grass/berm between road edge and water lip.
- Hub r18/r32 and 14 m spine stay. No new rings on water.

SHIP: new small file park/water-clean.js + one wire. Do not rewrite lock.js or index.html in one shot.
