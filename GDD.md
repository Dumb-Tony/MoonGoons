# Moon Goons — Production Game Design Document

Version 1.1 • 14 September 2026 • Derived from GAME_DESIGN_BIBLE.md v1.1

Status: first solo prototype implemented. Requirements below describe the full production target; see docs/production/BUILD_0.2.md for tested coverage and unfinished gates. [GAME_DESIGN_BIBLE.md](GAME_DESIGN_BIBLE.md) is authoritative; this document defines implementation order, requirements, and acceptance evidence. Numeric defaults are unvalidated tuning hypotheses.

## 1. Product and production boundaries

Build a desktop-browser, third-person, low-poly cooperative physics extraction game for 1–4 scientists. Players select a destination, harvest physical cargo with tools, transport it under low gravity, secure it in a ship, and depart before a visible deadline. Credits and research expand future choices. Preserve simple controls, physical comedy with recovery, and a friendly tone.

The first playable is **solo P0**, not simulated multiplayer: a handcrafted Practice Moon, movement/camera, grab, drill/scanner, three resources, heat, five-minute field timer, cargo bay, results, restart, tutorial, settings, and local save/export. P0 has research-point earnings and a labeled tree preview only. P1 proves actual 2–4-player cooperation before more worlds are built.

Do not include enemies, procedural planets, voxel digging, live voice, global accounts, public matchmaking, Steam integration, or a Unity implementation in P0. Extracting a deposit swaps authored geometry and spawns its defined cargo; it is not arbitrary terrain destruction.

## 2. Requirement traceability

“Acceptance” below describes checks to perform during implementation. None are marked passed by this documentation milestone.

| ID | Requirement / acceptance condition | Bible section | Scope |
|---|---|---|---|
| MOVE-01 | Walk, sprint, jump, air correction, and burst on fixed-step simulation; same route behaves comparably at 30/60/120 render fps | 5–6 | P0A |
| CAM-01 | Third-person camera avoids terrain clipping, preserves horizon, exposes sensitivity/FOV/shake options | 5, 15 | P0A |
| INPUT-01 | Rebinding, hold/toggle, and lost-focus input clearing; no stuck drill on pointer-lock loss | 5, 15 | P0A/B |
| PHYS-01 | Cargo mass affects acceleration and stopping; no NaN state or persistent out-of-bounds player in stress course | 6–7 | P0A |
| GRAB-01 | E grabs highlighted handle within 2.2 m and line of sight; release clears constraint exactly once | 7 | P0A |
| TOOL-01 | Contact drill extracts starter ore after 6 s cumulative valid contact; invalid contact gives no progress | 8 | P0B |
| HEAT-01 | Heat +22/s active, −15/s idle/locked; warning 75, lock 100, unlock at 40 and fresh input | 8–9 | P0B |
| SCAN-01 | One-second scan pulse identifies category within 24 m; 4 s start-to-start cooldown; no required false positives | 8 | P0B |
| CARGO-01 | Bay secures only fully contained cargo moving below 1 m/s for 1 s with sufficient volume | 7 | P0B |
| CARGO-02 | Secured item cannot re-enter physics or earn another payout; failed capacity check preserves it | 7, 10 | P0B |
| TIME-01 | 300 s clock; warning at 60 s, cues at 30/10; manifest locks at zero before 3 s departure animation | 11 | P0B |
| PAY-01 | Payout/condition rounding matches bible example; no negative credits, no duplicate discoveries | 10 | P0B |
| MAP-01 | Authored 120 m square graybox has safe routes to all three resource types and 10 defined deposits | 11 | P0B |
| SAVE-01 | Results saved atomically; export/import round trip; corruption and newer schema preserve recovery options | 20 | P0C |
| LEARN-01 | Optional untimed tutorial; 4/5 new players secure first cargo within 3 min without spoken coaching | 15, 21 | P0C |
| NET-01 | 2–4 clients share server-owned cargo, tools, clock, and manifests with version checks | 18 | P1A |
| NET-02 | Simultaneous grabs, disconnect, 60 s reconnection, and duplicate result delivery preserve invariants | 18, 20 | P1A |
| COOP-01 | Tether, cart, wrench, co-carry, and rescue add voluntary cooperation without permanent role locks | 7–9 | P1B |
| HUB-01 | Ready checks, host-owned purchases, loadout loans, six P1 research nodes, results to next sortie | 13–14 | P1B |
| ACCESS-01 | Keyboard/controller menu navigation, captions, reduced effects, patterns, and text scaling validated | 15 | P1 public alpha |
| WORLD-01 | Rust Belt and Icebox each change route/handling choices while remaining solo-completable | 12 | P2A |
| RELEASE-01 | Public client URL and separate online server health verified; no secrets in distribution | 19, 23 | Each playable release |

