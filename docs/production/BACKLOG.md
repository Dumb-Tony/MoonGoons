# Milestone backlog

All implementation items are pending. M0 is the documentation/scaffolding deliverable; Git commit verification is performed when installing this project.

| Order | Item | Dependency | Acceptance reference |
|---|---|---|---|
| 1 | Choose/pin runtime and create movement laboratory | M0 | MOVE-01, CAM-01, INPUT-01 |
| 2 | Add loose core, grab constraint, bounds recovery | 1 | PHYS-01, GRAB-01 |
| 3 | Manually tune jumping, braking, carrying | 2 | Bible 21 movement gate |
| 4 | Add authored moon deposits, scan, drill, heat | 3 | MAP-01, SCAN-01, TOOL-01, HEAT-01 |
| 5 | Add cargo bay, deadline, results | 4 | CARGO-01/02, TIME-01, PAY-01 |
| 6 | Add tutorial, settings, saves/export | 5 | LEARN-01, SAVE-01 |
| 7 | Publish/verify solo prototype | 6 | RELEASE-01 |
| 8 | Prove two then four clients and shared hauling | 5 minimum | NET-01/02 |
| 9 | Add tether, cart, wrench, rescue, ship/research | 8 | COOP-01, HUB-01 |
| 10 | Group playtest and controller/accessibility pass | 9 | ACCESS-01, Bible 21 |
| 11 | Add Rust Belt then Icebox | 10 | WORLD-01 |
| 12 | Browser release hardening and operations | 11 | Bible P2B gate |
| 13 | Evaluate desktop/Steam packaging | 12 | Bible P3 gate |
| 14 | Decide whether Unity port is justified | Evidence from 13 | Bible P4 gate |

Do not add future-biome implementation tasks to the current sprint. Convert one row at a time into concrete work with a named requirement, short test plan, and known scope boundary.
