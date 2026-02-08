---
id: phase-N
title: "<short title>"
kind: delivery # delivery | steering | bootstrap
status: planned # planned | in_progress | blocked | done | abandoned
depends_on: [] # e.g. ["phase-1", "phase-2"]
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
unpack_version: "1.0.0"
---

# Phase N — <title>

## Intent

What this phase achieves in one paragraph.

## Scope (in / out)

### In scope

- ...

### Out of scope

- ...

## Links

- Specs:
  - ...
- ADRs:
  - ...

## Decision refs

- D-...

## Work items (ordered)

- [ ] Item 1
- [ ] Item 2

## Completion criteria (must all be true)

- [ ] Criterion 1
- [ ] Criterion 2

## Test plan

Commands to run and what "pass" means.

- Unit / type / lint:
  - `...`
- Integration / e2e:
  - `...`
- Notes:
  - ...

## Open questions / blockers

- (If blocked, list questions to ask the user.)

## Notes / steering log

- Record any discoveries that might require a new steering phase.