## 3. First playable specification

### Scene and camera

One ship cabin with a 40-volume cargo bay, one ramp, a safe landing patch, crater, ridge, slope, and optional risky return shortcut. Ship beacon remains visible through the light dust warning. Place five ore deposits (20 kg, 4 volume each), three glass deposits (6 kg, 3 volume), and two cores (45 kg, 8 volume). Their 48 total volume exceeds bay capacity by 8, creating a selection decision.

Use a stable-horizon orbit camera, 4.5 m follow distance and 70° vertical FOV. Test occlusion around ship doors and large cargo. No camera roll during tumble. Training area teaches one jump and a short carry before starting a timed mission.

### Player and input

80 kg player; 4 m/s walk, 6 m/s sprint, 16 m/s² ground acceleration, 2.5 m/s² air acceleration with 4 m/s horizontal air-control cap. Practice Moon gravity is 3 m/s², jump launch speed 4.2 m/s. Keep 120 ms coyote time and 150 ms jump buffering. Two suit burst charges give 2 m/s each; grounded recharge is 8 s per charge. Clamp burst-driven extremes and preserve intentional recovery.

Bindings: WASD move, mouse look, Space jump, Shift sprint, E grab/release, left mouse tool, B or right mouse brace/air brake, Q burst, 1/2 or wheel tool slot, middle mouse ping, Escape menu. R is reserved for contextual tether release in P1. See bible section 5 for controller mapping. P0 scanner is suit-mounted and does not consume a tool slot; P1 loadouts use the same stable tool IDs with explicit slot rules.

P0 stumbles are brief and do not use full downing. Out-of-bounds player recalls to the last safe position; cargo applies bible recovery/loss rules. Do not punish a simulator fault as a player mistake.

### Harvest and transport

Scan highlights known resource category. Drill works only against a valid highlighted deposit within reach. Accumulated extraction progress persists when contact stops. On completion spawn one cargo entity, mark deposit depleted, and emit one extraction event. A heat lock does not erase progress.

Grab uses a force-limited spring handle. Carry speed multiplier is `clamp(1/(1+mass/40), 0.35, 1)`, sprint disabled above 35 kg, solo lifting disabled above 60 kg. No P0 item exceeds that lift limit. Distinguish hand target rendering from real cargo position; do not teleport through walls.

Glass begins at condition 1.0; each qualifying impact above 3 m/s loses 0.1, with 0.5 s same-contact debounce. Condition zero destroys the piece. P0 ore/core are stable. Base credit/RP pairs are ore 40/2, glass 65/4, core 120/6. Values are floored after multiplying by condition.

### Extraction and results

Securing checks full containment, speed below 1 m/s, free capacity, and one continuous second. Reset securing progress when any physical condition fails. Banking converts the piece to an immutable manifest entry, removes its rigid body/constraints, and updates bay UI. Container overlap alone does not pay.

The 300 s timer begins after loading and user start, never while tutorial/menu setup is incomplete. Deadline tick ordering is validated input → simulation/contact changes → securing completion → aboard check → manifest lock → results transition. The cinematic starts after the lock and offers no additional banking window.

