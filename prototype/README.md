# Moon Goons browser prototype — 0.2

The first playable solo mission uses the actual Rapier physics world for movement, cargo, extraction, and banking. Render/input frame rates are separated from the fixed 60 Hz simulation.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Source responsibilities: `content` defines tuning and resource types; `core` owns payout/heat/capacity rules; `simulation` owns the physics world and mission state; `presentation` owns procedural art/camera; `platform` owns saves/audio; `ui` owns styling; `main.ts` coordinates browser input and screens. Server/shared placeholders remain future P1 work.

Tests exercise the real physics route for ore/glass/core, jumping/recall, heat recovery, deadline locking, manifest conservation, reward idempotency, and invalid save rejection. They do not substitute for human feel testing. Test waypoints use walking inputs and physics rather than teleporting cargo into the ship; explicit teleporting is restricted to the out-of-bounds recovery fixture.

Development-only `?qa=route` shows a button that replays a one-sample harvest-and-bank mission through the same input/simulation path and results UI. It is removed from the production build. Production has no mission-mutation console API.

Rendering is built from code-generated meshes and canvas labels; no asset download is required. The static distribution includes the physics engine and renderer. Use HTTP(S), not direct `file://` loading.
