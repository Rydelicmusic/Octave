# Ride queue — Build takes the first OPEN row only
Status: OPEN | DONE | BLOCKED

| # | status | land | sku | id | cell hint | notes |
|---|--------|------|-----|-----|-----------|-------|
| 1 | DONE | The Board | kiosk | ride-board-01 | G6,0 | G6,0 / x 160 z 14 / 6 × 4 m · queue 4 m toward board-drive |
| 2 | DONE | The Block | kiosk | ride-block-01 | G-8,1 | G-8,1 / x -187.5 z 37.5 / 6 × 4 m · queue 4 m toward block-drive |
| 3 | DONE | After Hours | kiosk | ride-hours-01 | G-2,-7 | G0,-7 hit spine; G-2,-7 / x -36 z -175 / 6 × 4 m · queue toward hours-drive |
| 4 | DONE | The Pocket | kiosk | ride-pocket-01 | G2,2 | G4,4 on rings; G2,2 / x 70 z 50 / 6 × 4 m · off rings, queue toward pocket-drive |
| 5 | DONE | The Board | pavilion | ride-board-02 | G7,0 | G7,0 / x 187.5 z 14 / 12 × 8 m · queue toward board-drive |
| 6 | DONE | The Block | pavilion | ride-block-02 | G-8,-1 | G-8,-1 / x -187.5 z -20 / 12 × 8 m · queue toward block-drive |
| 7 | DONE | After Hours | pavilion | ride-hours-02 | G-3,-7 | G-3,-7 / x -60 z -175 / 12 × 8 m · queue toward hours-drive |
| 8 | DONE | The Pocket | pavilion | ride-pocket-02 | G1,3 | G1,3 / x 40 z 80 / 12 × 8 m · off rings, queue toward pocket-drive |
| 9 | DONE | Gate | prop | ride-gate-signs | G-1,8 / G0,8 | x ±24 z 210 · wayfinding posts, off spine |

When an item ships: set status DONE, write cell + x,z in notes.
Do not start #5 until #1 is DONE. Same pattern per land.
