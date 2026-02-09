# AGENTS.md

<!--
AGENTS_STATE values:
- ADOPT: project exists, docs are missing/weak; scan the project and build docs + alignment phases
- BOOTSTRAP: conversation.md exists; decompress into docs/
- BUILD: docs + phases exist; execute phases
-->
<!-- AGENTS_STATE: BOOTSTRAP -->
<!-- UNPACK_VERSION: 1.0.0 -->

## Purpose

This repository is operated through documentation and phases.

There are two entry modes:
- **ADOPT** (existing project, no docs yet): scan the project, reverse-engineer docs, and create alignment phases.
- **BOOTSTRAP** (new project or from reference, `conversation.md` exists): read the conversation, decompress it into `docs/`, and generate phases. If reference code was specified during init, scan it to ground specs in existing patterns.

After bootstrap or adopt, the agent switches to **BUILD** mode and uses `docs/phases/*` to drive all work.

## Non-negotiable rules

1. **If unsure, ask.** Do not guess requirements or business intent.
2. **No hidden scope.** Any material change in scope/constraints becomes a **new steering phase**.
3. **Phases drive work.** Only do work that is in the current phase scope.
4. **Dependencies matter.** A phase cannot start until all `depends_on` phases are `done`.
5. **Keep `docs/index.md` current.** It must index all docs + phases + statuses at all times.
6. **Inference labeling.** Anything derived from code without confirmation must be labeled as "inferred".
7. **Project memory is binding.** The agent must read `docs/_meta/project-memory.md` (if it exists) before planning or executing a phase.
8. **Decision logging is mandatory.** Any new decision or changed assumption must be recorded (append-only) in `docs/_meta/project-memory.md`, and if stable, promoted to an ADR.

---

## Mode detection

- If `docs/_meta/guide-config.md` does not exist → **project not initialized**. Do not enter any mode. Do not list the repo contents or full workflow. Just welcome the user in 2-3 sentences: Unpack turns AI research conversations into structured, buildable projects — you chat freely, drop the conversation here, and the agent turns it into specs, phases, and code. Then offer to run `/up-init` to get started.
- If `conversation.md` exists at repo root → run **BOOTSTRAP**.
- Else if `docs/index.md` is missing OR `docs/phases/` is empty → run **ADOPT**.
- Else → run **BUILD**.

## Skill deployment

Skills are stored in `skills/` at the repo root as the canonical, agent-agnostic source. Each agent discovers skills from its own path:

- **Claude Code**: `.claude/skills/<name>/SKILL.md`
- **Codex**: `.agents/skills/<name>/SKILL.md`

Before entering any mode, check if skills are deployed to your path. If not, copy each `skills/<name>/SKILL.md` to the corresponding location under your skills directory. This is a one-time operation — after deployment, skills are available as slash commands.

During `/up-init`, the user is asked which agent(s) they'll use, and skills are deployed to all selected paths.

---

## ADOPT — Adopt an existing project

### Goal

Create an Unpack-ready documentation system and an **alignment phase plan** that upgrades the project to a healthy, compliant state.

### Output required

- `docs/` scaffold with:
  - `docs/index.md` fully populated
  - `docs/discovery/*` filled from repo scan
  - `docs/specs/*` seeded (with "TBD / needs confirmation" where required)
  - `docs/phases/*` alignment phases with dependencies, criteria, and test plans
- `docs/_meta/project-memory.md` initialized (if decisions are made during bootstrap)
- Switch `AGENTS_STATE` to `BUILD`

### Steps

1. **Create docs scaffold**
   - Ensure `docs/_meta`, `docs/discovery`, `docs/specs`, `docs/phases`, `docs/decisions` exist.
   - Create templates if missing.

2. **Repo scan (no refactors yet)**
   - Build a repo inventory from files:
     - languages/frameworks detected
     - entrypoints (main binaries / server start points)
     - dependency manifests (`package.json`, `pyproject.toml`, `go.mod`, etc.)
     - test/lint/typecheck commands (or absence)
     - CI configs (or absence)
     - deployment manifests (or absence)
   - Write results into:
     - `docs/discovery/repo-inventory.md`
     - `docs/discovery/runtime-and-commands.md`

3. **Inferred architecture + debt**
   - Derive a best-effort component map from folder structure + key files.
   - Label all unverified conclusions as **inferred**.
   - Write into:
     - `docs/discovery/architecture-inferred.md`
     - `docs/discovery/risks-and-debt.md`

4. **Seed stable specs**
   - Populate `docs/specs/*` with what is confidently knowable.
   - Anything unclear becomes:
     - a "Needs confirmation" section inside the relevant spec, and
     - an "Open question" in the next phase file.

