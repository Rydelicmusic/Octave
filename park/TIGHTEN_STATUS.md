# Tighten status

Date: 2026-09-23 00:51 CDT
Rewritten for the pivot. Statuses were not promoted. The tab check is in park/PIVOT.md. The battery is in park/QC_FINAL.md: pass 12, fail 0, stub 2.

| Feature | Status | Note |
| --- | --- | --- |
| boot | SHIPPED | Fresh profile, canvas 1280×633, zero exceptions. |
| cameras | SHIPPED | Walk, 3rd, and Drone each took the active button. |
| kit | STUB | Arches, lamps, plazas. Not a ride. |
| gate-icon | STUB | Crown and props. Not a ride. |
| haunt | SHIPPED | One mount latch. Night skin is on. |
| attractions motion | SHIPPED | One `tickMotion` call, from the page tick. Train s moved in the tab. |
| 8 ride pads | STUB | Eight `addRide*` calls and a 1.2 m stone under each kiosk anchor. Not the coaster. |
| paths.js | SHIPPED | Hero path, 63 samples, seam 0, dry maxY 35.9, no NaN. |
| ride-cam | SHIPPED | Battery boarded, refused COURSE, Esc cleared the ride. Not clicked in the tab this cycle. |
| physics | SHIPPED | Hero energy step. Not claimed for all eight. |
| ride-ops | SHIPPED | COURSE refuses a board. |
| queues | STUB | Slot list. No queue building. |
| clock | SHIPPED | Tab showed 10:00 OPEN NEED TICKET on the raw URL. |
| ticket/door | SHIPPED | Door page and `?admit=1` exist. This tab was the raw URL, so it correctly asked for a ticket. |
| alive bots | SHIPPED | Riders still parent to `${id}-car`. Not counted in the screenshot. |
| terrain | STUB | Grade module exists. The Gate road still reads level. |
| water allow-list | SHIPPED | Four basins, one Pocket pool, hub and spine hits 0. Old `LOCK.waters` stays gated. |
| ground NPCs | STUB | Mount asks for 40. This tab did not count them. |
| ride-score | STUB | HUD said `score: stub`. No file request. |
| spectacular | STUB | Floats not mounted. |
| mobile stick | STUB | The pad is in the page. A wide desktop does not force the phone buttons. Not exercised as a phone. |
| visit memory | STUB | The module stores admit and last ride. This tab did not refresh. |
| QC logs | STUB | Older logs are not this scoreboard. This scoreboard is QC_FINAL.md. |
| Drive stamps | SHIPPED | Prior binge folders exist. This pivot folder is cycle 235. |

Launch, the wheel, and the swings still mount. They are not a proven Gate walk. The scene’s Block Coaster is `paths.js`. The older 500 m samples remain only for the older QC files.
