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

## Pass 7 — ribbon-constrained stay-on-path
- Walk samples spine, gate apron, hub spokes, land path ribbons, and ride rings
- Hub plaza (≤ hubOuter+2.5 m) stays free; elsewhere soft-pull to nearest walk segment
- Rail/stadium clamp unchanged; LAYOUT.md / BUILDINGS footprints untouched

## Pass 8 — winding spine ribbon (not a straight box)
- Replaced Gate↔Hub↔north asphalt boxes with soft S-curve ribbons (weave ±~4 m)
- Width still LOCK.spineWidth (14 m); gate apron box kept; walk segs follow ribbon samples
- Hub plaza / land ribbons / rings / BUILDINGS / LAYOUT.md unchanged

## Pass 9 — finer lake-edge path ribbon tracing
- Replaced coarse freehand land polylines with ellipse-sampled ribbons from LOCK.waters (+margin)
- Denser rings (48–72 pts) + short connectors between nearby large lakes
- Water ellipses / spine width / hub / rings / BUILDINGS / LAYOUT.md unchanged

## Pass 10 — stay-on-path corner cuts
- Hard snap onto nearest ribbon when off-path (removed 0.6 blend that chorded corners)
- Travel-aligned segment preference in nearestWalk; tighter ribbon half-widths
- LAYOUT / waters / spine width / BUILDINGS unchanged

## Pass 11 — fuller lake shoreline path network
- Outer promenade bands on large lakes + shore-arc connectors (MST-ish) between rx≥16 waters
- West-lake spurs toward spine shoulder; waters / LAYOUT / BUILDINGS unchanged

## Pass 12 — spine centerline matches blueprint (x=0)
- Replaced ±4 m S-weave with blueprint centerline at x=0; 14 m width held
- Soft scalloped edge ribbons inside half-width (not a hard box silhouette)
- Gate apron / hub / waters / BUILDINGS unchanged

## Pass 14 — denser Pocket understory / planted beds
- Dirt beds + hedge/bloom near Pocket SKUs; oak understory clumps in Pocket canopy
- Spine-shoulder hedge strips in +Z Pocket; rings / spine / hub / BUILDINGS held

## Pass 15 — guest-routing shore graph
- Each lake (rx≥16) links to two nearest neighbors via shore-arc + bridge (not MST-only)
- Links that cross the 14 m Gate→Hub spine are refused
- East and west large-lake spurs to spine shoulder; waters / BUILDINGS / LAYOUT unchanged

## Buildings — Pocket album hall (7bda880)
Completes SKU ladder in The Pocket (song=kiosk, EP=pavilion, album=full building).

| id | land | sku | x | z | w × d × h (m) |
|---|---|---|---:|---:|---|
| pocket-album | The Pocket | album | 22.0 | 112.0 | 18 × 14 × 8.4 |

- Inside Pocket canopy ellipse (80, 105, rx 95, rz 80); 14 m spine, hub r32, water, rings unmoved
- Gate wings + ring stations in `lock.js` `GATE` / `STATIONS`; 3D `rideStation` iterates `STATIONS`
- Clearance: `park/test-placement.mjs` + `park/lock.test.mjs`

## Pass 16 — CAD-traced 14 m spine edges
- Edge curbs from `spineCadPolyline` = blueprint hover meters x=±7, z=0 (hub) → z=+230 (Gate)
- Centerline still x=0, width LOCK.spineWidth 14 m; hub / gate / rings / waters unmoved
- Removed procedural sin scallops (Pass 12 visual-only flare)

## Pass 17 — named guest-walk circuit
- Replaced k-NN shore graph with `WALKS` in lock.js: Block Lakeshore (loop 0-4-3-2-1), Board Promenade (10-11), Block Spine Approach (lake 2 → x=-12)
- Eye-height walk-name signs; blueprint draws the same named dashed circuits
- No walk segment crosses the 14 m Gate→Hub spine; waters / rings / hub / gate unmoved

