---
name: up-adopt
description: Scan an existing project and create docs + alignment phases
---

# Adopt an existing project into the Unpack system

You are scanning an existing project and creating documentation + alignment phases to bring it to a healthy state.

## Input

`$ARGUMENTS` can optionally specify a repo path. If empty, use the current working directory.

## Procedure

Follow the **ADOPT** procedure defined in `AGENTS.md`:

1. **Create the docs scaffold** if missing: `docs/_meta`, `docs/specs`, `docs/phases`, `docs/decisions`, `docs/discovery`.

2. **Scan the repository** (read-only, no refactors):
   - Languages and frameworks detected
   - Entrypoints (main binaries, server start points)
   - Dependency manifests (`package.json`, `pyproject.toml`, `go.mod`, etc.)
   - Test/lint/typecheck commands (or their absence)
   - CI configs (or absence)
   - Deployment manifests (or absence)
   - Folder structure and organization patterns
   - Write results to `docs/discovery/repo-inventory.md` and `docs/discovery/runtime-and-commands.md`

3. **Infer architecture + identify debt**:
   - Derive a component map from folder structure + key files
   - Label everything as **inferred**
   - Write to `docs/discovery/architecture-inferred.md` and `docs/discovery/risks-and-debt.md`

4. **Seed specs** (`docs/specs/*`):
   - Populate with what is confidently knowable from the scan
   - Mark unclear sections as "Needs confirmation"
   - Add open questions to phase files

5. **Load relevant standards**:
   - Based on detected stack, check if `docs/practices/` has matching standards loaded
   - If not, suggest which standards from `standards/` should be loaded
   - Compare repo patterns against loaded standards and note gaps in `docs/discovery/risks-and-debt.md`

6. **Create alignment phases** (`docs/phases/`):
   - `phase-0`: adoption bootstrap (mark `done` when scan is complete)
   - `phase-1`: make it runnable (local dev, env setup)
   - `phase-2`: quality baseline (lint, format, type, unit gates)
   - `phase-3`: tests + CI
   - `phase-4`: architecture cleanup (boundaries, dead code, dependency direction)
   - `phase-5`: docs become truth (confirm inferred → confirmed)
   - Tailor based on what the scan actually found — skip phases that don't apply, add new ones if needed

7. **Update `docs/index.md`** with all discovery docs, specs, phases, and status table.

8. **Switch `AGENTS.md`** state to `BUILD`.

9. **Ask the user** about anything critical that code can't reveal (business intent, deployment targets, security constraints). Record answers.

## Important

- Do NOT refactor anything during this process
- Label all conclusions as "inferred" until the user confirms them
- The goal is docs + a plan, not code changes
