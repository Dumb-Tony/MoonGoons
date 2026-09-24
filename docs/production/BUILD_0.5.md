# Build 0.5 — Jetpack and Cinder Basin

Scope: first authored expedition slice, retaining the approved world art direction.

Implemented: hold-R fuelled flight, mass-dependent thrust, grounded recharge, reserve burst retained, fuel HUD/plumes/synthesized audio, two elevated relay landing sites, matching platform collision/render geometry, northern mesas/excavation, guide lights, map/world markers, and per-sortie survey plus 150 CR extraction objective. Partial salvage extraction remains valid.

Verification: all 17 automated tests pass, covering fuel exhaustion and grounded recovery, air braking, fragile cargo delivery, both relay landings and return, and the full three-resource-plus-survey contract inside the 300-second deadline without recalls. Browser flight replay is an automated input sequence, not a human feel study. Typecheck/build pass; existing ~1.31 MB gzip bundle warning remains. No hardware qualification, multiplayer or campaign progression is claimed.

Level design: south is the gentle harvest yard; west is the lower first ascent; east is the higher second ascent. The excavation and visual gantry create a central landmark. Platform corners and route posts are lit. Players can stop on ordinary ground or decks to recharge. Surveying requires landing, not merely flying above a marker. Surface-set-down uses a downward physics ray so deck height is respected.

Browser verification: both relay flags reached 2/2, fuel consumed during flight and recovered after landing, and the pilot returned to the cargo bay with no browser errors. Complete physics contract: 185 seconds, 225 CR / 12 RP, no recalls. Raised-deck cargo set-down and heavy-load lift reduction also pass focused physics tests.
