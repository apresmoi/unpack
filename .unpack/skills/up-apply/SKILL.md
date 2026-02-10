---
name: up-apply
description: Apply a follow-up conversation to patch or steer existing docs
---

# Apply a follow-up conversation

Patch existing docs based on a new research conversation. This is NOT a full bootstrap — it updates what changed and leaves the rest alone.

## Input

`$ARGUMENTS` can be a path to a conversation file. If empty, check for `conversation.md` at the repo root. If that doesn't exist, ask the user.

The conversation can be anything — a ChatGPT/Claude export, raw copy-paste, meeting notes, a markdown brain dump. If it wasn't started with the snapshot context prompt, work harder to map changes to existing docs and flag anything ambiguous.

## How it works

Read the conversation, read the current project state (index, specs, phases, memory, workflow), and figure out what changed.

For long, complex conversations (2000+ lines with multiple pivots), use the Large Conversation Protocol from `/up-bootstrap` — scan and index first, confirm with the user, then extract from confirmed sections only.

### What to patch

- **Specs** — update affected files only, don't rewrite unchanged specs. Mark changed sections with the conversation source.
- **Phases** — material scope changes get a `kind: steering` phase (per AGENTS.md). New features get new delivery phases. Never modify completed phases.
- **Project memory** — append new decisions, never overwrite. If a decision is superseded, mark the old one and add the new one.
- **Index** — update `.unpack/docs/index.md` with any new or changed phases.

### What NOT to patch

- Specs the conversation didn't touch
- Completed phases
- Existing decisions (append, don't overwrite)

## Archive and report

Ask for a conversation name (e.g., "auth-iteration"), move the file to `.unpack/conversations/NNN-name.md`, and report what changed — specs updated, phases added, decisions captured, contradictions found, and what's next.

If the conversation contradicts existing specs, flag it and ask the user — don't silently overwrite.
