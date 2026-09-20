# PASSDOWN — Octave / Rydelic Park STOP
**From:** Keith (COO) · **To:** Ryan / next Grok chat / build hands  
**Date:** Sunday, September 20, 2026 · **Time:** ~2:28 PM CDT  
**Timestamp:** 2026-09-20T14:28:00-05:00  
**Status:** STOP — fleet halted. Do not densify until Ryan restarts.

## Repo + live
- **Repo:** https://github.com/Rydelicmusic/octave (branch `main`)
- **3D Park:** https://rydelicmusic.github.io/octave/park/
- **Luxury site:** https://rydelicmusic.github.io/octave/park-site/
- **Blueprint 2D:** https://rydelicmusic.github.io/octave/park/blueprint.html
- **Drive (canon sheet + prior handoffs):** https://drive.google.com/drive/folders/1D9R9wXMiDDEYJfbQl4cTKR-NC-R8E023
- **This STOP pack (Drive):** https://drive.google.com/drive/folders/1vZfFxdQUo4pcfn7Et84DfKSsvdW4IVKr

## Tip state at STOP (verify with `git log -1` — tip races)
- **Park tip (known):** `ad6b871` — park Pass 69: Boardwalk shore seating clusters
- **Site tip (known):** `e42b07c` — park-site Pass 201 STATUS (Pass 195–200 densify just before halt)
- **Authoritative logs:** `park/BUILD.md`, `park-site/STATUS.md`

## Who did what
| Role | Owner | Folder |
|---|---|---|
| COO | Keith | ops / orders / STATUS+BUILD check-ins |
| Park 3D | Realm Engineer | `park/` only |
| Luxury site | Site Luxury | `park-site/` only |
| QA | Quality | GATE only — does not build |

Lane bots LAYOUT/BUILDINGS/GROUNDS/SITE-* were **folded** into Realm Engineer + Site Luxury.

## LOCKED (do not reopen)
See `LOCKED-CANON.md` and repo `park/LAYOUT.md`.
- Stadium 760×460, A=380 B=230, Gate (0,+230), hub r18/32, spine 14 m
- +X The Board, −X The Block, +Z Gate/Pocket, −Z After Hours
- Rings A (95,95) 14/20, B (118,108) 6/11 unmoved
- Water list in LAYOUT.md / lock.js
- Song=kiosk, EP=pavilion, album=building
- Never touch root `index.html` unless Ryan dates a new lock
- No hotel / tower / elevator language in park v1
- Density and proportion over novelty
- `LAYOUT.md` wins — no rebuild from scratch

## MOCK roster (stable)
1. Vale Mercer — The Block — Night Ledger, Concrete Hymn, West Gate Echo  
2. Juniper Kline — After Hours — Last Call Geometry, Velvet Cap R, Northern Quiet  
3. Solenne Park — The Board — East Glass Walk, Boardline, Measured Light  
4. Ori Hale — The Pocket — Spine Fourteen, Gate Distance, Plaza Rings  

## Park 3D — what shipped (summary)
**Passes 1–4:** SKU buildings, ribbons/trees, gate/stations/furniture, walk faces hub  
**5–12:** facades, species crowns, stay-on-path, spine ribbon→CAD centerline, lake ribbons, shore network  
**13–20:** Pocket SKUs, understory, guest-routing, CAD edges, named walks, itinerary + timed tour  
**21–40:** shore densify ×4 lands, lanterns, aprons, Gate plaza, benches, canopy edges, rail, fog/sky, water shimmer, earth, return-to-Gate, queues, window glow, path furniture, FIX-ITINERARY, measured durations, WALKS planting  
**41–47:** ribbon tour meters, sku-kit restore, PointLights, hub-apron itinerary, denser lights, ride-station kit + zig-in-kit, Catmull tour meters  
**Buildings 20–28:** sku-kit facades, roof gap close, album mass fix, marquee 3.35 m, 1.05 m queue rails, gate bridge, ground windows, gate queues 2.2 m  
**48–69:** denser PointLights, gate tickets, water densify, facade mid-block, night fill, earth, stadium rail, hub plaza, path curbs, wayfinding, seating, understory, tour seating, Gate secondary queue, service aprons, water mist, PathRibbon curbs, Gate approach, station shade, hub mid, After Hours furniture, Boardwalk seating  

Read full detail in `park/BUILD.md`.

## park-site — what shipped (summary)
- Pass 1 scaffold → Home→Land→Artist→Work  
- Pass 2–4 venue nests, journal, desk density  
- **FIX-VENUE-404** `c95c7e2` — 12 short-slug venues live  
- **FIX-GUEST-BOOKING-INDEX** `ba665e5` — guest/ + booking/ indexes 200  
- Densify through Pass ~201: notes/, materials/, guest/, booking/, court/, measure/, press/, light/, sound/, land foyers, artist bios, nest rooms, link audits often 0 broken  

Read full detail in `park-site/STATUS.md`.

## Quality gates
| Gate | Result | Notes |
|---|---|---|
| Park Pass 5–8 | PASS | LAYOUT meters held |
| Venue short-slug 404 | FAIL → PASS | Fixed c95c7e2 |
| Walk ITINERARY export | FAIL → PASS | Fixed f3667d8; canvas lit |
| guest/booking indexes | FAIL → PASS | Fixed ba665e5 |
| Later spot-checks | PASS | Pages API sometimes "errored" while HTTP 200 |

## Known issues at STOP
1. **Pages API intermittent "errored"** while hubs still return HTTP 200 — watch deploy window after pushes.  
2. Park is denser but still **kit-world** vs luxury editorial chrome.  
3. Fleet may have been mid Pass 69/201 when STOP cancelled turns — confirm tip with `git log`.  
4. GitHub writes: use connector **user-GitHub-xai** (user-Github write 403).  

## Files next Grok must read (in order)
1. This pack: `PASSDOWN.md`, `RESUME-FOR-NEXT-GROK.md`, `LOCKED-CANON.md`  
2. `park/LAYOUT.md`  
3. `park/BUILD.md` (Still fake + tip)  
4. `park-site/STATUS.md`  
5. `park/lock.js`, `park/index.html`, `park/sku-kit.js`  
6. Prior Drive handoff `handoff/2026-09-20-1228-CDT/` in repo if needed  

## How to resume (Ryan must say restart / not STOP)
1. Unpause or recreate 15-min COO loop if desired.  
2. Assign Realm Engineer → park/ next Still fake from BUILD.md.  
3. Assign Site Luxury → park-site/ densify; keep FIX paths 200; no basename collisions.  
4. Quality GATE live Walk + hubs after each blocking fix.  
5. One lane per folder. Commit + push every pass. LAYOUT.md wins.
