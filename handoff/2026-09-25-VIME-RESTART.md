# VIME — RESTART

Date: Fri 2026-09-25 23:40 CDT
From: Keith (COO). Director: Ryan.
Base SHA (main): `cda3730b5cc46f02b8258fe239f3f8379ce71734` ("Rydelic tutorial door: type the name, option to view the park")

## What VIME is (Ryan, 2026-09-25 23:26 CDT)

VIME is a commissionable virtual interactive music experience. It is a VR/browser world where fans explore music and one another, and connect with artists in a way no prior music setting allows. Artists commission rooms. That is the company.

## Locked (unchanged)

- Repo `Rydelicmusic/octave`, branch `main`.
- `park/LAYOUT.md` wins. No hotel-tower language in park v1.
- Never rewrite `park/lock.js` or `park/index.html` in one shot. Small, additive commits only.
- Root `index.html` only with a dated lock from Ryan.
- Prototype-showing pack already exists at `handoff/prototype-showing/` (SHOWING.md + README.md). Park and park-site are not rebuilt tonight.
- No densify loop. The 15-minute fleet check-in stays paused unless Ryan asks.

## Live doors (checked 2026-09-25 ~23:35 CDT, all HTTP 200)

| Door | URL | Check |
|---|---|---|
| Root (house / lobby) | https://rydelicmusic.github.io/octave/ | 200. Boot shim loads lobby from pinned raw SHA `de755d1` (200, 55 KB) plus `cinematic-landing.js` (200) |
| Park (3D walk) | https://rydelicmusic.github.io/octave/park/ | 200, ~100 KB |
| Park-site (luxury directory) | https://rydelicmusic.github.io/octave/park-site/ | 200 |
| VIME (Realm One) | https://rydelicmusic.github.io/octave/vime/ | 200. Vite build; main JS bundle 200 (1.3 MB), CSS 200 |

HTTP checks only. No headless render was run tonight.

## Real vs mock

| Real now | Mock / later |
|---|---|
| Four live Pages doors (above) | Other fans in the world (no presence, no multiplayer backend) |
| Park geometry, Walk / 3rd / Drone, lands per LAYOUT.md | Artist commissioning flow (no form, no payment, no per-artist room data) |
| Park rides: board from HUD, dispatch (commits `177c91c`..`f2207af`) | Real artist catalog. Roster is mock: Vale Mercer (Block), Juniper Kline (After Hours), Solenne Park (Board), Ori Hale (Pocket) |
| Park-site pages + mock roster | Payments, wallet, Collector Pass, guest booking |
| `vime/` Realm One scene (one 3D room, audio folder, built bundle) | Link between park and `vime/` (none today; they are separate doors) |
| Root tutorial door (type the name, option to view the park) | Waitlist backend (field is mock-capture) |
| | PLAY ALBUM tour, full ride audio; iOS Safari void risk |

## Next slice (pick one, smallest)

Chosen: **artist-room door.**

Why this and not presence of other fans: presence needs a realtime backend (hosting, sockets or a service, identity, moderation). That is not a one-job slice, and faked ghost fans would be theater. An artist-room door uses only what already exists (park + `vime/` Realm One) and it is the literal product sentence: artists commission rooms, and fans walk into them. Fan presence is the slice after this.

### Friday-done line (Fri 2026-10-02)

On https://rydelicmusic.github.io/octave/park/, in Walk view, a fan walks from spawn to one marked door for one mock artist (Ori Hale, The Pocket, +Z, nearest the Gate), sees the label "Ori Hale — room", presses E or clicks, and lands in https://rydelicmusic.github.io/octave/vime/ (Realm One) with `?artist=ori-hale` in the URL, and a visible way back to the park. Desktop Chrome and Safari. Park still loads with zero new console errors, and Walk / 3rd / Drone still work.

### Out of scope for this slice

- Other fans / multiplayer / chat.
- Commissioning form, payments, real artist data.
- More than one door. More than one artist.
- Any change to root `index.html`, `park/lock.js` rewrite, park-site, or LAYOUT.md values.
- Rebuilding `vime/`. If showing the artist name inside Realm One needs a rebuild, ship the door without it and note it.

## Assignment

- Build: Realm Engineer (owns `park/`). One job, this slice only.
- Gate after push: Quality checks the Friday-done line above, PASS/FAIL with a one-line reason.
- Keith: no loop, no check-in routine. Next action only when Engineer reports or Ryan asks.

## Blockers

- None to start.
- Watch: `vime/` is a built bundle; its source location must be confirmed before any in-room change. Door plus link needs no rebuild.
- Known noise: GitHub Pages API can report "errored" while pages still return 200.