## Pass 18 — north −Z CAD corridor edges
- `northSpineCadPolyline` mirrors Pass 16 Gate CAD: x=±7 m, z=0 (hub) → z=−230 (−B)
- Blueprint north corridor fill + edge strokes; 14 m spine width / hub / rings / waters / BUILDINGS held

## Pass 19 — park-wide guest itinerary
- Added After Hours Quiet + Pocket Rim walks; `ITINERARY` Park Circuit sequences all named walks
- Hub-apron stitches between walk signs (no 14 m spine cut-through); Gate itinerary sign + blueprint dash
- Waters / rings / BUILDINGS / spine width held

## Pass 20 — timed tour markers
- `ITINERARY.stops` with atMin / legMin / totalMin 45; Gate sign shows duration
- Numbered disc markers at each walk sign; blueprint stop times; locks held

## Pass 21 — After Hours shore densify + wayfinding
- Second shore band on waters with cz < −5; itinerary chevrons on hub-apron legs (off spine strip)
- Waters / spine / rings / BUILDINGS held

## Pass 22 — Board shore densify
- Second shore band on waters with cx > 80 (The Board); waters / locks held

## Pass 23 — Block shore densify
- Second shore band on waters with cx < −60 (The Block); waters / locks held

## Pass 24 — Pocket shore densify
- Second shore band on Pocket-neighborhood waters; samples skip ring keep-outs; rings / waters held

## Pass 25 — corridor path lanterns
- Lantern posts outside ±7 m CAD edges on Gate +Z and north −Z corridors; spine width / locks held

## Pass 26 — hub plaza lantern ring
- 16-ish lanterns on r≈hubOuter+2.2 with ±Z spine gaps; hub / spine / locks held

## Pass 27 — ring approach aprons
- Path ribbons from hub/spine/Pocket approaches to ring outer+margin; outer curb ribbon; rings unmoved

## Pass 28 — Gate arrival plaza
- Arrival pad, welcome curbs/planters flanking spine, bollards; gate house / 14 m spine held

## Pass 29 — hub plaza benches
- Wood/iron benches on mid hub ring; spine gaps clear; hub meters held

## Pass 30 — land canopy edge ribbons
- Soft path ribbons tracing LOCK.canopies ellipses (spine samples skipped); canopies / locks held

## Pass 31 — stadium rail fence densify
- Denser posts (every 2nd rail sample) + double rail bars between; stadium rail path unmoved

## Pass 32 — evening fog / sky
- Dusk background + warmer Fog + HemisphereLight; layout locks held

## Pass 33 — water rim shimmer
- Specular pool + emissive inner ring; LOCK.waters ellipses unmoved

## Pass 34 — denser earth / grass patches
- Tone-varied ground discs across lands; waters / spine / buildings held

## Pass 35 — itinerary return-to-Gate leg
- Spine-shoulder return path from last walk to Gate; tour marker + Return sign; totalMin 52; spine strip clear

## Pass 36 — ride station queue polish
- Longer queueZig (n=10) with posts; STATIONS / rings unmoved

## Pass 37 — building window glow
- Emissive evening panes on SKUs; BUILDINGS footprints unmoved

## Pass 38 — denser path furniture along WALKS
- Lamps / benches / trash along named walk connectors, spurs, lake rims, and signs
- Placement skips 14 m spine strip, water ellipses, and BUILDINGS footprints

## FIX-ITINERARY (Quality GATE FAIL)
- Console: lock.js missing ITINERARY export (stale CDN vs Pass 38 index)
- Fix: keep `export const ITINERARY`, add PARK_ITINERARY re-export, cache-bust `lock.js?v=fix-itinerary`, defensive fallback in index

## Pass 39 — measured itinerary durations
- `measureItinerary()` derives atMin / legMin / totalMin from sign-to-sign + walk-path meters / LOCK.walk (1.34 m/s)
- Gate sign and tour markers read the measured `ITINERARY.totalMin`; no authored 52
- Layout locks / WALKS / rings / waters unmoved

