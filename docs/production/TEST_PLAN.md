# Verification plan

Status: implementation checks pending. M0 can validate document structure, local links, requirement consistency, repository contents, and commit cleanliness only.

For every future run record build commit, date, tester, hardware, browser/version, seed, player count, network conditions, assist settings, procedure, actual outcome, and evidence location. Mark automated replay separately from manual play. Do not include private recordings or logs in a public repository without review.

| Suite | Required cases | Status |
|---|---|---|
| Movement | Slopes, buffered jump, air recovery, 30/60/120 render fps, blur | Pending |
| Cargo | Grab/release, wall collision, extreme speed, capacity, full containment | Pending |
| Tools | Valid contact, heat thresholds, cooldown, no duplicated extraction | Pending |
| Mission | Start readiness, warnings, exact zero tick, early/all-downed departure | Pending |
| Economy | Bible 252-credit/13-RP fixture, rounding, no debt, discovery uniqueness | Pending |
| Save | Transaction interruption, migration, duplicate receipt, corrupt/newer import | Pending |
| Network | 2–4 clients, contested handle, 150 ms RTT, disconnect, reconnect, server failure | Pending |
| Accessibility | Rebind, toggle, text scale, captions, patterns, camera options, controller | Pending |
| Performance | Named integrated-GPU device, p95 frame time, body budget, memory growth | Pending |
| Manual fun | Novice first cargo, cargo route choices, voluntary assists, replay interest | Pending |
| Deployment | Clean-profile public load, full route, save/reload, online health separately | Pending |

Initial browser matrix: current stable Chromium-based browser and Firefox on Windows; add Safari on macOS before claiming broad desktop compatibility. Record exact tested versions when executable builds exist. Release-sensitive platform requirements must be rechecked then.
