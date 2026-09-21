# Rydelic Park CRS
Date: 2026-09-20 20:53 CDT
Status: CANONICAL. Use these numbers in every Build brief.

## Park meters (already locked)
- Origin (0, 0, 0) = hub center, grade Y = 0
- +X = east = The Board
- −X = west = The Block
- +Z = south = Gate
- −Z = north = After Hours
- Units: meters
- Stadium: X ∈ [−380, +380], Z ∈ [−230, +230]

## Grid
- Minor cell: 25 m × 25 m
- Major line: 100 m
- Cell id: `G{ix},{iz}` where `ix = floor(x / 25)`, `iz = floor(z / 25)`
- Spoken form: `x +160 z +10` or `G6,0` (The Board canopy sits near G6,0)

### Named anchors (brief with these)
| Place | x | z | cell | note |
|---|---:|---:|---|---|
| Hub | 0 | 0 | G0,0 | origin |
| Gate | 0 | +230 | G0,9 | south lip |
| The Board | +160 | +10 | G6,0 | canopy center |
| The Block | −165 | −10 | G-7,-1 | canopy center |
| After Hours | +10 | −140 | G0,-6 | canopy center |
| The Pocket | +80 | +105 | G3,4 | canopy center |
| Pocket rings A | +95 | +95 | G3,3 | ride only, not water |
| Pocket rings B | +118 | +108 | G4,4 | ride only, not water |

When you want a change: say **cell + meters**. Example: "kiosk at G3,4 / x 80 z 105".

## Geographic datum (Cypress, TX tangent)
Park is a local tangent plane. Not a real city footprint — a GPS skin so briefs can use lat/lng.

- Hub (0,0) = **29.973000° N, 95.694000° W**
- +X east → longitude increases
- +Z south → latitude decreases

```
M_PER_DEG_LAT = 111320
M_PER_DEG_LNG = 111320 * cos(29.973000 * π/180) ≈ 96480

lat = 29.973000 - z / 111320
lng = -95.694000 + x / 96480

x = (lng + 95.694000) * 96480
z = (29.973000 - lat) * 111320
```

Gate (0, +230) ≈ 29.970934° N, 95.694000° W
Board (+160, +10) ≈ 29.972910° N, 95.692342° W

## How to brief Build
LOCKED + place: `G3,4 (x 80 z 105) / 29.97206, -95.69317` + CHANGES only.
