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

## Pass 5 — SKU facade polish (density + proportion)
- Album halls (kept): recessed window bays, pilasters, belt/cornice, portico, stepped entry
- Kiosks: plinth + fascia + pitched awning, service-window recess + glass, side insets, corner posts
- Pavilions: plinth/belt, 8 columns, four face window bays + sills, two-tier roof + finial
- Material variation via body/trim/glass/base; BUILDINGS x,z,w,d,yaw footprints unchanged
- Placement predicates untouched (canopy / off spine / off water / inside rail)

## Pass 6 — species-varied tree crowns
- Four crown types: pine (tiered cones), oak (broad sphere + bump), willow (droop capsules), poplar (tall narrow)
- Region bias: west lakes willow, SE Board grove oak, north After Hours pine, hub ring poplar
- Rail belt still mixed via stable pickSpecies(x,z); placement skips spine ±9 m + building footprints
- No map / BUILDINGS / LAYOUT.md changes

## Still fake (worst next)
1. Spine is still a straight box (ribbons are on land water edges only)
2. Stay-on-path is rail-only, not ribbon-constrained  ← next candidate


## KEITH check-in — 2026-09-20 13:00 CDT
- FLEET: KEITH COO online; Realm Engineer = park/; Site Luxury = park-site/; Quality standby
- SHIPPED: Pass 5 SKU facade polish (kiosk/pavilion/hall) — footprints held
- SHIPPED Pass 6: species-varied tree crowns
- NEXT candidate: ribbon-constrained stay-on-path
- CONSTRAINTS: no rebuild; LAYOUT.md meters held; no hotel-tower