P0 lists gross/net credits, RP, secured cargo, destroyed/lost samples, discoveries, and restart/return. P0 has no rescue fee because it has no full retrieval system. P1 uses `min(10 × retrieved players, floor(0.15 × gross))`. Do not show purchase or upgrade controls that perform no real behavior.

## 4. P1 cooperative vertical slice

Run a ten-minute Practice Moon mission with an 80-volume bay and 2–4 real participants, while retaining solo mode. The six research nodes are R01, R02, R04, R05, R06, R10; do not renumber when adding the P2 nodes. Initial tool loans allow every new crew to try tether and wrench.

Implement one cart: 120 kg recommended load, four slots, battery-driven assist with manual towing fallback. Implement at most two handles per co-carried object and two tether links per player, max tether length 12 m. Force limits and visible tension precede release. A player can detach an unwanted tether immediately and has a short reattachment cooldown.

Integrity zero downs a scientist. A three-second teammate repair restores 30 integrity and three seconds of hazard grace. After 30 s downed, retrieval makes them an observer until results; early retrieval requires a deliberate hold. All players downed causes a five-second announcement then extraction. Solo gets one free emergency recall before later downing ends the sortie. Observer drones cannot manipulate cargo or scout unvisited areas.

Hub stations support navigation vote, ready checks, two-slot loadouts, host purchases, and research. Every player may use this ship's unlocked designs. Session rewards are copied to guest personal profiles through unique entitlements; host purchases do not spend guest credits. Label this distinction in UI. No account economy or host migration is promised in P1.

## 5. Simulation and data contracts

The following are design schemas to implement and validate, not executable source files.

```text
ResourceDefinition
  id, contentVersion, massKg, volumeUnits, baseCredits, baseRP
  handlingTags[], canSplit, fragileImpactSpeed, conditionLoss

CargoEntity
  entityId, resourceId, runId, state, condition01
  pose, velocity, handleAssignments[], securingTicks

MissionState
  runId, seed, contentVersion, phase, authorityTick, deadlineTick
  participants[], bayCapacity, manifest[], modifiers

ManifestEntry
  entryId, entityId, resourceId, conditionAtBank, volumeUnits
  credits, researchPoints, securedTick

ResearchNode
  id, prerequisiteIds[], requiredDiscoveryIds[], priceRP
  unlockIds[], scopeTier

Profile
  schemaVersion, contentVersion, profileId, revision
  credits, researchPoints, unlockIds[], discoveryIds[]
  claimedRewardIds[], cosmetics[], timestamps
```

Use integer credit/RP values, bounded condition, and stable IDs. Never compute inventory from render-scene children. `entityId` uniquely identifies a cargo piece in one run. `rewardId` uniquely identifies a completed run entitlement for one profile. Tool contact, seed streams, and gameplay state cannot depend on render frame timing.

Important invariants:

1. A cargo piece is in at most one of loose/held/secured/lost states at a time.
2. One depleted deposit creates its configured yield once.
3. Secured volume never exceeds capacity; value cannot increase by splitting.
4. One reward entitlement changes a profile at most once.
5. Deadline and phase changes originate from the authority.
6. A disconnected/downed/despawned player holds no active input or stale grab constraint.
7. Research spending cannot make RP negative or create an unlock without prerequisites.
8. A failed save/import does not destroy the last-known-good profile.

## 6. Architecture and repository contract

Proposed implementation is TypeScript + Three.js + Rapier + Vite. Verify current compatible versions during P0A and commit the lockfile. Server is proposed Node/TypeScript with WebSockets. Libraries are not installed in M0, and no package scripts are advertised as runnable yet.

