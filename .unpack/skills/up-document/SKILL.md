---
name: up-document
description: Generate or update human-readable docs in guide/ (supports Mintlify)
---

# Generate or update human-readable documentation

You are creating or updating documentation in the `guide/` folder for human readers — developers, stakeholders, and users of this project.

## Input

`$ARGUMENTS` can specify what to document (e.g., "getting-started", "architecture", "api"). If empty, generate or update the full guide based on the configured documentation level.

## Procedure

1. **Read the guide configuration** from `.unpack/docs/_meta/guide-config.md` (if it exists):
   - Check if human docs are enabled (yes / no / later)
   - Check the documentation level (end-user / technical / full)
   - Check if Mintlify is enabled
   - If the file doesn't exist, ask the user what level of docs they want

2. **If human docs are disabled**: inform the user and suggest they update `.unpack/docs/_meta/guide-config.md` if they want to enable them. Stop here.

3. **Read the current project state**:
   - `.unpack/docs/index.md`
   - All `.unpack/docs/specs/*`
   - `.unpack/docs/_meta/project-memory.md`
   - Relevant `.unpack/docs/phases/*` (completed phases show what was built)
   - Existing `guide/*` files (to update rather than overwrite)

4. **Ensure `guide/` folder exists** at the project root.

5. **Generate or update documentation based on level**:

   **End-user level** (minimal, saves tokens):
   - `guide/index.md` — table of contents
   - `guide/getting-started.md` — setup, install, run
   - `guide/usage.md` — how to use the product
   - Additional pages for user-facing features

   **Technical level**:
   - Everything in end-user, plus:
   - `guide/architecture.md` — system overview with mermaid diagrams
   - `guide/api-reference.md` — if APIs exist
   - `guide/configuration.md` — environment variables, settings
   - `guide/deployment.md` — how to deploy

   **Full level**:
   - Everything in technical, plus:
   - `guide/contributing.md` — how to contribute to this project
   - `guide/decisions.md` — key architectural decisions explained for humans
   - Additional pages based on project specifics

6. **Writing style**:
   - Write for human developers, not AI agents
   - Use clear prose with concrete examples
   - Include mermaid diagrams where they clarify architecture or flows
   - Do NOT duplicate the entire specs — synthesize and simplify
   - Reference specs for canonical detail: "For the full specification, see `.unpack/docs/specs/03-architecture.md`"

7. **If Mintlify is enabled**:
   - Ensure `mint.json` exists at the project root
   - Update the `navigation` array in `mint.json` to include all guide pages
   - Structure pages with clean headers compatible with Mintlify rendering
   - Use Mintlify-compatible features: callouts, code groups, tabs where appropriate

8. **Report** what was generated or updated, and suggest what might need manual review.

## Important

- Human docs (`guide/`) are SEPARATE from agent docs (`.unpack/docs/`)
- `.unpack/docs/` is the source of truth for agents — `guide/` is the explanation layer for humans
- Generate at phase boundaries, not after every tiny change
- When updating, preserve any manual edits the user made to guide files
- Respect the configured documentation level — don't generate technical docs if the user only wants end-user docs
