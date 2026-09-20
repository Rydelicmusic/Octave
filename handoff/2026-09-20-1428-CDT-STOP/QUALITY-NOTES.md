# Quality GATE notes — octave park / park-site
Director: Ryan / Rydelic. Quality lane = GATE only.

## Gate history (FAIL → FIX → PASS)

### 1. Venue short-slug 404

| | |
|---|---|
| Symptom | Short-slug venue paths 404 on live Pages (e.g. west-gate-echo and peers) |
| Verdict | **FAIL** |
| FIX | `c95c7e2` — `park-site FIX-VENUE-404: ship 11 short-slug venues + STATUS (12 paths live)` (related `60dac10` west-gate-echo) |
| Re-gate | **PASS** — 12 short-slug venue paths live 200 |

### 2. Walk ITINERARY export / Walk SyntaxError

| | |
|---|---|
| Symptom | Console: `lock.js` missing `ITINERARY` export (stale CDN vs Pass 38+ index); Walk broken |
| Verdict | **FAIL** (Quality GATE) |
| FIX | `f3667d8` — `park FIX-ITINERARY: restore export + cache-bust Walk load` — keep `export const ITINERARY`, `PARK_ITINERARY` re-export, `lock.js?v=fix-itinerary`, defensive fallback in index |
| Related | Buildings pass 21 restored `sku-kit` import after Pass 41 Walk SyntaxError |
| Re-gate | **PASS** — Walk loads; itinerary signs/markers present |

### 3. Guest / booking directory index hubs

| | |
|---|---|
| Symptom | `guest/` and `booking/` lacked proper `index.html` hubs (dir vs page / Pages collision fallout after nesting) |
| Verdict | **FAIL** |
| FIX | `ba665e5` — `park-site FIX-GUEST-BOOKING-INDEX: ship guest/index.html + booking/index.html hubs` |
| Related | `eb99a5d` nest guest/+booking/; remove colliding basename files |
| Re-gate | **PASS** — `/guest/`, `/guest/index.html`, `/booking/`, `/booking/index.html` live 200; FIX markers retained through densify passes |

## Last spot-checks before STOP (PASS)

| Check | Result | Notes |
|---|---|---|
| Live park Walk URL | **PASS** | https://rydelicmusic.github.io/octave/park/ — hubs 200; Walk spot screens in box (`keith-spot*`) |
| Live park-site hubs | **PASS** | Gate, map, geometry, programs, guest/, booking/, lands short-slugs — 200 |
| Pass 191 / 195–201 re-probes | **PASS** | First-probe 404s attributed to Pages lag; re-probe 200 |
| Link audits (recent densify) | **PASS** | Pass 201 STATUS: **14803 OK / 0 broken** |
| Pages API status | **WARN** | Intermittently `errored` while live still 200 — do not FAIL on API alone |

## Operating rule for Quality

1. Probe **live HTTP**, not only Pages API.
2. On new dirs, **re-probe** once before FAIL (lag).
3. FAIL → request FIX commit in owning lane → re-gate until PASS.
4. Do not densify product files in the Quality lane.

## FIX SHA quick list

| SHA | Fix |
|---|---|
| `f3667d8` | FIX-ITINERARY |
| `c95c7e2` | FIX-VENUE-404 |
| `ba665e5` | FIX-GUEST-BOOKING-INDEX |
