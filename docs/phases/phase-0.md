---
id: phase-0
title: "Bootstrap: setup docs + phase plan"
kind: bootstrap
status: planned
depends_on: []
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
unpack_version: "1.0.0"
---

# Phase 0 — Bootstrap: setup docs + phase plan

## Intent

Set up the documentation system and create a tailored phase plan. For greenfield projects this means processing a conversation into structured docs; for existing repos this means scanning the codebase and generating discovery docs + alignment phases.

## Scope (in / out)

### In scope

- Create/verify docs scaffold
- Write discovery docs from repo scan (adoption) OR extract specs from conversation (greenfield)
- Seed specs with known facts + "needs confirmation" markers
- Create phases (phase-1+) with dependencies, criteria, and test plans
- Update `docs/index.md`
- Switch `AGENTS.md` state to BUILD

### Out of scope

- Refactors
- Feature work
- Language-specific coding guidelines
- Large dependency upgrades (unless required to run at all)

## Decision refs

- (none yet)

## Work items (ordered)

- [ ] Verify docs tree + templates exist
- [ ] Scan repo / read conversation.md
- [ ] Write discovery docs OR extract specs from conversation
- [ ] Seed `docs/specs/*` with known facts + open questions
- [ ] Generate phases (phase-1+) with dependencies + test plans
- [ ] Update `docs/index.md` with all docs + phases
- [ ] Archive conversation to `conversations/` (if greenfield bootstrap)
- [ ] Update `AGENTS.md` state marker to BUILD

## Completion criteria

- [ ] `docs/specs/*` exist and are consistent
- [ ] `docs/phases/*` exist with dependencies + criteria + test plan
- [ ] `docs/index.md` links to all docs + phases and shows correct status
- [ ] `conversation.md` archived to `conversations/` (if it existed)
- [ ] `AGENTS.md` state marker set to BUILD

## Test plan

N/A (docs-only phase)

## Open questions / blockers

- (none)

## Notes / steering log

- (none)
