# Draw → GitHub → Build
Date: 2026-09-20 22:01 CDT

Live: https://rydelicmusic.github.io/octave/park/blueprint.html
3D walk first, then draw on the finished 2D blueprint.

## Loop
1. Finish / walk the park.
2. Open the blueprint. Draw mode ON.
3. Tool: Building (drag a box), Path, or Freehand. Set SKU: kiosk / pavilion / building.
4. Download `sketches/latest.json` (also copies a Build brief).
5. Commit that JSON to `park/sketches/` on main — or drop it in chat and director pushes.
6. Paste the Build brief into Grok Build. Build reads the JSON and ships ONE 3D massing at those meters. Does not invent a new map.

## JSON schema
`park/sketches/latest.json`

```json
{
  "crs": "park/CRS.md",
  "kind": "sketch",
  "shapes": [
    {
      "id": "s1",
      "type": "building",
      "sku": "building",
      "x": 160, "z": 10, "w": 18, "d": 14, "yaw": 0,
      "cell": "G6,0",
      "note": "Board hall"
    }
  ]
}
```

x,z = footprint center in park meters. w = east-west, d = north-south. Cell from CRS 25 m grid.

## Build rules when reading a sketch
- park/ only. One small file (e.g. park/sketch-mass.js) + one wire.
- Place massing at exact x,z,w,d. Do not move LAYOUT footprints.
- sku kiosk ≈ 6–10 m, pavilion ≈ 12–20 m, building ≈ 18–36 m unless the drawing already set w,d.
- No water. No hotel tower. No lock.js rewrite.