## Pass 40 — denser planting along WALKS
- Land-biased tree clumps (willow/oak/pine/poplar) outside lake rims along named walks
- Skips spine strip, water, rings, BUILDINGS

## Buildings pass 20 — SKU kit facades (meters)
Callable `park/sku-kit.js` `skuKit()` always emits roof, overhang, window, queue, marquee, service door. 3D addKiosk/addPavilion/addHall/gateHouse/rideStation mount that kit. GATE/STATIONS footprints drive mesh size.

| role | source | x,z | w × d × h (m) |
|---|---|---|---|
| gate-west | GATE | -13.5, 233 | 9 × 7.2 × 8.6 |
| gate-east | GATE | 13.5, 233 | 9 × 7.2 × 8.6 |
| station-a | STATIONS | ring A + outer+9 | 14 × 7.5 × 4.05 |
| station-b | STATIONS | ring B + outer+9 | 8 × 6 × 3.6 |

## Still fake (worst next)
1. Durations are straight-line sign/lake meters, not the full ribbon polyline length
2. Night facade lighting is emissive panes only (no lamp contribution on walls)

## KEITH check-in — 2026-09-20 13:04 CDT
- FLEET: KEITH 15-min loop; Realm Engineer = park/; Site Luxury = park-site/; Quality GATE ordered
- SHIPPED Pass 5–8: ef8c8f8 / e987bd3 / 82da95d / 1f9a911
- SHIPPED Pass 9: finer lake-edge ribbon tracing
- SHIPPED Pass 10: stay-on-path corner cuts
- SHIPPED Pass 11: fuller lake shoreline path network
- SHIPPED Pass 12: blueprint spine centerline + soft edges
- SHIPPED Pass 13: Pocket SKU density near locked rings
- SHIPPED Pass 14: denser Pocket understory / planted beds
- CONSTRAINTS: no rebuild; LAYOUT.md meters; no hotel-tower

## KEITH fleet check-in — 2026-09-20 13:08 CDT
- **TIME:** 2026-09-20 13:08 CDT (America/Chicago)
- **FLEET:** KEITH COO; Realm Engineer = park/; Site Luxury = park-site/; Quality = GATE
- **STARTED:** First scheduled 15-min loop
- **GOING:** Park Pass 12 blueprint spine shipped; site Pass 11 polish shipped; no STOP
- SHIPPED Pass 15: guest-routing shore graph (k-NN, spine-safe)
- SHIPPED Pass 16: CAD-traced 14 m spine edges from blueprint hover
- SHIPPED Pass 17: named guest-walk circuit (Block Lakeshore / Board Promenade)
- SHIPPED Pass 18: north −Z CAD corridor edges
- SHIPPED Pass 19: park-wide guest itinerary (Park Circuit)
- SHIPPED Pass 20: timed tour markers (Park Circuit; total now 52 min)
- SHIPPED Pass 21: After Hours shore densify + wayfinding chevrons
- SHIPPED Pass 22: Board shore densify
- SHIPPED Pass 23: Block shore densify
- SHIPPED Pass 24: Pocket shore densify
- SHIPPED Pass 25: corridor path lanterns
- SHIPPED Pass 26: hub plaza lantern ring
- SHIPPED Pass 27: ring approach aprons
- SHIPPED Pass 28: Gate arrival plaza
- SHIPPED Pass 29: hub plaza benches
- SHIPPED Pass 30: land canopy edge ribbons
- SHIPPED Pass 31: stadium rail fence densify
- SHIPPED Pass 32: evening fog / sky
- SHIPPED Pass 33: water rim shimmer
- SHIPPED Pass 34: denser earth / grass patches
- SHIPPED Pass 35: itinerary return-to-Gate leg
- SHIPPED Pass 36: ride station queue polish
- SHIPPED Pass 37: building window glow
- SHIPPED Pass 38: denser path furniture along WALKS
- SHIPPED FIX-ITINERARY: restore/cache-bust ITINERARY export
- SHIPPED Pass 39: measured itinerary durations
- SHIPPED Pass 40: denser planting along WALKS
- SHIPPED Pass 39: denser planting along WALKS
- **NEXT:** (await Keith / Ryan STOP) polish itinerary timed tour or denser After Hours shore
- **CONSTRAINTS:** park/ only; LAYOUT.md meters; no hotel-tower; no rebuild; BUILDINGS footprints held
- **SOLUTIONS:** Ordered Pass 13 to Realm Engineer; Quality spot-check walk on live park URL
- **COMMITS:** bac38ad Pass 12; 918bf3c Pass 11; tip 6240551
- **BLOCKED BOTS:** none

