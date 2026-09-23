# Build 0.3 — Visual overhaul

Date: 22 September 2026. Scope: presentation upgrade of the solo field test.

## Implemented
- Procedural surface color/bump textures; weathered panels, lunar grit, mineral colors and woven suit fabric.
- Detailed teal/ochre ship, rounded astronaut with reflective visor, glowing crystals and lights.
- Nebula/star backdrop, gas giant and continuous distant ridges; dust and 96 pooled footprint decals.
- High: 2048 shadow map, ambient occlusion, restrained bloom, tone mapping and SMAA.
- Optional SSR: selected glossy surfaces, half-resolution reflection target, blur and distance/fresnel fading. Default off.
- Performance: direct rendering, textures and 1024 shadows retained, expensive post effects bypassed.

## Evidence
- Type checking and production build pass. Build warns about the large bundled JS chunk (approximately 1.31 MB gzip including physics); no new runtime dependency was added.
- All 11 rule and real Rapier physics regression tests pass. Three-resource physical route produces 225 credits / 12 RP in 117 simulated seconds.
- In-app Chromium visual inspection confirms textured terrain, shadows, ship lighting, suit and reflective bay rendering.
- Automated browser input replay with SSR enabled mines, carries, banks and extracts ore at full condition: 40 credits / 2 RP. This is an input replay, not a human feel study.
- Local diagnostic frame samples were above 90 fps in this browser session, including SSR. These short samples are not comparative benchmarks or minimum-hardware qualification.
- Existing production profile schema and gameplay simulation are unchanged.

## Limits
SSR traces visible screen information; it misses off-screen/occluded content and can show edge artifacts. Static environment reflections do not track dynamic cargo. This build does not use hardware ray tracing or path tracing. Performance mode temporarily suppresses the saved SSR preference. Visual effects need broader device testing; no low-end/mobile guarantee is made. Co-op and native ports remain pending.

Additional browser check: performance-mode replay also secured/extracted ore at 40 credits / 2 RP. Toggling back to standard quality restored the high-quality pipeline.