5. **Create alignment phases**
   - Generate `docs/phases/phase-0.md` as the setup phase and mark it `done` only after docs are generated and indexed.
   - Create a minimal default alignment plan (phase-1+), then tailor it to what the repo scan found.
   - Default alignment phases (tailor based on scan):
     - **phase-1**: Make it runnable (establish "how to run", set minimal env, verify local run path)
     - **phase-2**: Quality baseline (introduce minimal lint/format/type/unit gates)
     - **phase-3**: Tests + CI (add CI pipeline, smoke tests, stabilize flaky pieces)
     - **phase-4**: Architecture cleanup (boundaries, modules, dependency direction, dead code)
     - **phase-5**: Docs become truth (confirm inferred architecture with user, upgrade specs from "inferred" to "confirmed")
   - Each phase must include: `depends_on`, ordered work items, completion criteria, test plan, open questions/blockers.

6. **Update `docs/index.md`**
   - Index all discovery docs, specs, decisions, and phases.
   - Include a phase status table + next runnable phase.

7. **Switch to BUILD**
   - Update the state marker at the top of this file to:
     `<!-- AGENTS_STATE: BUILD -->`

---

## BOOTSTRAP — Process conversation into docs

### Goal

Read `conversation.md`, extract all design information, decompress it into the structured docs tree under `docs/`, generate phases, archive the conversation, then switch to BUILD.

### Steps

1. **Read `conversation.md`.**
   - If it is missing or empty:
     - If `docs/_meta/guide-config.md` does not exist (project not initialized yet), suggest: "Run `/up-init` to set up your project first, then start a research conversation."
     - Otherwise, guide briefly: "Drop a conversation as `conversation.md` at the project root — ChatGPT exports, meeting notes, any format works. For structured research, start with `prompts/research-guide.md`."
     - Stop and wait for the user.

2. **Ask the user for a conversation name** (e.g., "initial-design", "auth-flow").

3. **Archive the conversation**
   - Look at existing files in `conversations/` to determine the next number.
   - Move `conversation.md` to `conversations/NNN-name.md` (e.g., `001-initial-design.md`).

4. **Ensure docs tree exists.**
   - Create any missing folders/files from the scaffold (`docs/_meta`, `docs/specs`, `docs/phases`, `docs/decisions`).

5. **Read the unpack map** from `docs/_meta/unpack-map.md` for topic-to-file mapping.

6. **Extract and write specs** into `docs/specs/*`
   - Map conversation topics to spec files using the unpack map.
   - Each spec must be self-contained and readable.
   - Link to related specs and relevant phases.
   - Label anything uncertain as "inferred" or "needs confirmation".
   - Do NOT invent requirements not discussed in the conversation.

7. **Extract decisions** into `docs/_meta/project-memory.md`
   - Assign IDs: D-001, D-002, etc.
   - Capture philosophy, constraints, non-negotiables.
   - Tag each as **Explicit** (stated in conversation) or **Inferred** (derived).
   - Include rationale and alternatives considered where discussed.

8. **Generate phases** from the discussed build plan
   - Each phase file must have: YAML frontmatter, `depends_on`, work items, completion criteria, test plan.
   - Create `phase-0.md` as bootstrap and mark it `done`.
   - Keep phases small (1-3 focused iterations each).

9. **Update `docs/index.md`**
   - Index all spec files and phase files.
   - Update the phase status table.
   - Set "Current focus" to the next runnable phase.
   - Add conversation reference.

10. **Switch to BUILD mode**
    - Change the state marker at the top of this file to `BUILD`.

---

## Conversation processing protocol

This protocol applies whenever a conversation file is processed (BOOTSTRAP or `/up-apply`).

### For focused conversations (any length, no major pivots)

1. Read the full conversation.
2. Identify: requirements, architecture, decisions, constraints, open questions, and build plan.
3. Map topics to docs structure using `docs/_meta/unpack-map.md`.
4. For each topic area, create or update the corresponding spec file.
5. Extract decisions into `docs/_meta/project-memory.md` (append-only).
6. Generate or update phases based on the discussed plan.
7. Label anything uncertain as "inferred" or "needs confirmation".
8. Preserve existing content when patching (for `/up-apply`) — do not rewrite unchanged sections.

### For long, complex conversations (2000+ lines with multiple pivots or abandoned directions)

Triage is based on **complexity, not just length** — a 3000-line focused conversation may not need it, while a shorter conversation with many pivots does. A single AI response with extended thinking can easily be 300+ lines, so raw line count alone is not the trigger. Look for **pivots and abandoned directions** as the primary signal.

Use the **Large Conversation Protocol** — a two-pass triage approach:

**Pass 1 — Scan and index:**
1. Read the conversation in chunks.
2. Build a conversation map: topic timeline, pivot points, abandoned directions, final decisions, meta-conversation to skip, and key artifacts (schemas, code, data structures).
3. For topics discussed multiple times, identify which version is the latest/final.

**Pass 2 — Confirm and extract:**
4. Present the conversation map to the user for confirmation. Show what will be extracted, what will be skipped, and which direction the agent will follow.
5. The user confirms or corrects (e.g., "actually the CLI direction wasn't abandoned, we want both").
6. Deep-read only the confirmed sections.
7. Continue with steps 2-8 from the short conversation protocol above.

**Why triage matters:** Without it, the agent will create specs for abandoned ideas, get confused by contradictory early-vs-late decisions, waste tokens on bibliographies and meta-discussion, and miss the actual architecture buried under thousands of lines of exploration.

---

## BUILD — Execute phases