```text
MoonGoons/
  GAME_DESIGN_BIBLE.md       primary design reference
  GDD.md                    implementation requirements
  README.md                 status and entry points
  CHANGELOG.md              delivered milestones only
  prototype/
    README.md               prototype scope and future setup
    src/
      core/ simulation/ gameplay/ content/
      presentation/ ui/ platform/
    public/assets/          future runtime exports
  server/                   future authoritative service
  shared/                   future schemas and protocol definitions
  tests/                    future rule/network/save fixtures
  art/source/ art/exports/  art sources and reviewed exports
  audio/source/ audio/exports/
  concept/                  concept provenance and explorations
  docs/
    architecture/           decision records
    production/             backlog and test plan
    reference/              source/license register
```

All empty source folders are intentional placeholders tracked with `.gitkeep`. Source code must depend inward: presentation/platform adapters call core/gameplay interfaces; core cannot import DOM or renderer APIs. A local authority adapter lets P0 use the same command boundaries as P1 without constructing a network service immediately.

A future build produces a static distribution with relative assets. GitHub Pages can host that client; a separately hosted service is required for online sessions. P0 does not require persistent servers. Do not use a service key in browser code. Packaging for Steam is a later adapter/integration project. Unity would be a C# rewrite and retuning effort with reusable data and tests, not an automatic conversion.

## 7. Network and persistence acceptance

Start with 60 Hz server simulation, 20 Hz snapshots, and 30 Hz input delivery. Profile actual per-room cost. Commands include player/session ID, sequence, tick, action, and target where needed. Authority validates range, cooldown, state, rate, and message size. Snapshots include entity state, relationship changes, and tick; discrete events carry deduplication IDs.

Only local locomotion is predicted initially. Shared cargo stays server-owned and interpolated; predicted hand visuals must not create a second physical authority. Test 150 ms RTT before elaborating the art. If that feels bad, simplify cargo constraints and camera behavior before introducing rollback complexity.

Late join is observation until next launch; a reconnecting participant has a 60 s reclaim window and receives a current snapshot. Host departure does not crash a dedicated session; hub host absence times out after 60 s. Server failure preserves the last committed campaign and any durably recorded completed result, not a half-reconstructed mission.

Use IndexedDB profile transactions and a last-known-good backup. Export/import JSON with a 1 MB initial limit and explicit replacement preview. No active-mission save resume in P0/P1. Simulate failure between entitlement delivery and profile write: replaying the result must either complete the unclaimed reward or leave the already committed reward unchanged. Newer schemas must not trigger silent reset.

## 8. UI, asset, and accessibility inventory

P0 screens: start/settings, compatibility notice, untimed tutorial, start sortie, HUD, pause, result, save export/import/recovery. Core widgets: clock, ship beacon, tool heat, target prompt, bay volume/progress, resource condition, confirmation, caption. P1 adds room code, participant readiness, reconnect, loadouts, research, teammate state, observer, and session-ended screens.

P0 runtime art: one scientist rig, one ship/ramp kit, twelve moon pieces, three cargo types, drill/scanner, small dust/heat effects, warning and interaction icons. Keep collision meshes simple and material identity readable. Default player colors also have numbers/patterns. Initial art budgets and the source/export process are in bible sections 16 and 23.

P0 audio: footstep/landing, jump/burst, tool start/loop/stop/lock, scan, grab/release, three material impacts, secure confirmation, countdown warnings, and quiet hub/field loops. Every required warning has visual text. Asset provenance must be recorded before committed runtime use.

Acceptance includes fully remappable gameplay keys, hold/toggle alternatives, 100–150% text scaling, sensitivity/invert, camera motion reduction, captions, independent audio sliders, and keyboard focus. Before P1 public alpha, test controller navigation and disconnect recovery. Do not claim accessibility coverage without exercising the actual UI at its smallest supported viewport.

## 9. Test plan and evidence

