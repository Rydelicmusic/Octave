# Grok Build — Park quality log
2026-09-20

Director: Ryan / Rydelic. Hands iterate in `park/` only.

## Locked (must hold after every commit)
- Stadium 760×460, A=380 B=230, cap R=230, straight=300
- Hub (0,0) r18/32, Gate (0,+230), 14 m spine, walk 1.34 m/s
- Rings A (95,95) 14/20 and B (118,108) 6/11 unmoved
- Water list + land canopies in LAYOUT.md / lock.js
- No hotel / tower / elevator; no root index.html edits

## Pass 1 — SKU-ladder buildings in land canopies
- 11 buildings (kiosk / pavilion / album) via `park/lock.js` `BUILDINGS`
- Inside The Block / After Hours / The Board canopies only
- Placement predicates refuse spine, water, stadium rail, hub plaza, locked rings
- Blueprint draws the same footprints; hover still `x … m` / `z … m`

## Pass 2 — winding path ribbons + hub 8 radial beds + tree belts
- Elliptical lake walks on waters rx>=16; four land ribbons following water edges
- Hub: 8 sand spokes + 8 planted dirt/hedge beds (clear of 14 m spine)
- Denser west-lakes, SE grove, north-split belts; trees skip spine + building footprints

## Pass 3 — gate, stations, signs, lamps, queues, materials
- Eye-height land-name markers: The Block, After Hours, The Board, The Pocket
- Gatehouse volume at (0,+230) with ticket windows; turnstiles off-spine
- Ride station decks + queues around unmoved ∞ rings
- Spine lamps / benches / trash; rail fence posts
- Asphalt spine, concrete hub, packed-sand land ribbons, earth patches
- Stadium-rail walk clamp (speed still 1.34 m/s)

## Pass 4 — walk arrival faces hub
- Start yaw 0 so Gate Walk looks down the 14 m asphalt spine into the hub
- Optional `#drone` hash opens Drone at 90 m (cameras unchanged)

## Grounds agent (park-grounds worktree, on top of lock.js / SKU buildings)
- pass 1: west-lakes / SE-grove / north-split belts — mixed height, trunks, overlapping canopies; skip 14 m spine + building footprints
- pass 2: recessed water basin + coping + water reflection; lakeside ribbons on all 12 locked ellipses (spine-clipped)
- pass 3: hub eight radial planting beds denser; sand-path / concrete-plaza / grass / packed-earth / curb materials from lock.js
- pass 4: land wash lights, spine/gate lamps kept, planters, ropes; Walk / 3rd / Drone unchanged
- pass 5: belts skip water ellipses + Pocket ring walks; closed lakeside ring only when skipped===0
- pass 6: lakeside walks are constant 3.2 m wide (no rx,rz-scaled rings)
- pass 7: park trees 5.2–11 m trunks, 0.13–0.28 m radius (not toy, not poles)
- pass 8: lamps 3.6 m + fixture; benches 0.45 m with legs; rope rail 1.55 m off 14 m spine
- pass 9: water coping 0.5 m wide × 0.32 m high in world meters (not rx-scaled)
- pass 10: hub radial beds 0.38 m soil planters with 0.12 m stone lip; shrubs 0.7–1.2 m
- pass 11: stadium rail 0.4 m diameter stone curb on the locked 760×460 oval

## Still fake (worst next)
1. Facades still fairly boxy (window insets help halls; kiosks/pavilions are kit-simple) — buildings agent
2. Spine is still a straight box (ribbons are on land water edges only)
3. Stay-on-path is rail-only, not ribbon-constrained
4. Lakeside ribbons that hit the spine are segmented boxes, not one spline
5. Mobile look + stick still coarse
6. Land pathRibbon widths still 5–6 m (wide vs 3.2 m lakeside) — optional later
