# Rydelic Park — KIT (locked)

Source: PASSDOWN Rydelic Park 2026-09-20 10:47 CDT.
Director: Keith. Hands: Grok Bot / Ryan team.
Repo: Rydelicmusic/octave · Live park: https://rydelicmusic.github.io/octave/park/

## Hard rules
- **Do not edit** root `index.html` for park work. Landing stays landing.
- Product = files on `main` under `park/`. Chat HTML dumps are not the product.
- **Park-only v1.** Hotel/tower archived. Do not merge hotel lobby into the park.
- First artist skin = **Rydelic**. Skin is a separate layer from the frozen kit.

## Frozen kit (geometry only)
Allowed:
- Oval rail
- Paths
- Plazas
- Water
- Tree massing

Forbidden until a skin ticket:
- Disney / park IP names, castle, rides, IP buildings, rock icons
- Any themed architecture baked into the kit

## Scale (1:1 human)
- Footprint locked to real Disneyland loop (~85 acres, rail ~1.2 mi)
- **1 unit = 1 meter**
- Walk speed **1.34 m/s** (~3 mph)
- Eye height **1.72 m**
- Oval: **A = 380 m**, **B = 230 m**
- Spawn: **Gate**, looking up **The Pocket**
- Do **not** shrink the dirt to make it “feel smaller.” Fix scale feel with readable edges (Gate volume, path curbs, hub ring).

## Change control
- If it is not in this KIT, it is not a decision.
- Scale numbers only change via a KIT revision.
- One job per commit.

## Build order
1. Write-check / park scaffolding
2. Empty Gate → Hub walk (`park/index.html`) with kit constants
3. Verify https://rydelicmusic.github.io/octave/park/
4. Gate volume + path edges (no rides)