| Test | Procedure | Expected outcome |
|---|---|---|
| Complete P0 sortie | Tutorial → scan → extract all categories → bank → depart → results → restart | Full loop works without debug intervention |
| Frame independence | Repeat fixed input fixture at 30/60/120 render fps | Fixed-step state is equivalent within documented tolerances |
| Heat boundary | Hold drill to 100, keep held, cool through 40, release/repress | Locks once; no uncommanded restart |
| Bay boundary | Test partial overlap, fast cargo, full bay, final-tick completion | Only valid unique items secure |
| Payout fixture | Bank 2 ore + glass q=.8 + core; P1 retrieve 1 scientist | Gross 252, RP 13, volume 19; P1 net 242 |
| Save failure | Interrupt write; load corrupt/newer data; repeat reward | Recovery offered; no double award or silent reset |
| Joint cleanup | Release/drop/down/disconnect while carrying | No stale joint or ghost ownership |
| Shared grab | Two clients select same handle then separate handles | One grant for contested handle; valid co-carry otherwise |
| Network interruption | 150 ms RTT, induced disconnect/reconnect, server stop | Stable state/recovery; no duplicate cargo/rewards |
| Newcomer observation | Five independent novices, no coaching | Record first-bank timing and perceived unfairness |
| Co-op feel | Five groups play two missions if they choose | Record voluntary assists and replay requests |
| Public smoke | Open deployed URL on clean profile; finish mission | No missing assets; save survives reload |

Use focused automated tests for state/data invariants and manual sessions for feel. Log build/version, seed, device, browser, RTT, assist settings, and observed result. A test checklist is not test evidence. The [test plan](docs/production/TEST_PLAN.md) starts with all implementation checks pending.

## 10. Milestone deliverables and change control

M0 delivers this specification, bible, repo scaffolding, provenance, backlog, and an initial documentation commit. P0A proves movement/hauling. P0B completes extraction/timing/rewards. P0C adds newcomer testing, saves, polish, and verified public solo deployment. P1A proves network physics before P1B adds cooperation and progression. P2 adds two destinations only after the co-op gate. Steam and Unity remain distinct future gates.

Each feature issue cites a requirement ID and a bible section. Tuning changes update the bible's single baseline first, then this GDD and data. Record reasons in an architecture/design decision entry when changing scope, ownership, or platform assumptions. Future code may refine mechanics through evidence, but must not quietly contradict the primary reference.

Immediate next task: gather human feedback on the playable P0 loop, improve movement/cargo feel, and measure supported hardware before the P1 network spike. No additional design approval is assumed necessary for ordinary implementation choices within an explicitly authorized future prototype task.

## 0.3 presentation implementation

Derived from the bible's 0.3 implementation record: textured surfaces, expanded color palette, directional shadows, ambient occlusion, bloom, environment reflections, optional screen-space reflections, and performance mode are implemented. Physics and reward requirements are unchanged. Screen-space reflections are an optional approximation, not hardware ray tracing. See [verification](docs/production/BUILD_0.3.md).


## 0.4 character and handling

Retain the user-approved 0.3 world art style in all future levels, as recorded in the bible. Implemented character rig adds separate elbow/knee joints, layered suit equipment, a visible visor, hand-mounted drill and thruster feedback. Bracing applies horizontal air braking without hover; on the ground it lowers/stabilizes cargo. Braced release reduces residual horizontal velocity and spin. Scanner radius is now 24 m. Existing movement speeds, jump height, burst charges, cargo payouts and save schema remain unchanged. Acceptance evidence: [build 0.4](docs/production/BUILD_0.4.md).


## 0.5 implemented expedition slice

The bible's 0.5 record supersedes the Practice Moon-only first-map scope and reserved R binding for this browser build. Cinder Basin adds a shared collision/render platform layout, two elevated survey landings, route lights, a north excavation and a per-sortie 150 CR contract. Hold R to fly; land/release to recharge. Mass-dependent lift, limited fuel, the existing reserve burst and bracing support return-route decisions. Contract completion requires both surveys, secured value and extraction aboard; partial salvage remains payable. No additional contract reward or persistent completion flag is promised. [Validation](docs/production/BUILD_0.5.md).
