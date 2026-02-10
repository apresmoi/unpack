---
name: up-adopt
description: Scan an existing project and create docs + alignment phases
---

# Adopt an existing project

Scan a project that already has code, create Unpack documentation from what you find, and generate phases to bring it to a healthy state. This is read-only — no refactors, no code changes.

## Input

`$ARGUMENTS` can optionally specify a repo path. If empty, use the current working directory.

## Project setup

First run only — skip if the README already looks project-specific.

Read `.unpack/docs/_meta/guide-config.md` for preferences, then set up the repo scaffolding: replace the template README with a project-specific one, update or delete LICENSE based on the user's choice, delete CONTRIBUTING.md (template file), append stack-appropriate `.gitignore` entries (always include `snapshot.md`, `conversation.md`, `.DS_Store`), and create `guide/` if human docs are enabled.

## Scan

Read the repo and write what you find to `.unpack/docs/discovery/`:

- **Inventory** (`repo-inventory.md`) — languages, frameworks, entrypoints, dependency manifests, folder structure
- **Runtime** (`runtime-and-commands.md`) — how to run, test, lint, typecheck, deploy. Note anything missing.
- **Architecture** (`architecture-inferred.md`) — component map derived from folder structure and key files. Label everything **inferred**.
- **Risks** (`risks-and-debt.md`) — gaps, debt, inconsistencies, missing tests or CI

## Seed docs

- **Specs** (`.unpack/docs/specs/*`) — populate with what's confidently knowable from the scan. Mark anything unclear as "Needs confirmation."
- **Standards** — match the detected stack against `.unpack/standards/`, copy relevant ones to `.unpack/docs/practices/`, and note gaps in the risks doc.

## Generate phases

Create phases in `.unpack/docs/phases/` that form a path from the current state to a healthy project. Typical goals to consider (not a fixed list — tailor to what the scan actually found):

- Make it runnable locally (dev setup, env, dependencies)
- Establish quality gates (lint, format, typecheck)
- Test coverage + CI
- Architecture cleanup (boundaries, dead code, dependency direction)
- Confirm docs (promote inferred → confirmed)

Mark `phase-0` as `done` (the adoption scan itself). Keep phases small — 1-3 focused iterations each. Skip goals that are already met, add new ones if the scan reveals project-specific needs.

## Wrap up

- Update `.unpack/docs/index.md` with all discovery docs, specs, phases, and status
- Switch `AGENTS_STATE` in `AGENTS.md` to `BUILD`
- Ask the user about anything code can't reveal — business intent, deployment targets, security constraints. Record answers in project memory.
- Report what you found and what phases you created

## Important

- This is docs + a plan, not code changes. Don't refactor anything.
- Label all conclusions as **inferred** until the user confirms them.
