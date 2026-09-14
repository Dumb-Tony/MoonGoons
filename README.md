# Moon Goons

**A small moon. A big haul. A deeply unqualified scientist.**

Browser-first cooperative physics extraction game. The current **0.2 solo field test** is playable; online co-op remains a later milestone.

## Play

[Play Moon Goons](https://dumb-tony.github.io/MoonGoons/)

Choose a five-minute sortie or untimed practice. Scan and drill deposits, carry the freed cargo into the ship's striped bay, release it, and let it settle. Only secured cargo earns credits and research. Practice does not award permanent progress.

| Action | Default |
|---|---|
| Move / look | WASD / mouse; right-drag or arrows if mouse capture is unavailable |
| Jump / sprint | Space / Shift |
| Grab or release | E |
| Drill | Hold left mouse with drill equipped |
| Equip drill / scanner | 1 / 2 |
| Quick scan / emergency burst | F / Q |
| Brace / pause | Right mouse / Escape |

Settings include rebinding, sensitivity, field of view, text size, low graphics, invert look, sprint/tool toggles, sound volume, and save export/import. Browser data is local to the site's origin; export a backup before changing computers. Local-preview progress and public-site progress are separate unless you transfer a backup.

## Development

Working folder: `C:\GPT_DEV\GPT Moon Goons`. The earlier `C:\GPT_DEV\MoonGoons` folder remains a design-only snapshot; continue development in the new folder.

Requires Node 24. From `prototype/`:

```sh
npm ci
npm run dev
npm test
npm run build
```

The app uses pinned TypeScript, Three.js, Rapier, and Vite packages. Static production files are built into `prototype/dist/`; the GitHub workflow tests, builds, and publishes them. No runtime CDN or service credential is required. Online play will need a separate authoritative session service.

## Project references

- [Game Design Bible](GAME_DESIGN_BIBLE.md) — primary design reference and long-term gates.
- [Production GDD](GDD.md) — requirements, current scope, and acceptance criteria.
- [Build verification](docs/production/BUILD_0.2.md) — what was tested and what remains unproven.
- [Backlog](docs/production/BACKLOG.md) — next milestones.
- [Sources and assets](docs/reference/SOURCES_AND_ASSETS.md) — provenance and licensing.

The public prototype does not include online co-op, research purchases, extra biomes, Steam integration, or a Unity port. No external newcomer/group feel study has been completed. All visual models and effects are authored procedural assets; sound effects are synthesized locally.
