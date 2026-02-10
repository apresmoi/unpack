---
name: up-snapshot
description: Export current project state as a portable markdown snapshot for external research
---

# Export project state as a portable snapshot

Create a narrative markdown snapshot of the project that can be pasted into ChatGPT, Claude, or any AI tool for research conversations.

## Input

`$ARGUMENTS` may contain a description of what the user wants (e.g., "database schemas", "full overview"). If empty, ask.

## Step 1: Figure out what they need

If `$ARGUMENTS` already describes a clear intent, skip to Step 2.

Otherwise, present this message (keep it exactly this brief):

```
What kind of snapshot?

- **Overview** — what this project is, where we are, what's decided
- **Design focus** — specific area you want to discuss (e.g., "redesign the UI", "rethink the data model")
- **Implementation** — how something actually works today, with schemas and code references
- **Everything** — full dump, no filter

Or just tell me what you want to take to ChatGPT and I'll figure it out.
```

Wait for the user's response.

**If they pick design focus or implementation but don't say which area:** ask "Which area?" — nothing else. Wait again. That's your max 2 rounds of clarification.

**If they describe something specific in any form:** go straight to Step 2. Don't ask for clarification you don't need.

## Step 2: Read project state

Read what you need based on the intent — not everything:

- **Overview**: `.unpack/docs/index.md`, `.unpack/docs/specs/*`, `.unpack/docs/_meta/project-memory.md`
- **Design focus**: `.unpack/docs/index.md`, the relevant specs, the relevant phases, relevant decisions from `project-memory.md`
- **Implementation**: `.unpack/docs/index.md`, relevant specs, relevant phases, AND relevant source files (schemas, configs, key modules) — yes, include actual code for implementation snapshots
- **Everything**: all docs (`index.md`, `specs/*`, `phases/*`, `_meta/project-memory.md`, `practices/*` under `.unpack/docs/`), conversation list from `.unpack/conversations/`

Use Task agents with subagent_type=Explore if you need to find relevant source files for implementation snapshots. For other types, direct reads are fine.

## Step 3: Write the snapshot

Write to `snapshot.md` at the repo root.

**The snapshot must be narrative, not a file listing.** Write about the project as if you're briefing someone who will help you think about it. Reference file paths inline only when they ground the narrative (e.g., "the claim extraction pipeline (`packages/db/scripts/extract-claims.ts`) reads from...").

### Structure by snapshot type

**Overview:**
```markdown
# <Project Name> — Snapshot

> <1-sentence description of the project>

## Where we are
<Phase status, what's done, what's in progress, what's next. Narrative, not a table.>

## How it works
<Architecture, components, data flows — described narratively with domain language.>

## Domain model
<Key entities, relationships, business rules. Use the project's own terminology.>

## Key decisions
<Only the decisions that shape the project's identity. Include rationale.>

## Open questions
<What's unresolved, what needs input.>
```

**Design focus:**
```markdown
# <Project Name> — <Area> Design Snapshot

> <1-sentence project context + what this snapshot focuses on>

## Project context
<Just enough to understand the project — 1-2 paragraphs max.>

## Current state of <area>
<How it works today. What's built, what's not. Include relevant schemas, patterns, or code snippets.>

## Decisions shaping <area>
<Only the decisions relevant to this area, with rationale.>

## What we want to discuss
<Restate the user's intent — what they want to explore, redesign, or decide.>

## Open questions
<Unresolved items relevant to this area.>
```

**Implementation:**
```markdown
# <Project Name> — <Area> Implementation Snapshot

> <1-sentence context>

## How <area> works
<Step-by-step narrative of the current implementation. Include actual code snippets, schema definitions, config shapes — whatever makes it concrete.>

## Key files
<Brief map of where things live, only for the relevant area.>

## Decisions and constraints
<Technical decisions that constrain this area.>

## Known issues / gaps
<What's missing, broken, or needs improvement.>
```

**Everything:**
Use the Overview structure but expand every section fully. Include phase details, all decisions, coding standards summary, conversation history.

### Writing rules

- **Speak about the project, not about files.** "The system extracts claims from transcribed speech" not "The extraction spec is in `.unpack/docs/specs/05-extraction.md`"
- **Use the project's domain language.** If the project calls things "episodes" and "claims", use those words — the point is that someone reading this snapshot will speak the same language when they respond
- **Include code/schemas when they add clarity.** Especially for implementation snapshots — paste the actual Prisma schema, the actual API route, the actual config shape
- **Inline file references where useful.** "(see `packages/db/prisma/schema.prisma`)" — but only when someone might want to find it later
- **Keep under 8000 words** if possible — this goes into a context window

## Step 4: Report

After writing the snapshot, say:

```
Snapshot saved to `snapshot.md`.

Paste it into ChatGPT or Claude to continue your research. When you're done, save the conversation as `conversation.md` and run `/up-apply`.
```

That's it. Two lines.

## Important

- Keep your messages to the user SHORT — 1-2 lines unless presenting a list
- Do NOT read files before asking the user what they want
- Do NOT use AskUserQuestion — this is conversational
- Max 3 rounds of back-and-forth before you start building
- If the user gives you enough info in `$ARGUMENTS`, skip straight to reading + writing (0 rounds)
