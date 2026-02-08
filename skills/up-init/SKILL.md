---
name: up-init
description: Initialize a new project from the Unpack template — configure stack, standards, and docs preferences
---

# Initialize your project

You are running the onboarding wizard for a new Unpack project. This personalizes the template, loads coding standards, and prepares the repo for development.

## Input

`$ARGUMENTS` is ignored — initialization always runs in the current directory.

## Procedure

### Step 1: Gather project information

Ask the user the following. Keep it conversational and fluid — group questions naturally, don't dump everything at once.

**Identity:**
- What is the project name?
- One-line description of what it does.

**License:**
- What license? Offer: MIT (recommend as default), Apache 2.0, ISC, or none.

**Contributing guide:**
- Do you want a CONTRIBUTING.md? (yes / no)

**Stack and standards:**
- What stack? Show available standards from `standards/_index.md`:
  - TypeScript — general, React, Next.js, Express API
  - Python — general (poetry, ruff, mypy, pytest, structlog, pydantic-settings)
  - Other (no stack-specific standards, still loads universal + organization)
- If TypeScript selected: which libraries? Prisma, Tailwind, React Query, Zod
- Infrastructure: AWS Copilot, Docker, or neither

**Entry path:**
- Greenfield (will bring a research conversation) or existing codebase (adoption)?

**AI coding agent:**
- Which agent(s) will you use? Claude Code, Codex, or both? (default: auto-detect from current agent)

**Human-readable docs:**
- Do you want human docs? (yes / no / later)
- If yes: what level?
  - **End-user**: how to use the product (guides, tutorials)
  - **Technical**: architecture, API reference, deployment, configuration
  - **Full**: both end-user and technical, plus contributing and decisions
- If yes: Mintlify integration? (yes / no)

### Step 2: Replace project files

**Replace README.md** with a project-specific one. Use this structure:

```markdown
# <Project Name>

<One-line description>

## Getting started

<!-- This section will be filled in as the project develops -->

## Development

This project uses [Unpack](https://github.com/apresmoi/unpack) for documentation-driven development.

### Useful commands

| Command | What it does |
|---------|-------------|
| `/up-status` | Show progress, phases, and blockers |
| `/up-next` | Execute the next build phase |
| `/up-snapshot` | Export state for external research |
| `/up-apply` | Apply a follow-up conversation |
| `/up-document` | Generate human-readable docs |

### Project documentation

- Agent docs: [`docs/`](docs/) — specs, phases, decisions, and memory
- Human docs: [`guide/`](guide/) — readable docs for developers and users

## License

[<License name>](LICENSE)
```

If the user chose no license, omit the License section.

**Update LICENSE** with the chosen license text. Use the current year. Ask the user for the copyright holder name (default: "<Project Name> Contributors"). If no license chosen, delete the LICENSE file.

**Handle CONTRIBUTING.md:**
- If yes: replace with a project-specific one:

```markdown
# Contributing to <Project Name>

## Getting started

<!-- TODO: add setup instructions after first build phases -->

## Development workflow

This project uses [Unpack](https://github.com/apresmoi/unpack) for documentation-driven development. See [`docs/`](docs/) for specs and phase plans.

## Submitting changes

1. Create a branch
2. Make your changes
3. Submit a pull request
```

- If no: delete CONTRIBUTING.md.

**Create or extend .gitignore** with stack-appropriate entries:

Always include:
```
# Unpack temporary files
snapshot.md
conversation.md

# OS
.DS_Store
Thumbs.db

# Editor
*.swp
*.swo
*~
```

If TypeScript:
```
node_modules/
dist/
build/
.env
.env.local
.env.*.local
```

If Python:
```
__pycache__/
*.pyc
.venv/
venv/
*.egg-info/
.env
```

If Docker: no additional entries needed.

If a `.gitignore` already exists, append missing entries rather than overwriting.

### Step 3: Load standards

- **Always include**: `universal/file-length.md`, `organization/folder-structure.md`, `organization/agent-friendly.md`
- Copy selected framework standards (e.g., `typescript/general.md`, `typescript/react.md`)
- Copy selected library standards (e.g., `typescript/libraries/prisma.md`)
- Copy selected infrastructure standards (e.g., `infra/docker.md`)
- Destination: `docs/practices/` — rename to drop subfolder prefix (e.g., `standards/typescript/libraries/prisma.md` → `docs/practices/prisma.md`)

### Step 4: Write configuration

**Write `docs/_meta/guide-config.md`**:

```markdown
# Guide Configuration

## Human docs
- Enabled: <yes/no/later>
- Level: <end-user/technical/full>
- Mintlify: <yes/no>

## Notes
- `/up-document` reads this file to determine what to generate
- Change these settings anytime by editing this file
```

**Update `docs/index.md`** to include a Practices section listing the loaded standards with links.

If human docs enabled: create `guide/` directory. If Mintlify enabled: create a starter `mint.json` with the project name and basic navigation.

### Step 5: Deploy skills

Copy the full content of each skill from `skills/` to the agent-specific discovery path(s) based on the user's agent selection:

- **Claude Code**: copy each `skills/<name>/SKILL.md` → `.claude/skills/<name>/SKILL.md`
- **Codex**: copy each `skills/<name>/SKILL.md` → `.agents/skills/<name>/SKILL.md`

This includes `up-init` itself — the pre-shipped shim gets replaced with the full content.

If the user selected "both", deploy to both paths. After deployment, skills appear as slash commands in the selected agent(s).

### Step 6: Set agent state

- Greenfield → set `AGENTS_STATE` to `BOOTSTRAP`
- Existing codebase → set `AGENTS_STATE` to `ADOPT`

### Step 7: Guide the user

**If greenfield:**

```
Project initialized!

Next step — research your project:

1. Open ChatGPT or Claude
2. Paste the contents of prompts/research-guide.md at the start
3. Have your design conversation (any style — stream of consciousness is fine)
4. Save the chat as conversation.md at the project root
5. Run /up-bootstrap

Any conversation format works — raw ChatGPT exports, meeting notes, brainstorm docs.
```

**If existing codebase:**

```
Project initialized!

Next step: run /up-adopt to scan the codebase and generate documentation + alignment phases.
```

## Important

- This skill personalizes the Unpack template for the user's project — README, LICENSE, and CONTRIBUTING get replaced or removed
- Do NOT delete `standards/`, `prompts/`, or `skills/` — these are framework files the user may need later
- Do NOT modify `AGENTS.md` beyond the state marker
- Keep the conversation fluid — if the user seems experienced, let them power through. If new, explain briefly
- The generated README should be clean and minimal — the user will customize it as their project develops
