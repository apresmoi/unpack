---
name: up-init
description: Initialize a new project from the Unpack template
---

# Initialize your project

Quick setup — ask a few questions, save preferences, deploy skills. Everything else (README, LICENSE, standards, .gitignore) happens during `/up-bootstrap` or `/up-adopt` when we actually know the project.

## Input

`$ARGUMENTS` is ignored — initialization always runs in the current directory.

## Procedure

### Step 1: Ask the user

Use AskUserQuestion to gather preferences. Aim for **2 rounds max**. Group questions so each round has 2-4 questions. Do NOT read any files before asking — you have everything you need here.

**Round 1:**
- Which agent(s) will you use? Claude Code, Codex, or both. (default: auto-detect from current agent)
- What's your starting point?
  - **From scratch** — no existing code, you'll bring a research conversation
  - **From reference** — starting fresh, but there's existing code to draw from
  - **Existing project** — there's already a working project to document and improve
- What license? MIT (recommended), Apache 2.0, ISC, or none.
- How do you want to handle coding standards? Use Unpack's (recommended), bring your own, or research best practices.

**Round 2:**
- How are you going to deploy? AWS Copilot, Docker, GCP, Vercel, Fly.io, Railway, other, or not sure yet.
- Auto-commit after completing phases? Yes (recommended), or no.
- Do you want human-readable docs? No, yes (end-user / technical / full), or decide later.
- If yes to docs: Mintlify integration? (yes / no)

Skip questions that don't apply (e.g., don't ask about Mintlify if they said no to docs). If only 1 question remains, merge it into Round 1 instead of doing a separate round.

### Step 1b: Git identity (optional)

After Round 2, check the current git config for the repo: `git config user.name` and `git config user.email`. Show the user what's configured and ask if they want to change it for this repo. If yes, run `git config user.name "..."` and `git config user.email "..."` (repo-level, not global).

### Step 2: Write configuration

Create `docs/_meta/guide-config.md` — this is the only file that MUST exist for the project to be considered initialized:

```markdown
# Guide Configuration

## Project
- Entry path: <from-scratch/from-reference/existing-project>
- License: <mit/apache-2.0/isc/none>

## Standards
- Approach: <unpack/custom/research>
- Deployment: <aws-copilot/docker/gcp/vercel/fly/railway/other/undecided>

## Human docs
- Enabled: <yes/no/later>
- Level: <end-user/technical/full>
- Mintlify: <yes/no>

## Git
- Autocommit: <yes/no>

## Notes
- `/up-bootstrap` and `/up-adopt` read this file to configure the project
- `/up-document` reads this file to determine what to generate
- Change these settings anytime by editing this file
```

### Step 3: Deploy skills

Deploy skills to the agent-specific paths using a single bash command. Do NOT use a Task agent for this — it's a simple copy loop.

Based on the user's agent selection, run one of:

**Claude Code only:**
```bash
for skill in skills/*/; do name=$(basename "$skill"); mkdir -p ".claude/skills/$name" && cp "$skill/SKILL.md" ".claude/skills/$name/SKILL.md"; done
```

**Codex only:**
```bash
for skill in skills/*/; do name=$(basename "$skill"); mkdir -p ".agents/skills/$name" && cp "$skill/SKILL.md" ".agents/skills/$name/SKILL.md"; done
```

**Both:**
```bash
for skill in skills/*/; do name=$(basename "$skill"); mkdir -p ".claude/skills/$name" ".agents/skills/$name" && cp "$skill/SKILL.md" ".claude/skills/$name/SKILL.md" && cp "$skill/SKILL.md" ".agents/skills/$name/SKILL.md"; done
```

### Step 4: Guide the user

**If from scratch or from reference:**

```
Project initialized!

Next step — research your project:

1. Open ChatGPT or Claude
2. Paste the contents of prompts/research-guide.md at the start
3. Have your design conversation (any style — stream of consciousness is fine)
4. Save the chat as conversation.md at the project root
5. Run /up-bootstrap
```

If from reference, add: "Reference the existing code in your conversation — paste schemas, patterns, or architecture you want to carry forward."

**If existing project:**

```
Project initialized!

Next step: run /up-adopt to scan your project and generate documentation + alignment phases.
```

## What init does NOT do

These are handled by `/up-bootstrap` or `/up-adopt` — not init:

- Replace README.md (needs project name from conversation)
- Update LICENSE / delete CONTRIBUTING.md
- Create .gitignore (needs stack detection)
- Load coding standards (needs stack detection)
- Create guide/ directory or mint.json
- Set AGENTS_STATE (bootstrap/adopt sets it when they run)

## Important

- Do NOT read files unnecessarily — you have all the information you need in this skill
- Do NOT use Task agents for simple operations
- Keep the total tool calls under 10 (2 AskUserQuestion + 1 Write + 1 Bash + 1 text output = 5 ideally)
- Keep it fast — the user wants to get to their research conversation, not watch setup churn