## KEITH order — Pass 14 (2026-09-20 13:08 CDT)
- ORDERED Realm Engineer: Pass 14 denser Pocket understory/beds (rings held); then Pass 15 guest-routing shore graph
- ORDERED Site Luxury: Pass 14 density continue; Quality GATE live park URL
- No STOP

## KEITH fleet check-in — 2026-09-20 13:24 CDT
- **TIME:** 2026-09-20 13:24 CDT (America/Chicago)
- **FLEET:** KEITH COO; Realm Engineer = park/; Site Luxury = park-site/; Quality = GATE
- **STARTED:** Scheduled 15-min loop (no STOP from Ryan)
- **GOING:** Park tip still Pass 16 (CAD spine edges) — Realm Engineer idle since ~13:08; site blasting Pass 58–63 on main (tip 9f4d57f)
- **NEXT:** Pass 19 — park-wide guest itinerary after Pass 18 CAD north
- **CONSTRAINTS:** park/ only for Realm; LAYOUT.md meters; no hotel-tower; no rebuild; BUILDINGS/rings/waters held; never touch root index.html
- **SOLUTIONS:** Re-issued Pass 17 to Realm Engineer; Site Luxury continue Pass 64+ density; Quality spot-check live park Walk + site visit-paths/geometry
- **COMMITS:** tip 9f4d57f site STATUS Pass 58–63; 5b7613c Pass 63 geometry artists; b947529 Pass 62 directory; park BUILD unchanged since Pass 16
- **BLOCKED BOTS:** Realm Engineer — idle (ordered Pass 17 now); Site Luxury — not blocked

## KEITH fleet check-in — 2026-09-20 13:33 CDT
- **TIME:** 2026-09-20 13:33 CDT (America/Chicago)
- **FLEET:** KEITH COO; Realm Engineer = park/; Site Luxury = park-site/; Quality = GATE
- **STARTED:** Scheduled 15-min loop (no STOP from Ryan)
- **GOING:** Park shipping hard — Pass 31–34 landed in ~2 min (rail densify → fog/sky → water shimmer → earth/grass); tip 2b863a2 (park Pass 36: ride station queue polish). Site tip Pass 93 / Pass 73 audit (0 broken) then Site Luxury wrote STOP-for-re-dispatch — treating as idle, not Ryan STOP.
- **NEXT:** Pass 35 — itinerary walk-duration polish (segment lengths @ 1.34 m/s into ITINERARY.stops); then Pass 36 named-walk path furniture. Site Pass 94+ substance density.
- **CONSTRAINTS:** park/ only for Realm; park-site/ only for Site Luxury; LAYOUT.md meters; no hotel-tower; no rebuild; BUILDINGS/rings/waters/spine held; never touch root index.html
- **SOLUTIONS:** Ordered Pass 35 to Realm Engineer; re-dispatched Site Luxury Pass 94+; Quality live Walk + site hubs spot-check
- **COMMITS:** 309fbaa Pass 34 denser earth/grass; 817c83f Pass 33 water rim; 47e1c9c Pass 32 fog/sky; 4235c0a Pass 31 rail; 3f23159 Pass 73 site audit; 97566c8 Pass 93 Gate hubs; STATUS 865b82d
- **BLOCKED BOTS:** Site Luxury — idle (self-STOP for re-dispatch; ordered Pass 94+ now); Realm Engineer — not blocked
