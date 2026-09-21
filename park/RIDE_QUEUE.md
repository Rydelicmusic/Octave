# Ride queue — Build takes the first OPEN row only
Status: OPEN | DONE | BLOCKED

| # | status | land | sku | id | cell hint | notes |
|---|--------|------|-----|-----|-----------|-------|
| 1 | OPEN | The Board | kiosk | ride-board-01 | G6,0 or next free | song pad + 4 m queue facing drive |
| 2 | OPEN | The Block | kiosk | ride-block-01 | G-8,1 | same |
| 3 | OPEN | After Hours | kiosk | ride-hours-01 | G0,-7 | same |
| 4 | OPEN | The Pocket | kiosk | ride-pocket-01 | G4,4 | keep off locked rings |
| 5 | OPEN | The Board | pavilion | ride-board-02 | next free Board cell | EP after #1 DONE |
| 6 | OPEN | The Block | pavilion | ride-block-02 | next free Block cell | after #2 |
| 7 | OPEN | After Hours | pavilion | ride-hours-02 | next free Hours cell | after #3 |
| 8 | OPEN | The Pocket | pavilion | ride-pocket-02 | next free Pocket cell | after #4 |
| 9 | OPEN | Gate | prop | ride-gate-signs | Gate (0,230) | wayfinding only, not on spine |

When an item ships: set status DONE, write cell + x,z in notes.
Do not start #5 until #1 is DONE. Same pattern per land.
