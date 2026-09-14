# Moon Goons

A browser-first cooperative physics extraction game about underqualified scientists, valuable cargo, floaty space travel, and questionable equipment.

**Current milestone: design foundation.** Documentation and development folders are prepared. There is no playable build, installed dependency set, or public play URL yet.

## Start here

- [Game Design Bible](GAME_DESIGN_BIBLE.md) — primary creative and systems reference.
- [Production GDD](GDD.md) — derived requirements and acceptance criteria.
- [Backlog](docs/production/BACKLOG.md) — implementation order and scope gates.
- [Test plan](docs/production/TEST_PLAN.md) — future verification; no playtests claimed.
- [Architecture baseline](docs/architecture/ADR-001-browser-first.md) — proposed stack and boundaries.
- [Concept provenance](concept/ORIGINAL_CONCEPT.md) — recovered premise and expansion policy.
- [Source and asset register](docs/reference/SOURCES_AND_ASSETS.md) — technical references and future asset licensing.

## Development direction

First build a solo Practice Moon prototype, then validate real 2–4-player network physics before adding destinations. Proposed stack: TypeScript, Three.js, Rapier, and Vite, with a later authoritative Node session service. Pin and verify dependencies when implementation begins; no installation commands or scripts exist yet.

`prototype/` holds future browser source and runtime assets; `server/` and `shared/` reserve online boundaries; `art/`, `audio/`, and `concept/` hold creative work. `tests/` will hold meaningful simulation, save, and network fixtures.

Future static builds should receive a verified public deployment under the parent workspace rules. Online sessions require a separate service. Steam packaging and a possible Unity port are later evaluated milestones, not implemented capabilities.

Keep this project in its own repository. Commit milestones and keep an off-machine copy; Git alone on one PC is not a backup. No open-source license has been selected, and third-party assets must have documented permission before use.
