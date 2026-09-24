# Build 0.4 — Scientist and handling

24 September 2026. Art follows the user-approved 0.3 world style.

Implemented: modular astronaut rig and detailed suit; gold visor outside shell; articulated elbows/knees; tool mounted in hand; idle/walk/float/carry/drill/landing poses; animated burst/air-brake jets. No physical ragdoll was added.

Handling: B or right mouse brakes horizontal drift in air (gravity remains); grounded brace steadies and lowers cargo; braced E release reduces residual horizontal motion/spin. Normal release remains available. Scanner radius increases to 24 m.

Validation: TypeScript and production build pass. All 13 tests pass, including full ore/glass/core route (225 CR, 12 RP), airborne braking versus coasting, and undamaged braced glass delivery. Browser input replay and close-up visual inspection cover the new rig and cargo route. This is automated/agent testing, not a player feel study. Minimum-hardware qualification and multiplayer remain pending. Build retains the existing large-bundle warning (~1.31 MB gzip).
