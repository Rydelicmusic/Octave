# Octave — prototype showing

Date: 2026-09-24 00:22 CDT
Audience: room demo / investor / friend with a laptop.
Runtime: 3 minutes. Chrome or Safari desktop. Headphones if you have them.

## Open these, in this order

1. House (lobby)
   https://rydelicmusic.github.io/octave/
2. Luxury site (directory / lands / venues)
   https://rydelicmusic.github.io/octave/park-site/
3. Park (walk the grounds)
   https://rydelicmusic.github.io/octave/park/

Repo (source, not the demo): https://github.com/Rydelicmusic/octave

Do not open `blender/` or dump the whole tree. The live Pages URLs *are* the prototype.

## 3-minute click path

**0:00 — House**
Open the lobby. Scroll. Say the line: *walk in, don’t press play.* Point at About / Origin / Explore. Waitlist is mock-capture until a list backend is wired.

**0:45 — Site**
Open park-site. Home → one Land → one Venue. Roster on the mock floor is Vale Mercer, Juniper Kline, Solenne Park, Ori Hale. Guest / booking pages are design, not payments.

**1:30 — Park**
Open the park. Stay on Walk first. Hub is the origin. Lands:
- The Block −X
- After Hours −Z
- The Board +X
- The Pocket +Z
Gate is south. Switch to 3rd, then Drone, then back to Walk. Do not promise PLAY ALBUM or full album audio tonight.

**2:45 — Close**
One sentence: song = kiosk, EP = pavilion, album = building. Stadium is 760×460 m. This is the Rydelic park door, not a hotel tower, not Unreal.

## Real vs mock

| Real now | Mock / later |
|---|---|
| Live Pages URLs | Payments, wallet, Collector Pass |
| Park geometry + Walk / 3rd / Drone | PLAY ALBUM multi-floor auto-tour |
| Luxury site pages + mock roster | Real artist catalog |
| Waitlist field on the house | List backend (Buttondown / Loops) |
| Kit buildings / paths / lights | Full original-track ride audio |

## Known gaps (say them before they ask)

- iOS Safari: black void / scroll still a risk. Demo on desktop.
- Audio gaps. Do not lean on PLAY ALBUM.
- Park is kit-world density, not luxury chrome yet.
- GitHub Pages can flash “errored” while hubs still 200.
- `vime/` is a separate Friday slice. Not this showing unless asked.

## What is in the showing

- `index.html` + cinematic landing (house)
- `park-site/` (luxury directory)
- `park/` (3D walk)

## What is out

- `blender/`
- engine dumps
- 30k generated files
- hotel-tower language
- personal Drive except the existing Octave folder

## Offline fallback

Clone only those three surfaces:

```
git clone --depth 1 https://github.com/Rydelicmusic/octave.git
# serve root, or open park/index.html and park-site via a local static server
```

Do not rewrite `park/lock.js` or `park/index.html` in one shot during the showing.
