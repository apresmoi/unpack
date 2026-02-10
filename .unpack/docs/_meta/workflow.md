# Workflow

## Principles

- Docs are the truth; code follows docs.
- Work is done in phases; phases have dependencies and completion criteria.
- If uncertain, ask the user. Do not guess.

## Sources of truth

- `.unpack/docs/specs/*`: system + product truth
- `.unpack/docs/specs/*/## Change log`: why specs changed (appended by steering phases)
- `.unpack/docs/phases/*`: execution plan truth
- `.unpack/docs/decisions/*`: why we chose X over Y
- `.unpack/docs/index.md`: navigation + current status truth
- `.unpack/docs/_meta/project-memory.md`: decisions, rationale, and development philosophy

## Change control (steering)

Any material change in scope/constraints must be captured as a new phase of `kind: steering`, with explicit impacts and updated dependencies.

## Phase status meanings

- `planned`: not started
- `in_progress`: active work
- `blocked`: awaiting answer/input
- `done`: completion criteria satisfied + tests passed (if applicable)
- `abandoned`: intentionally dropped (must explain why)

## Project memory maintenance

- `.unpack/docs/_meta/project-memory.md` is append-only:
  - add new decisions as new rows/entries
  - never delete old decisions
  - mark superseded decisions as "superseded by D-0XX"
- phases/ADRs must reference decision IDs where relevant
