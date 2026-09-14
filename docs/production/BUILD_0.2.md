# Build 0.2 — Solo field test

Date: 2026-09-14. Working project moved to the user-created `C:\GPT_DEV\GPT Moon Goons` folder by cloning the design baseline and retaining its Git history/remote. The prior directory remains a design snapshot.

## Implemented

- A five-minute solo Practice Moon mission and untimed non-rewarding practice.
- Procedural moon, ship/cargo bay, astronaut animation, three sample types, and sound effects.
- Low-gravity movement, buffered jump, air correction, sprint, emergency bursts, and safe recall.
- Contact drilling, heat/lock/release recovery, one-second survey pulse, grabbing and force-limited hauling.
- Condition-sensitive glass, unique cargo manifest, capacity, one-second settling, deadline and results.
- Local research/credit rewards, IndexedDB writes with backup, duplicate-claim protection, import/export.
- Pause on focus loss, remapping, mouse-capture fallback, text/FOV/sensitivity/graphics/audio options.

## Automated evidence

Node 24.19.0; TypeScript 7.0.2; Three.js 0.186.0; Rapier 0.20.0; Vite 8.3.0.

The eleven automated checks passed. A real-physics route walked to, mined, carried, and banked one ore, one glass, and one core in approximately 117 seconds of simulated mission time: 225 credits, 12 RP, 15 volume, all three at full condition. The route avoids an unmined ore deposit on the direct line home from the core; players can also jump around that obstacle.

Additional checks cover jump/landing, burst/recall, deadline freeze, overheat recovery with fresh input, duplicate banking, capacity refusal, full containment/settling speed, mass-based carry penalty, repeated rewards, and malformed/future saves. These are automated simulation and rule checks, not human playtesting.

The TypeScript/build check passes. Initial compressed JavaScript is approximately 1.25 MB including physics, plus roughly 5 KB compressed styling. Hardware/frame-time qualification remains pending; the download-size target is met, but a low-end performance claim is not made.

## Browser verification

The Codex Chromium browser at 1280 × 720 rendered the landing page, gameplay HUD, scanner feedback, and results without a visible layout failure. A development-only input replay completed an ore harvest, carry, bay settling, extraction, and results through the live browser loop. The result showed one intact sample, 40 credits, and 2 RP. Reloading the page preserved 40 credits and 2 RP in the profile. This is an automated input replay with visual inspection, not a human feel study.

An embedded-browser pointer-capture failure was observed and fixed: left-click tool use now works without successful capture; right-drag and arrow-key look remain available. Final public deployment is checked after publishing, and its outcome is reported at handoff.

## Scope differences and open work

The original 26-section bible remains the long-term design reference. This is a first playable, not completion of every P0C acceptance gate. Survey objectives/bonus RP, music, full movement injury/stumble behavior, controller navigation, all assist modifiers, text-size audit at every viewport, measured camera comfort, formal newcomer testing, and performance certification remain pending. Research is earned and displayed, but the purchasable tree belongs to P1.

Current prototype uses a 2.8 m assisted selection radius (up from the 2.2 m starting hypothesis), a quick-scan F key in addition to the scanner tool, and mouse/arrow fallback for embedded browsers. Physical deposits block straight-line travel. A free optional recall remains available from pause. Early extraction is available with explicit confirmation and keeps only secured cargo.

Rendering runs local art, with no third-party asset service. The renderer/physics WASM are bundled. P1 networking must reuse command/rule boundaries while replacing the local authority; no multiplayer capability is implied by the current implementation.