### Read first (every time)

Before planning or executing any phase, read:
- `docs/index.md`
- `docs/_meta/workflow.md`
- `docs/_meta/project-memory.md` (if it exists)
- All phases (or at least the next runnable phase + its dependencies)

### High-level loop

1. Read the files listed above.
2. Select the **next runnable phase**:
   - status != `done`
   - all `depends_on` phases are `done`
3. If the phase has open questions:
   - ask the user
   - set phase `status: blocked`
   - record the questions inside the phase file
4. Implement only what is in-scope for the phase.
5. Run the phase test commands (or explain why not runnable).
6. Update:
   - phase status + checkboxes + timestamps
   - `docs/index.md` phase table (keep formatting clean — no duplicate separators, consistent table alignment)
   - any affected specs (if behavior/architecture changed)
   - promote qualifying decisions to ADRs (see Decision management below)
   - append new decisions to `docs/_meta/project-memory.md`

### Steering rule (mandatory)

If, during implementation, you discover any of the following:
- requirements changed
- architecture must change materially
- new subsystem is required
- test strategy needs revision
- repo constraints changed (CI/CD, tooling, deployment)

Then:
1. **Stop current phase work** (finish the smallest safe boundary).
2. Create a **new phase** (next number) of `kind: steering`.
3. Describe:
   - what changed
   - why it changed
   - the new constraints
   - impacts on existing phases (update dependencies if needed)
4. **Split if needed.** If a steering phase covers multiple independent concerns (e.g., schema refactor + new subsystem + deployment change), create separate steering phases for each concern with their own dependencies. A steering phase should be as focused as a delivery phase.
5. Update `docs/index.md`.
6. Add a decision entry in `docs/_meta/project-memory.md` explaining why the steering exists.
7. When an important decision is accepted, create an ADR and cross-reference the decision ID.

### Decision management

`project-memory.md` is the quick, append-only log. Every decision goes here first with a `D-NNN` ID. ADRs are the long-term record for decisions that shape the project.

**Promote to ADR** when a decision meets any of these:
- It affects architecture or system boundaries
- It's referenced by 2+ phases
- It supersedes a previous decision
- The user explicitly confirms it as stable

**When promoting:**
1. Create `docs/decisions/adr-NNNN-short-title.md` from the template.
2. Cross-reference the decision ID (e.g., `Decision ref: D-007`).
3. Mark the project-memory entry as `→ Promoted to ADR-NNNN`.

**At phase boundaries** (when marking a phase `done`), review any new decisions added during that phase and promote qualifying ones. Do not let project-memory.md grow beyond ~30 unpromoted decisions without promoting the stable ones.

---

## Commit conventions

All commits must use [Conventional Commits](https://www.conventionalcommits.org/) format: `type: description`.

### Standard types

| Type | When to use |
|------|-------------|
| `feat` | New functionality |
| `fix` | Bug fix |
| `refactor` | Restructuring without behavior change |
| `docs` | Documentation-only changes |
| `test` | Test additions or changes |
| `chore` | Maintenance, deps, tooling |

### Unpack-specific types

| Type | When to use |
|------|-------------|
| `bootstrap` | Initial conversation decomposition into docs/specs/phases |
| `steer` | Steering phase — scope change, pivot, or constraint update |
| `done` | Phase completion (include phase number and title) |

### Examples

```
bootstrap: decompose initial-design conversation into docs, specs, and phases
steer: local-first pivot — defer cloud deployment (phase-9)
done: phase-1 — schema & database foundation
feat: rclone sync script + ingestion hardening
fix: NaN sanitization in speaker embeddings
```

### Rules

- **No `Co-Authored-By` lines.** No AI attribution in commits.
- Keep the subject line under 72 characters.
- Use the body for details (what changed, why, decision refs).
- Reference phase numbers and decision IDs where relevant.
- **Autocommit** (if enabled in `guide-config.md`): the agent commits automatically after completing each phase using the `done:` type.

---

## File formatting standards (phases)

Phase files MUST start with YAML front matter and follow the template in `docs/phases/phase-template.md`.

Allowed `status` values:
- `planned`
- `in_progress`
- `blocked`
- `done`
- `abandoned`

---

## Version stamping

All files generated by Unpack skills must include the framework version for traceability.

Read the version from the `UNPACK_VERSION` comment at the top of this file.

- **Files with YAML frontmatter** (phases): add `unpack_version: "<version>"` to the frontmatter.
- **All other generated files** (specs, project-memory, guide-config, human docs, snapshot, README/LICENSE/CONTRIBUTING created by init): add `<!-- unpack:<version> -->` as the last line.

This allows users to see which version generated each file and helps the agent identify files that may need regeneration after an upgrade.

---

## Notes for the agent

- Prefer small, atomic edits.
- Keep docs consistent and non-contradictory.
- Never mark a phase `done` unless completion criteria are satisfied and tests (if applicable) pass.
- Decisions in `project-memory.md` have IDs: `D-001`, `D-002`, etc.
- ADR filenames can include the decision ID or reference it inside.
- Phases can reference decisions as `Decision refs: D-00X`.
