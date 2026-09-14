# ADR-001: Browser-first simulation boundaries

Date: 2026-09-14 • Status: accepted design baseline; dependency feasibility pending P0A

## Context

The game must prove low-gravity hauling in a browser, support real co-op later, and preserve options for Steam and Unity without funding two engines immediately.

## Decision

Plan TypeScript + Three.js + Rapier + Vite with modular source. Keep simulation/rules separate from rendering, input, storage, and transport. P0 runs a local authority adapter; P1 runs server authority with the same command and content contracts. Store content and saves under stable versioned IDs.

Use snapshot replication and local locomotion prediction initially. Do not depend on whole-game deterministic lockstep. Limit coupled cargo constraints and test representative latency before expanding content.

## Consequences

Static hosting handles the client only. Online rooms need a separately operated service. A desktop wrapper needs a dedicated packaging/platform spike; a Unity port rewrites engine integration and requires retuning. Schemas, design fixtures, and reference recordings are portable; engine behavior is not assumed portable.

## Revisit when

The P0 physics spike fails to achieve stable handling, the P1 network spike fails under 150 ms RTT, measured hosting costs exceed a selected budget, or native tooling has a demonstrated benefit. Record evidence before replacing the stack.
