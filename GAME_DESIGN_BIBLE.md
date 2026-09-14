# Moon Goons — Game Design Bible

Version 1.1 • 14 September 2026 • Status: primary design baseline; first solo prototype implemented

This is the primary design reference for **Moon Goons**, a browser-first HTML cooperative physics extraction game. It defines the experience, rules, scope, and validation gates. [GDD.md](GDD.md) translates this bible into production requirements. If they disagree, change this bible through a recorded decision before updating the GDD. All numerical values below are initial tuning hypotheses, not playtested results or release promises.

## Contents

1. [Vision and identity](#1-vision-and-identity)
2. [Pillars and player fantasy](#2-pillars-and-player-fantasy)
3. [Audience, platform, and scope](#3-audience-platform-and-scope)
4. [Gameplay loop and session example](#4-gameplay-loop-and-session-example)
5. [Controls and camera](#5-controls-and-camera)
6. [Movement and low-gravity physics](#6-movement-and-low-gravity-physics)
7. [Interaction and cargo](#7-interaction-and-cargo)
8. [Tools and loadouts](#8-tools-and-loadouts)
9. [Failures, rescue, and recovery](#9-failures-rescue-and-recovery)
10. [Resources and economy](#10-resources-and-economy)
11. [Mission structure and generation](#11-mission-structure-and-generation)
12. [Destinations and biomes](#12-destinations-and-biomes)
13. [Progression and research](#13-progression-and-research)
14. [Ship hub and social systems](#14-ship-hub-and-social-systems)
15. [UI, onboarding, and accessibility](#15-ui-onboarding-and-accessibility)
16. [Art and animation](#16-art-and-animation)
17. [Audio and writing](#17-audio-and-writing)
18. [Multiplayer architecture](#18-multiplayer-architecture)
19. [Technical architecture](#19-technical-architecture)
20. [Save system and data ownership](#20-save-system-and-data-ownership)
21. [Balancing and playtesting](#21-balancing-and-playtesting)
22. [Roadmap and milestones](#22-roadmap-and-milestones)
23. [Production pipeline](#23-production-pipeline)
24. [Risks and decision gates](#24-risks-and-decision-gates)
25. [Future content](#25-future-content)
26. [Decisions, glossary, and references](#26-decisions-glossary-and-references)

## 1. Vision and identity

**Pitch:** You and up to three friends are underqualified field scientists sent to collect extraordinary samples with deeply ordinary equipment. Pick a destination, bounce across alien terrain, dig up something valuable, and get it into the ship before the launch window closes. The job is simple. Moving the rock is the problem.

The emotional arc is curiosity → confident improvisation → escalating mishap → collective recovery → frantic extraction → affectionate retelling. Laughter should come from understandable physical consequences: a heavy core swinging on a tether, a drill pushing its operator off a ledge, a friend braking the cart with their body. Random punishment cannot carry the experience.

The fictional employer is **S.P.A.C.E. — Scientific Procurement and Collection Enterprise**. Its patched research vessel, the **R.S.V. Almost Certain**, is a warm home between dangerous field trips. Corporate satire targets institutional incompetence, never a player's identity or ability. Scientists survive through suit retrieval; there is no gore or permanent character death.

The original concept supplies the low-gravity harvesting loop, unreliable equipment, weighted cargo, destination selection, science progression, and playful tone. This bible expands that premise with proposed rules and boundaries. It does not claim to restore lost source code, assets, or a previously completed game.

**Experience promise:** Within two minutes a newcomer can jump, grab, drill, and understand where cargo goes. Within one mission the group has a story worth retelling. Within three missions they have a reason to change their loadout.

## 2. Pillars and player fantasy

| Pillar | Design obligation | Reject when |
|---|---|---|
| Simple hands, complicated situations | One clear action per tool; complexity comes from terrain, cargo, and teammates | Success depends on memorizing long input sequences |
| Physical comedy with agency | Predictable momentum, visible forces, recovery tools | Players spend long periods helpless or cannot identify a cause |
| Science worth hauling | Cargo differs in mass, handling, fragility, and research use | Resources become interchangeable inventory icons |
| Trouble creates cooperation | Failures leave an actionable workaround | Maintenance merely stops activity until a timer finishes |
| Escalation with a fair exit | Deadline and return route are readable | A hidden hazard invalidates a completed extraction |
| Friends can contribute immediately | Flexible tool roles, shared rewards, baseline free equipment | Veterans' upgrades make newcomers useless |

The player fantasy is being the crew that should not succeed but somehow does: field scientist, salvage engineer, rescuer, and enthusiastic bad-idea generator. Players are competent enough to recover, not trained soldiers. Combat, survival crafting chores, punishment quotas, and competitive ranking are outside the core fantasy.

Use this feature test: what physical decision does this create, how can a friend help, how is danger communicated, and how can the crew recover? A feature without convincing answers stays out of the production scope.

## 3. Audience, platform, and scope

Primary audience: friend groups seeking accessible, funny cooperative sessions; secondary audience: solo experimenters and creators who enjoy emergent stories. Design for mixed skill levels and voice-free play. Target teen-friendly slapstick; a formal content rating is a later release task.

| Dimension | Baseline decision |
|---|---|
| Players | 1–4 online; solo supported; no split screen initially |
| View | Third-person low-poly 3D, orbit camera with stable horizon |
| First platform | Desktop browser, keyboard/mouse; controller support by public co-op alpha |
| Session | Full missions 8–12 minutes plus 2–4 minutes preparation/results; prototype field phase 5 minutes |
| Business direction | Browser validation first; possible premium Steam release; no paid power or consumable purchases |
| Browser delivery | Static HTML/CSS/JavaScript client; online mode requires a separate session server |
| Native future | Evaluate a desktop web build first; Unity is a gated later port, not simultaneous development |
| Initial exclusions | Mobile touch, VR, MMO persistence, public matchmaking, voice hosting, seamless planets, voxel destruction |

**P0 first playable:** one player, one handcrafted Practice Moon, movement, assisted grab, drill, scanner, three resources, overheating, cargo banking, five-minute deadline, results, restart, settings, and one local save/export path. Clearly label it a solo prototype. Placeholder friends do not count as multiplayer.

**P1 co-op vertical slice:** 2–4 real clients, authoritative shared physics, tether and rescue, one cart, reconnect behavior, small physical ship hub, six research nodes, and a complete ten-minute Practice Moon mission.

**P2 browser release candidate:** three destinations (Practice Moon, Rust Belt, Icebox Comet), approximately eight resource families, seven tools including starter repair capability, twelve research nodes, accessibility options, profiling, persistence migrations, and tested online operations. These are scope ceilings pending gates, not content obligations regardless of cost.

Soup Moon, The Crusher, Shatterstone, the station, advanced research, and experimental devices are future candidates. More than four players requires a new physics, usability, and server-cost evaluation.

## 4. Gameplay loop and session example

The campaign loop is choose destination → select tools → launch → scan → extract → transport → secure cargo → escape → sell/study → unlock options → choose a new risk. The moment loop is observe an object → plan an approach → apply a simple action → read a physical consequence → cooperate or recover.

Mission states are `HUB → BRIEFING → LOADING → ACTIVE → FINAL_WARNING → DEPARTING → RESULTS → HUB`. The authority controls transitions. Loading readiness is separate from player readiness; the field clock starts only after all admitted players have loaded or timed out back to the lobby. Pause freezes an offline mission; online menus never freeze the crew.

Example ten-minute sortie: two scientists spot glass near the ramp while two scout a dense core in a crater. The drill operator braces against rock to avoid recoil. A teammate steadies the core as it breaks free. They load a cart, discover that its weight makes the downhill turn dangerous, and attach a tether. At two minutes remaining a forecast dust front arrives. They abandon an optional fossil, bank the core, then return together for a tumbling teammate. The summary records their salvage and airborne distance; research unlocks an insulated carry cradle for the next destination.

This example combines planned P1 systems, not a claim that they exist. The P0 version compresses the same arc to one player, nearby deposits, and a short clock without rescue dependencies.

## 5. Controls and camera

| Action | Keyboard/mouse default | Controller target | Behavior |
|---|---|---|---|
| Move | WASD | Left stick | Camera-relative horizontal input |
| Look | Mouse | Right stick | Adjustable sensitivity and invert Y |
| Jump | Space | South face | Buffered press; no hold-height requirement |
| Sprint | Left Shift | Left stick click | Hold/toggle option; unavailable above carry limit |
| Grab/release | E | West face | Contextual nearest valid handle |
| Tool use | Left mouse | Right trigger | Hold/toggle accessibility option |
| Brace / aim tool | Right mouse | Left trigger | Brace while carrying; aim otherwise |
| Emergency burst | Q | Right shoulder | Short movement-directed suit impulse |
| Tool slots | 1 / 2 or wheel | D-pad left/right | Two belt tools; cargo occupies hands |
| Ping | Middle mouse | Left shoulder | Tap marker, hold contextual wheel |
| Tether release | R while tether equipped | North face while tether equipped | Explicit highlighted link, hold to confirm |
| Settings / pause | Escape | Menu | Release pointer lock; pause only offline |

Context priority is rescue > highlighted grab handle > tool station > general interaction. Show the chosen target and action before committing. Repair uses the repair tool's primary action; it does not compete with grab. Deposits cannot be drilled through cargo held in the same player's hands. No compulsory throwing button: release inherits current velocity; risky throwing can be a later hold-and-release interaction after grief testing.

Camera baseline: 4.5 m follow distance, shoulder offset switch, 70° vertical field of view with a 55–90° slider, occlusion raycast shortening, and separate aim sensitivity. Helmet and cart geometry fade locally when obstructing the target. Collision never rotates the camera into a full ragdoll. Default shake is subtle and can be disabled. Suit silhouette, shadow, and a landing marker communicate height without forced camera roll.

Keyboard focus, pointer-lock loss, gamepad disconnect, and browser blur clear held input so tools cannot remain firing. Offline blur pauses; online blur opens a notice while the server continues. Menus support full keyboard and controller navigation.

## 6. Movement and low-gravity physics

Use meters, kilograms, seconds, and a fixed 60 Hz simulation. Planet gravity changes acceleration, not mass: a core remains difficult to start and stop on an asteroid even when it weighs little. Simulate bounded local maps with a constant gravity vector first. Curved planetary gravity and rotating reference frames are future engineering projects.

| Parameter | Initial setting | Intent |
|---|---|---|
| Scientist physics mass | 80 kg | Reference for cargo and recoil tuning |
| Walk / sprint | 4 / 6 m/s | Readable movement over compact maps |
| Ground acceleration | 16 m/s² | Responsive start with perceptible stopping |
| Air acceleration | 2.5 m/s², horizontal cap 4 m/s | Correct errors without flying freely |
| Practice Moon gravity | 3 m/s² downward | Stylized low gravity, not lunar realism |
| Practice Moon jump impulse | 4.2 m/s upward | About 2.94 m height and 2.8 s airtime on level ground |
| Jump grace / buffer | 120 / 150 ms | Forgiving edges and landing timing |
| Slope traversal | Walk up to 45° | Steeper slopes slide predictably |
| Suit burst | 2 m/s impulse, 2 charges | Recovery tool; 8 s per charge while grounded |
| Stumble / recover | 0.4–1.2 s; maximum 2 s | Brief comedy without prolonged loss of control |
| Interaction reach | 2.2 m with line of sight | Easy targeting without remote grabbing |

For each destination derive jump speed from a desired height `v = sqrt(2 × gravity × height)` and tune the height, rather than applying the same impulse everywhere. Rust Belt starts near 2 m; Crusher near 1 m. Artificial caps and damping are allowed when documented and consistent. Explain these as suit stabilization, not a realistic orbital simulation.

The player controller uses a collision capsule with limited force-driven interactions. Visual secondary motion supplies wobble; full articulated ragdoll is restricted to downed characters in P1. A brace reduces horizontal movement and applies stronger contact friction but cannot anchor a player in empty space. Bursts have a speed cap; repeatedly boosting into a wall cannot accumulate infinite energy.

Collisions use impulse or relative impact speed, never speed alone. Begin with no player injury below 5 m/s impact speed, a stumble from 5–8, and suit-integrity damage above 8; tune with mass and contact direction. Grace periods after rescue prevent chain knockdowns. Cargo-to-player impacts are capped and cannot instantly down a healthy teammate.

Fast small cargo uses continuous collision detection where profiling permits. Clamp extreme linear/angular velocities, wake sleeping bodies only when needed, and use simple colliders. A released grab joint must clear on disconnect, despawn, downing, and extraction. Recovery from NaN transforms or out-of-bounds bodies logs the cause and moves the object to its last safe position once; deliberate launches beyond the recovery boundary become a clearly marked lost-cargo event. Players outside bounds enter suit retrieval rather than remaining stranded.

## 7. Interaction and cargo

Cargo is a physical world entity until secured. Resources do not teleport into a backpack. Every piece has a stable ID, resource type, mass, volume units, condition, temperature/stability state, scan status, and cargo state: `DEPOSIT → LOOSE → HELD/LOOSE → SECURED` or `LOST`. Extraction creates an item exactly once; depleted deposits never respawn on a network retry.

Grabbing creates a damped spring constraint between a labeled handle and a target in front of the scientist. It does not make cargo kinematic or remove collisions with terrain. Render an elastic reach indicator; break the grab after sustained overextension, with a warning before release. Small body-to-carried-item collisions can be filtered to suppress jitter; carried items still hit the environment and other cargo.

P0 effective haul mass is the item's mass. Initial speed multiplier is `clamp(1 / (1 + mass / 40), 0.35, 1)`. A 20 kg item reduces walk speed to about 2.67 m/s. Above 35 kg, sprint is disabled. Above 60 kg, one scientist can drag but cannot lift. Co-carry in P1 distributes supported mass across attached handles; it improves control, not absolute world mass. Maximum two carriers per standard object. Conflicting pulls remain visible and force-limited.

All mandatory P0 cargo is liftable alone. Solo full missions provide cart-accessible paths and cuttable large cores; co-op-only optional bonuses cannot block progression. Tools and handles are interchangeable between players; avoid class locks.

Ship cargo storage starts at 40 volume units in P0 and 80 in P1. To bank, an item must be fully within the marked bay, below 1 m/s, and continuously detected for 1 second. The UI shows capacity and a securing progress ring. The authority then removes physical simulation and records an immutable manifest entry. A secured item cannot be grabbed or ejected. This deliberate abstraction prevents cargo-door exploits and physics piles dominating performance.

If capacity is insufficient, show required/free volume; never silently consume cargo. A resource may be split only if its definition permits it; fragments share a conserved total base value. Door movement has a safety interlock, so closing it cannot fling or duplicate cargo. Loose items touching the ramp at departure do not count. In P0, do not add a second mass capacity; mass affects hauling, volume affects the ship.

P1 cart: 120 kg recommended load and four attachment slots. A bar shows overload; braking weakens progressively above rated load, with a hard slot capacity. Manual towing always works when its battery is depleted. Cart movement uses the same authority and bounded constraints as hand carry.

## 8. Tools and loadouts

Each scientist has two tool slots, a built-in low-range scanner in P0, and a baseline suit repair interaction in P1. All crews can access free starter equipment at the hub. Mission crates allow tool swapping so a lost tool never makes the only required objective impossible. No ammunition purchase is required for the starter drill.

| Tool | Primary action and starting tuning | Failure and recovery | Scope |
|---|---|---|---|
| Survey scanner | Hold a 1 s pulse; 12 m range, 3 s cooldown; identify category and nearest deposit | Damaged sensor shows a labeled uncertainty cone; recalibrate at a station | P0 reliable; failures P2 |
| Utility drill | Contact extraction, 6 s for starter ore; heat +22/s active, −15/s idle | Warn at 75 heat; lock at 100; restart at 40; optional P2 jam repair | P0 |
| Tether gun | Connect two valid anchors, max 12 m, two live links per player | Visible tension; detach safely; overstress releases without explosive impulse | P1 |
| Utility wrench | Hold 3 s at a marked fault; teammate can stabilize it | Movement interrupts with progress retained for 2 s; baseline fixes cost no currency | P1 |
| Gravity cart | Tow, brake, load attached cargo | Depleted drive means manual tow; overload worsens braking | P1 |
| Sample extractor | Hold 4 s on a marked seam, reduced fragile-sample damage | Clog displays a clear release-and-clear action | P2 |
| Cold cradle | Carry biological sample while preserving temperature | Battery gauge; insulated passive grace period; recharge at ship | P2 |
| Mining laser | Fast directional extraction after a visible wind-up | Heat and marked reflection hazard; low capped friendly impulse | Future |

Drill contact must remain within reach and line of sight; wall penetration and button-spamming cannot accelerate it. P0 heat cooling pauses during active drilling. At 100 heat the tool locks immediately, cools while locked, and resumes only after explicit new use input. This yields a four-second worst-case cooldown. A novice can complete a common node with a brief pause; overheat is not catastrophic.

Tool upgrades are sidegrades. A turbo drill could mine 50% faster but heat 70% faster. A stabilizer cuts recoil but occupies the modification slot that could increase output. Allow one mod per tool initially. Tool previews show both benefit and drawback in ordinary words and a training-bay comparison.

The original exploding-drill and reflecting-laser ideas are preserved as optional advanced content. They are inappropriate for the first tutorial. Every damaging effect needs readable warning, bounded magnitude, and a repair or escape route.

## 9. Failures, rescue, and recovery

Equipment state follows `NORMAL → WARNING → DEGRADED → DISABLED → REPAIRING → NORMAL`. Some tools skip degraded operation when a safety lock is clearer. Failures derive from heat, impacts, overload, or a forecast environmental modifier. Do not roll invisible catastrophic failures on essential tools. Seeded incidental faults can be introduced only after players understand the causal model, with no overlapping hard disables during the tutorial.

| Problem | Immediate feedback | Available response |
|---|---|---|
| Hot drill | Gauge, steam, rising whine, text warning | Release and cool; switch task |
| Cart drive dead | Battery icon and changed motor sound | Tow manually or return to charger |
| Cracked containment | Visible crack, stability countdown | Carry upright or use a cradle |
| Suit leak | Directional jet and integrity warning | Brace; another scientist repairs the marked valve |
| Tether overstress | Striped line and rising tension tone | Stop pulling, move anchor, explicitly detach |

Full-game suit integrity starts at 100. Hazards and severe impacts reduce it; zero triggers `DOWNED`. A teammate can stabilize the suit with a three-second interaction, restoring 30 integrity and three seconds of hazard grace. Two repairs in rapid succession remain possible; revive invulnerability cannot be extended by repeating the action on an active player.

A downed scientist can ping and request retrieval. After 30 seconds, or an explicit three-second hold after five seconds downed, ship retrieval returns them as a non-colliding observer drone until results. The drone can ping but cannot move cargo, scout unknown rooms beyond the crew's visited area, or invalidate oxygen hazards. If every active scientist is downed, auto-extract after a five-second announcement; the group never waits out an empty clock. In solo P1, one free emergency recall per mission restores the scientist at the ship and drops carried cargo at the incident site. Later downing extracts immediately.

P0 uses automatic safe-position recovery and a short visual stumble, not the full rescue system. Full missions use one primary launch deadline; personal oxygen is a future hazard modifier, not a second universal countdown. P0 does not need battery, oxygen, integrity, and temperature gauges all at once.

At departure, scientists inside the cabin count as aboard. Others are retrieved after the mission and lose only their unbanked cargo. Rescue charges are capped at 15% of earned mission credits and cannot create debt. Starter tools return free. A bad mission never erases research unlocks or prevents another launch.

## 10. Resources and economy

Credits buy optional preparation and cosmetics; research points (RP) unlock knowledge; discoveries record first successful specimen returns. No separate reputation currency is needed: destination access follows research nodes and discoveries. Avoid multiplying currencies without a distinct decision.

| Stable resource ID | Mass kg | Volume | Base credits | Base RP | Handling / purpose | Scope |
|---|---:|---:|---:|---:|---|---|
| `lunar_ore` | 20 | 4 | 40 | 2 | Stable common ore; teaches hauling | P0 |
| `lunar_glass` | 6 | 3 | 65 | 4 | Fragile cluster; teaches careful landings | P0 |
| `dense_core` | 45 | 8 | 120 | 6 | Heavy but stable; teaches momentum | P0 |
| `shiny_rock` | 12 | 3 | 5 | 0 | Scanner identifies it honestly; optional joke | P1 |
| `magnetite_spindle` | 30 | 5 | 100 | 5 | Magnetic drift during forecast storms | P2 |
| `cryogenic_organism` | 10 | 5 | 110 | 10 | Warmth reduces scientific condition | P2 |
| `gas_sac` | 8 | 6 | 130 | 8 | Instability warning before venting | P2 |
| `alien_fossil` | 18 | 5 | 90 | 12 | Needs sample extractor for best yield | P2 |
| `unknown_cube` | 25 | 6 | 160 | 15 | One discoverable, bounded anomaly | Future |

Condition `q` ranges from 0–1; a destroyed sample has no manifest entry. For each secured item: credits = `floor(baseCredits × q)` and RP = `floor(baseRP × q)`. The campaign records a discovery when a specimen is banked at `q ≥ 0.5`, once per resource ID. Only surviving material is paid. Stable ore/core start with no condition damage in P0; glass loses 0.1 condition for each qualifying impact above 3 m/s, with a 0.5 s same-contact debounce. Zero condition destroys it with readable feedback. Tune these thresholds from actual route tests.

Mission gross credits = sum of secured-item credits + explicitly displayed contract bonus. Rescue fee = `min(10 × retrievedPlayers, floor(0.15 × grossCredits))`. Net = `max(0, grossCredits − rescueFee)`. Basic repairs are free at results; optional next-mission consumables are purchased separately and cannot silently reduce the payout.

Example: two intact ores, one glass at 0.8 condition, and one intact core earn 252 gross credits and 13 RP. One retrieved player costs 10 credits, leaving 242. Volume consumed is 19. Display these line items so players can verify the outcome. Crew members receive the same mission reward entitlement; it is not divided by party size or determined by who banked an object.

Research on failed runs is narrowly defined: retain discovered map entries, and award at most 2 survey RP for completing one previously uncompleted survey objective at that destination. Repeat scanning or restarting does not farm RP. Unbanked specimen research is lost. There is no recurring rescue subsidy.

P0 saves a personal campaign. P1's host campaign owns credits, ship modules, and research purchases; each guest also receives an idempotent copy of earned mission credits/RP in their personal profile for later solo/host play. Purchases made aboard another person's ship do not debit a guest profile. No trading, scarce ownership competition, or trusted public economy is promised.

## 11. Mission structure and generation

Every mission contains a safe landing pocket, near low-value deposits, one mid-distance hauling challenge, an optional high-risk pocket, two recognizable return routes where feasible, and a visible ship beacon. The first map is handcrafted. Modular seeded layout assembly follows only after measured fun on fixed geometry; no generated terrain may be required to prove basic movement.

P0 map target: approximately 120 × 120 m, with the ship near the center, three nodes within 20 m, medium nodes 25–45 m out, and the densest core on a sloped route 45–55 m away. Boundaries are visible cliffs with recovery rules, not invisible walls without explanation. Ten cargo pieces total (five ore, three glass, two cores) give 48 volume units, intentionally exceeding the 40-unit bay. Include a safe route for every resource category.

| Phase | P0 timing | P1 standard timing | Required communication |
|---|---|---|---|
| Active | 300 to 60 s remaining | 600 to 120 s remaining | Clock, ship direction, current secured value |
| Final warning | Last 60 s | Last 120 s | Banner, captioned alarm, forecast hazard begins |
| Critical cue | 30 s and 10 s | 30 s and 10 s | Stronger cue without continuous flashing |
| Departing | At zero; 3 s cinematic afterward | Same | Manifest locks at zero; animation adds no hidden grace |
| Results | After transition | After transition | Cargo, fees, research, readiness to return |

Event ordering on the zero tick: process valid commands and securing timers for that tick, secure qualifying items, determine cabin occupancy, lock manifest, then transition. Tests cover this boundary. The displayed countdown rounds upward so visible zero coincides with the actual lock. Optional early departure requires every connected active player to approve; the host may not silently abandon an unready player. Downed players receive the prompt; disconnected seats do not block it.

Contracts add a concrete secondary objective such as two intact glass samples or one photograph plus an ore return. They show reward and requirements before launch. Missing a contract does not confiscate ordinary cargo. No mandatory quota wipes campaign progress. P0 has a simple suggested cargo target, not a contract system.

Player-count scaling changes deposit quantity, optional objective count, and tutorial guidance; it does not secretly change physical mass mid-mission. At launch, use 1.0/1.5/2.0/2.4 times the solo optional deposit budget for 1/2/3/4 players, and keep the closest starter deposits intact. Later departure or joining does not reroll deposits. Deadline remains fixed to preserve predictable mission pacing.

Generated maps must pass reachability, spawn clearance, slope, cart-route, anchor, return-time, and required-resource checks. A validation failure selects a tested fallback seed. Assemble authored terrain chunks and baked hazard sockets; fully destructible terrain is out of scope. Hazard warnings have minimum lead times (three seconds for a local geyser, thirty seconds for a route-changing event), with caption, world cue, and sound. No required escape path may vanish without a reachable alternative.

## 12. Destinations and biomes

| Destination | Gravity m/s² | Identity and route problem | Signature yield | Access / scope |
|---|---:|---|---|---|
| Practice Moon | 3.0 | Cream regolith, shallow craters, basalt shelves; learn long jumps and slope braking | Ore, glass, dense core | Free; P0/P1 |
| Rust Belt | 1.2 | Oxidized asteroid, scrap gullies, anchor fields; stop cargo drifting | Magnetite, cores | R03; P2 |
| Icebox Comet | 2.0 | Blue ice shelf, sheltered fissures, geyser basin; brake and preserve cold samples | Organisms, glass, fossils | R08; P2 |
| Soup Moon | 4.0 | Gel flats, sponge ridges, sticky pools; haul escaping biology | Gas sacs, organisms | Biology extension; future |
| The Crusher | 9.0 | Dense black rock, ochre storm trenches; route planning for heavy loads | Dense core variants | Engineering extension; future |
| Shatterstone | 1.5 | Authored fracture shelves, tether crossings; extract before marked bridge breaks | Rare glass, meteor hearts | Mobility extension; future |
| Unlicensed Research Station | 0–6 scripted | Modular corridors and isolated gravity rooms; timing and containment | Artifacts, prototypes | Questionable Science; future |

Practice Moon teaches one new rule per area: flat ore beside the ramp; fragile glass below a short ledge; a core beyond a shallow incline. Its dust warning affects sightlines lightly but never obscures the ship beacon. No lethal predators or mandatory repairs in the first mission.

Rust Belt uses magnetic pulses with a ten-second forecast; affected cargo carries a magnet icon and arrows before force begins. The first version has fixed terrain and constant downward gravity. Rotating terrain is a later variant. Safe anchor posts make drift recovery visible from the landing zone.

Icebox has ordinary snow routes around slippery shortcuts. Geyser vents hiss, deform, and show a ground warning before launching objects. A cryogenic sample has a 90-second warm exposure budget; the cold cradle pauses depletion. Temperature failure degrades RP/condition instead of instantly killing a teammate. Offer one safe biological specimen near the ship for onboarding.

Soup Moon's creatures are cargo thieves, not combat enemies: they telegraph interest, can be distracted by decoys, and release equipment when startled with a scanner pulse. Crusher's difficulty comes from grade and inertia, not slower controls everywhere. Shatterstone uses a few authored fracture events rather than arbitrary runtime destruction. The station changes gravity only in clearly bounded rooms with wall warnings and recovery anchors.

## 13. Progression and research

Progression expands choices and destinations. Starter equipment must remain viable; a veteran can use a new player's loadout without becoming ineffective. Research is purchased in the hub, is permanent, and never requires grinding a dangerous destination to unlock the basic safety tool needed there.

Each node has a stable ID, prerequisites, RP price, optional discovery, effect, and tradeoff. Unlocking gives access to a design; credits may pay for optional mission rental, never a mandatory baseline tool. First unlock includes one free trial. RP is spent once; prerequisites are not consumed.

| ID / branch | Research | Prerequisite | RP | Result / tradeoff | Scope |
|---|---|---|---:|---|---|
| R01 Mining | Braced drill mount | Start | 8 | Lower recoil; slower lateral tool movement | P1 |
| R02 Mobility | Tether certification | Start | 8 | Tether loadout option; occupies a tool slot | P1 |
| R03 Navigation | Rust Belt charts | R02 + bank dense core | 12 | Unlock Rust Belt; warns about magnetic storms | P2 |
| R04 Engineering | Field wrench | Start | 6 | Portable repair tool; requires stopping to repair | P1 |
| R05 Engineering | Cart coupling | R04 | 10 | Cart module; larger turning radius than hand carry | P1 |
| R06 Mining | Turbo drill | R01 | 14 | +50% extraction, +70% heat generation | P1 |
| R07 Biology | Gentle extraction | Bank lunar glass | 8 | Sample extractor option; slower on common ore | P2 |
| R08 Biology | Cold-chain charts | R07 | 12 | Cold cradle and Icebox access; cradle occupies slot | P2 |
| R09 Mobility | Stabilizer boots | R02 | 12 | Better braking; reduces jump height 20% while enabled | P2 |
| R10 Engineering | Cargo rack | R05 | 16 | Ship volume 80→96; selects one hub module socket | P1 |
| R11 Biology | Containment baffles | R08 + bank organism | 16 | Longer stability window; adds 2 volume to affected crate | P2 |
| R12 Questionable Science | Anomaly permit | R03 + R08 | 20 | Optional anomalous contracts; warnings and opt-in required | P2 |

R01, R02, R04, R05, R06, and R10 are the six-node P1 subset. Tether/wrench are loaned free during the co-op introduction; research unlocks their selectable variants, not the only way to rescue friends. P0 has no functioning research tree: results show earned RP and a clearly labeled preview. Do not build fake purchase buttons that imply implemented effects.

The target is a first node after one or two short successful runs and first new destination after roughly three to five full runs. This is a hypothesis; use actual RP intake to adjust prices. First discoveries can grant cosmetic patches without adding another spendable currency. After all nodes, optional contracts, seed sharing, self-imposed cargo challenges, and cosmetic goals support replay; infinite stat growth does not.

Future branches may introduce portable generators, experimental gravity fields, contained teleportation, and duplication experiments. Any duplicator must consume a defined input and mark synthetic cargo as non-reward-bearing; otherwise it breaks the economy and manifest invariants.

## 14. Ship hub and social systems

The ship is compact enough to cross in ten seconds. P0 represents it with a cabin, cargo bay, and a simple mission/results menu. P1 adds four readable stations: navigation table, loadout rack, research bench, and cargo manifest. Optional cosmetic bunks and a safe training corner make it feel lived in without requiring chore loops.

Navigation shows destination, gravity description, hazards, recommended equipment, session duration, and available discoveries. Everyone votes; host confirms a tied vote after the tie is shown. Launch requires ready status from connected players, with a host countdown that unready players can cancel. Joining players can inspect a free starter loadout immediately.

Host controls campaign purchases and can enable guest spending for the current lobby; default is off. Unlocks available on the host ship are usable by everyone for that session. A guest's earned discoveries persist personally without silently upgrading the host ship. Clear labels distinguish “this ship” and “your profile.”

Social tools: contextual pings for cargo, hazard, help, return, and agreement; four emotes; player number plus suit pattern; optional text chat later. P1 uses invite codes/private rooms. No integrated voice is required. Host kick/ban applies to the lobby; a kicked player's held cargo releases safely and already-earned entitlements remain governed by the mission reward rules. Non-consensual endless player towing is prevented by an immediate release input and a short reattach cooldown.

Results celebrate teamwork: secured value, discoveries, rescues, longest safe leap, most cargo assisted. Avoid an authoritative “worst player” award. Funny metrics are cosmetic, have no reward multiplier, and can be hidden. Do not replay embarrassing voice recordings or collect them.

## 15. UI, onboarding, and accessibility

The HUD shows only the current decision: mission clock at top center, ship direction/distance, tool state near the reticle, contextual target action, and cargo-bay capacity when relevant. P1 adds teammate status and a restrained integrity display. Heat appears when the drill is equipped; temperature appears when handling a sensitive sample. Use icons, words, and shapes alongside color.

Required screens: title/start, settings, compatibility warning, hub/briefing, loading with cancel, field HUD, pause/connection overlay, results, research, save import/export, and confirmation for destructive profile reset. Multiplayer adds create/join room, invite code, version mismatch, reconnect, and host/session-ended screens. Errors explain recovery, not raw stack traces.

First-run tutorial is a two-minute optional Practice Moon exercise: move to a painted mark, jump a ridge, scan highlighted ore, drill until heat warning, cool, carry to bay, and watch securing complete. It has no hard deadline until the user starts the sortie. Context hints repeat only after sustained difficulty and can be dismissed permanently. Subsequent tutorials introduce one system at a time through a loaned tool.

Accessibility requirements by P0: rebinding for every game action; sensitivity/invert controls; hold/toggle alternatives; text scaling 100–150%; independent music/effects volume; subtitles for mission warnings; color-independent symbols; camera shake/bob disable; stable horizon; pause offline; and clear keyboard focus. Gamepad, remappable UI navigation, reduced effects, and visual audio indicators must be validated by P1 public alpha.

P2 assists: 125%/150% deadline options, stronger grab assistance, reduced impact penalties, and simplified repair holds. The lobby declares shared rule modifiers before launch and stores them in the run record. No leaderboard penalizes assist use. Controls never require rapid tapping, simultaneous three-button chords, precision rhythm, or color-only pattern solving.

Readable font target is 18 px body at 1080p, with contrast checked on the actual background. Captions include speaker/source and key non-speech cues. Flash effects are avoidable; reduced-effects mode replaces them with steady warnings. Directional pings and text support play without hearing; the game is not promised fully playable without sight. Accessibility claims must follow direct testing rather than a feature checklist alone.

## 16. Art and animation

Style: chunky low-poly shapes, soft material response, broad color groups, and readable silhouettes. Suits have oversized helmets, broad gloves, bright fabric, and improvised attachments. The ship mixes warm amber task lights, cream panels, warning tape, and visibly repaired machinery. Terrain is quieter than tools/cargo so interactive objects stand out.

Palette intent: moon neutrals with cobalt shadows; orange/teal/purple/lime suit accents distinguished by patterns and numbers; resource-specific shapes; warning amber and striped danger red reinforced by icons. Avoid making every collectible glow equally. Scanned outlines are temporary aids, not the entire resource language.

Starting content budgets: one shared scientist rig with four palette/pattern variants; one ship exterior/cabin kit; twelve Practice Moon terrain/prop pieces; three resource meshes with damaged variants; drill and scanner; one dust effect set; five UI icon families. P1 adds tether, wrench, cart, and downed pose support. High-detail promotional art must not set a visual promise beyond the playable build.

Animation states: idle, walk, sprint, takeoff, float, land, brace, carry, drill, stumble, downed, rescue, and emote. Use a small locomotion blend tree and procedural torso lean/hand targets. Visual hands follow handle targets; they do not add independent authoritative physics constraints. Tools react to heat with fan speed, shaking, steam, and light intensity. Ragdoll-to-standing blends return the body to a safe capsule position while the camera stays stable.

Art exports use meters, Y-up, documented forward axis, applied transforms, named sockets, and separate collision meshes. Prefer glTF/GLB for browser assets. Source files live under art/source and runtime exports under prototype/public/assets. Initial targets: scientist under 8k triangles, tool under 3k, cargo under 1.5k, shared 1k–2k texture atlases. These are profiling starting points, not quality guarantees.

## 17. Audio and writing

Sound communicates force, material, and danger. Glass rings, cores thud, tethers strain, carts rattle, and drills climb in pitch before locking. Use capped voice counts, distance attenuation, and priority so a nearby rescue warning survives four drills. Audio events follow authoritative state changes; client prediction may play a quiet local start cue but must not duplicate confirmed impacts.

The soundtrack is sparse playful electronics at the hub, light ambient pulses in the field, and a more urgent rhythmic layer in the final warning. Urgency must not mask navigation cues. Master, music, effects, and dialogue have independent sliders; subtitles include radio announcements and critical effects.

The suit radio explains stylized sound in vacuum. Writing is concise and useful before funny: “Launch in 60 seconds. Return to ship.” may be followed by “Overtime is not an approved research method.” Do not randomize the informational clause. A joke cannot replace a heat warning or conceal the value of a scanned item. Limit barks with cooldowns and offer a reduced-banter setting.

Audio pipeline: keep lossless source recordings, export compressed runtime files after browser testing, normalize categories, document licenses, and provide text for every informational voice line. No voice likeness, music license, or marketplace asset entitlement is assumed. Placeholder tones are labeled as temporary.

## 18. Multiplayer architecture

Online design uses an **authoritative session server**. The lobby host is the campaign owner, not necessarily the machine simulating physics. P0 runs the same command/simulation interface locally. P1 uses a Node/TypeScript session service and a browser client over secure WebSockets; hosting provider selection follows a latency/cost spike. A static Pages deployment serves client files only and cannot run this service.

The authority owns physics, mission clock, deposits, grab/tether constraints, tool heat, injury, cargo banking, manifests, and reward events. Clients send intentions with player/session IDs, sequence numbers, and ticks; they never submit final cargo values or unlock claims as trusted state. Validate reach, line of sight, cooldown, valid state transitions, allowed targets, input rate, message size, and protocol/content versions.

Initial budgets: 60 Hz authority simulation, 20 Hz snapshots, 30 Hz input delivery with reliable discrete actions, and around 100 ms remote interpolation. Measure instead of assuming these rates are affordable. Predict local locomotion with correction smoothing. Remote characters and contested cargo render from authoritative snapshots; predict hand targets visually, not multiple competing world simulations. If held-object latency feels unacceptable at 100–150 ms RTT, simplify constraint behavior before attempting full rollback physics.

Snapshot contains tick, entity ID, transform, linear/angular velocity where needed, relevant state flags, held/tether relationships, and changed gameplay fields. Reliable events include spawn/despawn, ownership/handle grant, securing, phase change, and reward receipt. A missing baseline triggers a full resync; event IDs suppress repeats. Two users grabbing the same handle are resolved by authoritative arrival order and deterministic player-ID tie break. Separate valid handles permit co-carry.

Admission starts in the hub. P1 late join during a mission is observer-only until the next launch; reconnecting the same participant may reclaim their seat. On disconnect, clear inputs immediately, release tool use and grab/tether constraints, and leave the suit safely simulated. Keep a reconnect token/seat for 60 seconds; after that, retrieve the suit and release the seat. Reconnect receives current authoritative state, not a new copy of deposits or rewards.

If the lobby host disconnects, the dedicated session may finish the mission; persist its result receipt for the host to claim later. Hub decisions wait for host reconnection for up to 60 seconds, then end the room with a clear message. P1 does not promise seamless host migration. If the server itself fails, return to hub/connection UI with the last committed campaign; do not invent completed rewards. A validated result already persisted remains claimable.

Invite codes must be high-entropy and rate-limited. Use opaque session tokens, TLS, sanitized player names, and server-side size limits. The prototype economy remains casual and editable through local saves; do not market it as cheat-proof. Account authentication, Steam identity validation, public matchmaking, moderation services, and global rankings are later scopes. Never place service secrets in the static bundle.

## 19. Technical architecture

**Proposed stack:** TypeScript, Three.js rendering, Rapier 3D physics, Vite build tooling, HTML/CSS interface, and a Node/TypeScript server for P1. These are selections for the first engineering spike, not installed dependencies. Pin tested versions and commit a lockfile when implementation begins. Confirm browser and server builds use compatible physics/content versions.

Three.js exposes WebGL capability checks; use an explicit compatibility screen before loading the game. Rapier documents determinism only under matching simulation conditions, engine versions, and initialization/order constraints. Our complete game is not assumed deterministic, and multiplayer does not rely on browser lockstep. See [Three.js capability documentation](https://threejs.org/docs/pages/WebGL.html) and [Rapier determinism requirements](https://rapier.rs/docs/user_guides/javascript/determinism/).

Module boundaries:

| Module | Responsibility | Must not own |
|---|---|---|
| `core` | Entity IDs, commands, events, clock, state machine | DOM, renderer, platform login |
| `simulation` | Physics adapter, movement, constraints, hazards | UI or reward presentation |
| `gameplay` | Tools, deposits, cargo, mission, research rules | Direct network transport calls |
| `content` | Versioned data definitions and validators | Executable downloaded scripts |
| `presentation` | Camera, animation, sound, effects, renderer | Final reward or collision authority |
| `ui` | HUD, settings, menus, input hints | Hidden gameplay timers |
| `platform` | Input, storage, networking, future desktop adapters | Resource balance definitions |
| `server` | Sessions, validation, persistence receipts | Browser scene rendering |

Simulation frame order: consume validated commands → update mission/tool intent → step physics → resolve contacts/condition → update securing and player states → evaluate deadline → emit events/snapshot. Rendering interpolates independent of simulation. Limit catch-up to five ticks per render frame offline, log overload, and avoid spiraling stalls; do not silently change physics delta. Online mission time is based on authoritative simulation ticks and monitored for server overload.

Data definitions specify resource/tool/planet/research IDs, units, validation bounds, and content version. Save references use stable IDs instead of scene indices. Seeded random streams separate layout, hazards, and cosmetic variations. Cosmetic RNG must not consume gameplay RNG state. Store seed and content version with each run so defects can be reproduced.

Performance hypotheses: 60 fps target at 1080p on a named integrated-GPU test laptop; 30 fps low preset acceptable if readable and responsive. P0 scene budget is 80 active rigid bodies and 150 total dynamic bodies; P1 begins with 200 total dynamic bodies, 16 active cargo pieces near the crew, and simplified distant items. Start with an initial compressed download under 15 MB and no gameplay CDN dependency. Record actual hardware, load time, p95 frame time, memory growth, and browser versions at each release; these are not minimum-system claims yet.

Use mesh instancing for repeated rocks, capped shadows/particles, sleeping bodies, and pooled transient effects. Debris is cosmetic and non-reward-bearing. Limit simultaneous joints to one grab per player plus two tether links per player, two handles per co-carried item. Avoid unbounded tether chains and arbitrary object attachments. Define sensible quality presets before scaling content.

Build from modular source to a self-contained static distribution with relative asset paths. “Browser-first HTML” does not require authoring a single enormous HTML file. A later single-file demo can be bundled if useful; offline double-click support is not the default development contract. The distribution is served over HTTP(S), with no runtime secrets or required external asset hosts.

Steam path: evaluate a maintained desktop wrapper with local assets, offline solo, controller navigation, resolution/fullscreen support, crash logs, packaging, and update behavior. Add achievements/cloud through a platform adapter only after checking current Steamworks requirements. A wrapper does not automatically grant Steam integration or approval. Authentication planning must follow [Valve's Steamworks authentication documentation](https://partner.steamgames.com/doc/features/auth).

Unity path: port only after an explicit gate establishes a material benefit in tooling, performance, native integration, or production scale. Preserve rule IDs, content schemas, test fixtures, economy examples, and reference videos. Rewrite rendering, controllers, and physics integration in C#; TypeScript and Rapier behavior are not drop-in Unity assets. Re-tune all cargo/constraint feel and migrate saves through an exported neutral schema. Do not maintain parallel production engines during validation.

## 20. Save system and data ownership

P0 persists a versioned personal profile in IndexedDB, with settings stored separately. Contents: schemaVersion, contentVersion, profileId, revision, credits, RP, unlocked node IDs, discovery IDs, cosmetics, assist preferences, claimed reward IDs, and timestamps. Never store browser credentials or raw session tokens in exported saves. Local browser storage can be cleared; provide visible JSON export/import and remind the user after meaningful progress.

Commit a save after confirmed results, research purchase, or settings change—not every physics tick. Use an atomic IndexedDB transaction for profile plus reward-claim marker so a crash cannot award twice or subtract twice. Keep a last-known-good backup generation. Import validates file size (initial limit 1 MB), JSON shape, integer bounds, known IDs, and schema; preview the replacement and require explicit confirmation. Never execute imported code or silently merge conflicting currencies.

Migration is sequential `v1→v2→v3`, with fixtures and a backup before transforming. Unknown newer schema opens read-only/export recovery rather than resetting. Unknown content IDs are preserved in a quarantined field for review, not interpreted as new powers. Corruption produces a recovery choice: backup, import, or confirmed new profile. Reset requires confirmation and offers export first.

P1 server stores completed mission receipts keyed by run ID and participant ID, plus enough host-campaign identity to deliver the result. On reconnect a client claims a receipt once; the local transaction applies the reward and records its ID. A server-side claim record supports retries, but casual local edits remain possible. At least one durable result must exist before the completion screen declares rewards saved. If receipt persistence fails, show pending rewards and retry; do not start a new mission that discards the pending state.

Active mission resume after browser/server crash is deferred. Save the last completed campaign state, not a partially reconstructed physics world. Hosting retention and any accounts are decisions before P1 public access. For Steam Cloud, synchronize versioned profile files through the chosen adapter and handle divergent revisions with a user-facing selection; never assume browser IndexedDB syncs automatically.

## 21. Balancing and playtesting

Tune for meaningful decisions, recoverable mistakes, and short travel friction. Start with the handcrafted map and baseline tools. Do not balance around expert shortcut routes before newcomers can finish a haul. No upgrade should be the universally optimal choice across every cargo type and biome.

| Question | Initial success signal | Test |
|---|---|---|
| Is the loop readable? | 4 of 5 new players secure cargo within 3 minutes without spoken coaching | Observe first run; record confusion |
| Is movement controllable? | Most missed jumps result in intentional recovery within 5 seconds | Short ledge/landing course with manual feedback |
| Does hauling matter? | Players choose different routes for glass and cores | Watch route selection, not just completion |
| Is failure productive? | At least half of warning events prompt a changed action before disable | Annotated playtest events |
| Is co-op useful? | At least two voluntary assists per ten-minute group mission | Observe rescue/co-carry/tether use |
| Is there too much helplessness? | p95 uncontrolled time below 2 seconds, excluding chosen observation | State-duration logs and interviews |
| Is replay attractive? | At least 3 of 5 groups voluntarily request another run | Ask after session, without prompting during play |

These small-sample gates guide iteration; they are not statistical proof of market demand. Record both automated correctness and manual feel testing separately. Every tuning session names a hypothesis and changes a narrow parameter group. A failed gate triggers iteration or scope reduction rather than more planets.

Economy tests check nonnegative balances, first-discovery uniqueness, duplicate receipt handling, condition rounding, manifest conservation, split-value conservation, capacity boundaries, and research DAG prerequisites. Movement tests cover slopes, frame-rate variation, tab blur, grab release, extreme collisions, and recovery. Network tests cover two simultaneous grabs, 150 ms RTT, disconnect while holding a core, reconnect after banking, version mismatch, and server death at results.

Collect local logs for seed, input/event timestamps, tick rate, cargo outcomes, state transitions, and performance. External analytics is optional, opt-in, minimized, and needs a stated retention policy before use. Do not collect voice or unrelated user data. Invite playtesters to describe one funny moment and one unfair moment; both are more useful than an unexplained average score.

## 22. Roadmap and milestones

Effort ranges are planning placeholders for one experienced developer with occasional art/audio support. They exclude learning time, procurement, service outages, and major redesign. Schedule dates should be assigned after P0A measurements. Fund the next gate, not the full speculative content catalog.

| Milestone | Indicative effort | Deliverable | Exit gate |
|---|---|---|---|
| M0 Design foundation | Current documentation milestone | Bible, derived GDD, structure, Git baseline | Cross-document review; committed files; no implementation claim |
| P0A Movement laboratory | 1–2 developer-weeks | Camera, jump, capsule, one loose core, recovery, settings | Comfortable manual movement; stable fixed step |
| P0B Extraction loop | 1–2 weeks | Drill, scanner, three resources, heat, bay, timer, results | Complete five-minute route; conservation/boundary checks |
| P0C Public solo prototype | 1–2 weeks | Tutorial, persistence/export, low preset, hosted build | Newcomer gate; verified public URL; no critical loss bugs |
| P1A Network risk spike | 2–4 weeks | Two then four clients, authority, constraints, reconnect | Hauling usable at 150 ms RTT; no duplication |
| P1B Co-op vertical slice | 2–4 weeks | Tether, wrench, cart, rescue, hub, six research nodes | Full four-player sortie and recovery; manual group fun gate |
| P2A Content alpha | 4–8 weeks | Rust Belt, Icebox, twelve nodes, contract variants | Each biome changes hauling decisions; solo completion |
| P2B Browser release candidate | 3–6 weeks | Accessibility, migration, optimization, operations | Supported-browser matrix, durable rewards, recovery drill |
| P3 Desktop/Steam evaluation | 2–4 week feasibility spike | Packaged candidate and integration plan | Packaging/controller/offline checks; separate production approval |
| P4 Unity decision | Unestimated until gate | Comparison prototype and port budget if justified | Demonstrated gain exceeds port and migration cost |

Multiplayer risk is tested before producing multiple planets. P1A may start immediately after the P0 loop is credible; avoid accumulating single-player shortcuts that require a rewrite. P0C public deployment is a distinct later task; the current repository contains design documents only.

Every milestone includes a short changelog, known limitations, reproducible test notes, and a reviewed commit. Public builds require a verified shareable deployment under the parent workspace rules. Static client deployment and online session availability are checked separately. No “multiplayer ready” label based on opening one tab.

## 23. Production pipeline

Use one repository for documents, prototype client, server skeleton, data schemas, and small licensed runtime assets. Keep editable art/audio in their source directories; evaluate large-file storage before adding large binaries. Do not commit caches, generated builds, credentials, save exports, personal information, or unrelated files.

Feature workflow: define player problem and bible section → record an acceptance criterion in GDD/backlog → build smallest graybox → run relevant correctness checks → manually assess feel → revise tuning → add presentation → review source/data/licenses → commit → publish playable changes when available → verify deployed route and save behavior. Design changes update bible first; implementation details go in architecture decisions and GDD.

Use small milestone branches when a change is risky; keep main coherent. Commit subjects describe the delivered behavior. Never stage the entire parent drive or another project. Before release review only project-scoped staged files and inspect Git status/remotes. The current milestone should commit documentation and scaffold without claiming a playable build.

Content pipeline: concept note → grayscale silhouette → blockout mesh → in-engine scale/handling check → texture/material → collision/socket validation → audio/effects → runtime export → license/provenance entry. Each asset records source, author, permission/license, modifications, and export settings. Generated assets receive the same suitability and provenance review.

Definition of done: behavior meets acceptance criteria; user feedback is understandable; local/online ownership is correct where applicable; accessibility input alternatives work; no new persistent-data hazard; performance measured for affected systems; relevant documents match; known issues are recorded. Do not write elaborate tests for empty directories or purely cosmetic wording edits.

Release procedure for future prototypes: install pinned dependencies, run type/content checks and relevant tests, build, inspect bundled files for secrets and missing assets, manually complete a mission, deploy, verify public loading and one full route, note supported browser versions, then publish the release notes. Online releases additionally check server health, protocol compatibility, and a two-client session.

## 24. Risks and decision gates

| Risk | Early signal | Mitigation / decision |
|---|---|---|
| Floaty movement feels sluggish | Players miss cargo and stop exploring | Tune camera, ground acceleration, air control before new content |
| Constraint instability | Exploding carts, jitter, stuck hands | Force limits, simple colliders, attachment caps; simplify mechanics |
| Network handling feels delayed | Co-carry fails under ordinary RTT | Test P1A early; local visual prediction and fewer coupled bodies |
| Maintenance overwhelms fun | Long inactive time, avoided tools | Warning-driven faults, free workarounds, fewer simultaneous meters |
| Solo feels punitive | Heavy objective has no feasible route | Cuttable optional cores, cart routes, recall, deposit scaling |
| Four-player trivialization | One haul fills all needs immediately | Optional cargo distribution and sidegrade goals; no mass inflation |
| Content scope runs away | New biome before loop passes gate | Three-biome ceiling and gated future catalog |
| Low-end browser performance | p95 frame stalls, memory growth | Body budgets, sleeping, simpler shadows, quality presets |
| Data loss on a new PC | Progress only in browser storage | Export/import, backups, migrations; later platform cloud adapter |
| Hosting cost or outages | Expensive sessions, failed receipts | Measure per-room CPU/memory; durable receipts; graceful room end |
| Griefing dominates cooperation | Unwanted tethering and cargo blocking | Self-release, safe bay, private rooms, host moderation |
| Steam/Unity expectation mismatch | Assumption that a port is automatic | Separate feasibility gates and explicit rewrite budget |
| Reference/licensing issues | Unclear asset ownership or title conflict | Track asset provenance; perform name/store review before release |

Open decisions: minimum measured hardware; dependency versions; server provider and region; reward receipt retention; final desktop wrapper; asset licensing budget; final title; business model details; and whether a Unity port is justified. These do not block writing or the P0 graybox. Resolve each before its dependent milestone.

## 25. Future content

Priority after a stable three-destination game: new contracts and authored map chunks using existing rules, then one biome that introduces a single new hauling problem. Possible mission modifiers include darkness with illuminated anchor routes, meteor forecasts, swapped resource pockets, and a voluntary experimental-equipment sponsor.

Larger expansions: Soup Moon biology containment, Crusher heavy-haul expeditions, Shatterstone fracture routes, station gravity chambers, cosmetic ship personalization, and curated community seeds. A seed-share feature must include content version and assist settings. User-generated maps require validation and moderation planning before public distribution.

Experimental tools: gravity bubble with strict mass/radius limits; short-range teleport platform with occupancy validation; magnetic crane with a finite joint budget; scanner decoys for curious creatures. Each experiment must preserve secured-cargo uniqueness and provide a novice-readable failure warning.

Potential Steam features include achievements for cooperative feats, invites, cloud profiles, and controller layouts. No daily chores, paid loot boxes, forced login streaks, or season-pass economy is needed. More players, mod scripting, voice hosting, VR, and seamless planets remain separate proposals with their own costs.

## 26. Decisions, glossary, and references

Baseline decisions: third-person 3D; one local gravity vector per first-generation map; 1–4 players; solo P0 before online P1; authority-owned simulation; one launch clock; volume-limited secured bay; free starter equipment; no debt; content expansion after co-op proof; optional desktop packaging before any Unity port.

Glossary: **secured** means atomically recorded in the manifest and removed from active physics; **host** means campaign owner; **authority** means the local simulator or session server that decides shared state; **RP** means spendable research points; **discovery** means a durable knowledge flag; **P0/P1/P2** mean solo prototype/co-op slice/browser candidate; **gate** means evidence required before investing in the next scope.

Provenance: original user concept in “Chaotic Co-op Extraction Game,” conversation ID `6a6b862b-36b4-83ea-bea0-246e0ecddb20`, reviewed 14 September 2026. The earlier assistant's suggestions were design material, not completed work. This version is a new, internally specified baseline.

Technical references checked 14 September 2026: [Three.js WebGL capability checks](https://threejs.org/docs/pages/WebGL.html), [Rapier overview](https://rapier.rs/docs/), [Rapier determinism constraints](https://rapier.rs/docs/user_guides/javascript/determinism/), and [Steamworks authentication](https://partner.steamgames.com/doc/features/auth). Recheck release-sensitive documentation when implementing. These sources support technical planning; all gameplay numbers and production estimates are original proposals requiring validation.

## Implementation record — 0.2 solo field test

The first solo Practice Moon build is implemented in `prototype/`, in the user-created `C:\GPT_DEV\GPT Moon Goons` working folder. See [build verification](docs/production/BUILD_0.2.md) for actual coverage, evidence, and remaining gates. Planned milestone text above remains a target, not a claim that all acceptance criteria are complete.

Accepted prototype adjustments: assisted target selection is 2.8 m; quick scan uses F in addition to the scanner slot; failed pointer capture falls back to right-drag/arrow look; optional untimed practice awards no permanent progress; early extraction requires confirmation; pause offers a free suit recall. Camera shake and bob are absent. Current heat, mass, volume, payout, and deadline values retain the specified baseline. Full player stumble/injury, music, research purchase UI, controller support, networking, external newcomer tests, and hardware qualification remain future work.
