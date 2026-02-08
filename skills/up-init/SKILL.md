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

Ask the user the following. Keep it conversational and concise — only ask what's needed to set up the project. Everything else (project name, description, stack, libraries) will be inferred later from `conversation.md` or the existing project.

**Basics** (group these together):
- Which agent(s) will you use? Claude Code, Codex, or both? (default: auto-detect from current agent)
- What's your starting point?
  - **From scratch** — no existing code, you'll bring a research conversation
  - **From reference** — starting fresh, but there's existing code to draw from (ask where it lives — local path or repo URL)
  - **Existing project** — there's already a working project to document and improve
- What license? MIT (recommended), Apache 2.0, ISC, or none.

**Coding standards:**
- Unpack ships standards for common stacks (check `standards/_index.md` for the full list). These will be matched automatically based on the stack detected in your conversation or project. The user can choose:
  - **Use Unpack's standards** (recommended) — matched automatically to their stack
  - **Bring your own** — describe what you want and we'll write custom standards
  - **Research best practices** — we'll research current best practices for their stack and generate standards
- Note: universal standards (file length, folder structure, agent-friendly patterns) are always included regardless of choice.

**Deployment:**
- How are you going to deploy? Offer these options:
  - AWS Copilot
  - Docker / Docker Compose
  - GCP (Cloud Run, App Engine, GKE)
  - Vercel
  - Fly.io
  - Railway
  - Other (let them describe)
  - Not sure yet / decide later

**Human-readable docs:**
- Do you want human docs? (yes / no / later)
- If yes: what level?
  - **End-user**: how to use the product (guides, tutorials)
  - **Technical**: architecture, API reference, deployment, configuration
  - **Full**: both end-user and technical, plus contributing and decisions
- Mintlify integration? (yes / no)

### Step 2: Replace project files

Use the project name from the conversation or project. If not yet known (starting from scratch, before conversation), use the directory name as a placeholder.

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
```

**Update LICENSE** with the chosen license text. Use the current year. Ask the user for the copyright holder name (default: "<Project Name> Contributors"). If no license chosen, delete the LICENSE file.

**Delete CONTRIBUTING.md** — this is a template file. The user can add their own later.

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
- Destination: `docs/practices/` — rename to drop subfolder prefix (e.g., `standards/typescript/libraries/prisma.md` → `docs/practices/prisma.md`)

Based on the user's standards choice in Step 1:

- **Use Unpack's standards**: Stack and library detection happens later (during `/up-bootstrap` or `/up-adopt`), which will match and copy the relevant standards from `standards/`. For now, only copy the universal standards.
- **Bring your own**: Ask the user to describe their standards. Write them as markdown files in `docs/practices/`.
- **Research best practices**: Note this preference in `docs/_meta/guide-config.md`. During `/up-bootstrap` or `/up-adopt`, the agent will research current best practices for the detected stack and generate standards.

Copy any deployment-related standards based on the infrastructure choice (e.g., `infra/docker.md`, `infra/aws-copilot.md`). If the user chose a platform we don't have standards for, note it for later research.

### Step 4: Write configuration

**Write `docs/_meta/guide-config.md`**:

```markdown
# Guide Configuration

## Project
- Entry path: <from-scratch/from-reference/existing-project>
- Reference: <path or URL, if from-reference>

## Standards
- Approach: <unpack/custom/research>
- Deployment: <aws-copilot/docker/gcp/vercel/fly/railway/other/undecided>

## Human docs
- Enabled: <yes/no/later>
- Level: <end-user/technical/full>
- Mintlify: <yes/no>

## Notes
- `/up-bootstrap` and `/up-adopt` read this file to determine standards loading
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

- From scratch → set `AGENTS_STATE` to `BOOTSTRAP`
- From reference → set `AGENTS_STATE` to `BOOTSTRAP`
- Existing project → set `AGENTS_STATE` to `ADOPT`

### Step 7: Guide the user

**If from scratch:**

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

**If from reference:**

```
Project initialized!

Next step — research your project:

1. Open ChatGPT or Claude
2. Paste the contents of prompts/research-guide.md at the start
3. Reference the existing code in your conversation — paste schemas, patterns, or
   architecture you want to carry forward
4. Save the chat as conversation.md at the project root
5. Run /up-bootstrap

The agent will scan the reference code during bootstrap to ground your specs in reality.
```

**If existing project:**

```
Project initialized!

Next step: run /up-adopt to scan your project and generate documentation + alignment phases.
```

## Important

- This skill personalizes the Unpack template for the user's project — README, LICENSE, and CONTRIBUTING get replaced or removed
- Do NOT delete `standards/`, `prompts/`, or `skills/` — these are framework files the user may need later
- Do NOT modify `AGENTS.md` beyond the state marker
- Keep the conversation fluid — if the user seems experienced, let them power through. If new, explain briefly
- The generated README should be clean and minimal — the user will customize it as their project develops
