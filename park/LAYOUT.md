# Rydelic Park — Locked Artist-Park Layout
Date: 2026-09-20 12:16 CDT
Status: CANONICAL. This is the layout for every artist park we build.
Director: Ryan / Rydelic. Build executes. Director does not get rewritten.

Live 2D: https://rydelicmusic.github.io/octave/park/blueprint.html
Live 3D: https://rydelicmusic.github.io/octave/park/
Repo path: `park/` only. Do not edit root `index.html`.

Measured sheet (Drive): https://drive.google.com/file/d/1HC6WuDCmLmdJD_RMtKz58yARhOVkbwYl/view
Drive folder: https://drive.google.com/drive/folders/1D9R9wXMiDDEYJfbQl4cTKR-NC-R8E023

## Coordinate system (meters)
- Origin (0, 0) = hub center
- +X = east = The Board
- −X = west = The Block
- +Z = south = Gate
- −Z = north = After Hours
- Grid: 25 m minor / 100 m major

## Stadium (locked)
- Overall: 760 × 460 m
- A = 380 (half X)
- B = 230 (half Z)
- Cap R = 230
- Straight = 300
- Gate = (0, +230)

Stadium path (same as `park/blueprint.html`):
```
r = B = 230
s = A - r = 150
M (-s, -B) L (s, -B) A r r 0 0 1 (s, B) L (-s, B) A r r 0 0 1 (-s, -B) Z
```

## Hub (locked)
- Inner plaza r = 18 m
- Outer plaza r = 32 m
- 8 radial spokes
- Spine: 14 m wide, from hub through +Z to Gate
- Spine openings in hub wall at ±Z so the 14 m walk clears

## Lands (Disney-lands model — do not mix hotel-tower into this park)
| Land | Axis | Canopy ellipse (cx, cz, rx, rz) |
|---|---|---|
| The Block | −X | (−165, −10, 130, 160) |
| After Hours | −Z | (10, −140, 150, 70) |
| The Board | +X | (160, 10, 130, 130) |
| The Pocket | +Z / hub south | label (0, 120) |

Land rule: song = ride, album = land. Gate: 1 song = kiosk; EP = pavilion; album = full building. Do not design a hotel until multiple songs exist.

## Pocket ride (locked rings — current 3D)
- Ring A: center (95, 95), inner 14 / outer 20
- Ring B: center (118, 108), inner 6 / outer 11
Note: the landscape illustration puts an ∞ loop further SE. Do not move these rings unless the director says so in a dated pass.

## Water ellipses (x, z, rx, rz) — locked set
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

## What is allowed to change per artist
- Planting, materials, lighting, signage copy
- Ride skin inside a land (not land footprints)
- Audio beds per land
- Kiosk / pavilion / building skins that fit the SKU ladder

## What is NOT allowed to change without a director pass
- Stadium A/B/R/straight
- Origin, axis directions
- Hub r18/r32, 14 m spine, Gate (0,+230)
- Land names and canopy footprints
- Water list
- Mixing hotel-tower language into this park v1
