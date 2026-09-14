# Browser prototype workspace

Reserved for P0 implementation. This is not a runnable prototype yet.

First task: build a movement/hauling laboratory with a third-person camera, one scientist capsule, fixed-step low gravity, one dense cargo core, force-limited grabbing, and safe recovery. Use [GDD requirements](../GDD.md) MOVE-01, CAM-01, PHYS-01, and GRAB-01.

Choose compatible pinned TypeScript/Three.js/Rapier/Vite versions during that task. Add package scripts and a lockfile only when they actually run. Keep assets local and use relative paths so the future distribution can be served from a repository subpath.

Module folders reserve core, simulation, gameplay, content, presentation, UI, and platform responsibilities. Do not implement multiplayer transport directly inside visual components.
