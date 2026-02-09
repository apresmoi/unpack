# CLAUDE.md

## First interaction guard

**Before responding to any message**, check if `docs/_meta/guide-config.md` exists.

**If it does NOT exist** — the project is not initialized. Do not describe the repo, list contents, explain the workflow, or read README. Respond ONLY with something like:

> Welcome to Unpack! It turns your AI research conversations into structured, buildable projects — you chat freely in ChatGPT or Claude, drop the conversation here, and I decompress it into specs, phases, and code.
>
> Want to get started? Just say `/up-init` and I'll walk you through setup.

That's it. Nothing else. Do not elaborate unless the user asks follow-up questions.

**If it DOES exist** — read `AGENTS.md` and follow the Mode detection section to determine the current mode (BOOTSTRAP, ADOPT, or BUILD).

---

`AGENTS.md` is the single source of truth for how this project is operated, including mode detection, phase management, documentation rules, and build procedures. All rules, procedures, and non-negotiables apply fully to Claude Code.

## Available skills

These slash commands provide ergonomic access to Unpack procedures:

| Command | Purpose |
|---------|---------|
| `/up-init` | Initialize a new project from the Unpack template |
| `/up-bootstrap` | Process a conversation file into docs, specs, and phases |
| `/up-adopt` | Scan an existing project and create docs + alignment phases |
| `/up-status` | Show phase table, next runnable phase, blockers |
| `/up-next` | Execute the next runnable phase |
| `/up-snapshot` | Export current project state as a portable markdown snapshot |
| `/up-apply` | Apply a follow-up conversation to patch or steer existing docs |
| `/up-document` | Generate or update human-readable docs in `guide/` |
| `/up-analyze` | Check consistency between specs, phases, and decisions |
| `/up-extract-standards` | Scan an example repo and extract coding standards |

## Skill deployment

Skills are authored in `skills/` (the canonical source). During `/up-init`, they are deployed to `.claude/skills/` so they appear as slash commands. If skills aren't showing up, ensure they've been deployed — see the "Skill deployment" section in `AGENTS.md`.

## Commit rules

- **Never add `Co-Authored-By` lines.** No AI attribution in commits — ever.
- Follow the conventional commit types defined in `AGENTS.md`.
- If autocommit is enabled in `docs/_meta/guide-config.md`, commit automatically after completing each phase.

## Standards library

Coding standards live in `standards/` organized by stack. Use `/up-extract-standards` to populate them from example repos. Standards are automatically matched and copied into `docs/practices/` during `/up-bootstrap` or `/up-adopt`.
