---
name: up-status
description: Show project progress, phases, blockers, and the next runnable phase
---

# Show project status

Quick read-only summary of where the project stands — mode, phases, blockers, and what's next.

## What to read

- `AGENTS.md` — current `AGENTS_STATE`
- `.unpack/docs/index.md` — doc index and phase overview
- `.unpack/docs/phases/phase-*.md` (skip `phase-template.md`) — status, dependencies, blockers
- `.unpack/conversations/` — how many conversations have been processed

If `.unpack/docs/index.md` doesn't exist, the project isn't set up yet — point the user to `/up-init` or `/up-adopt` and stop.

## What to show

Present a clear summary covering:

- **Mode** — ADOPT, BOOTSTRAP, or BUILD
- **Phases** — each phase with its status and dependencies. A table works well but use whatever's clearest.
- **Next runnable phase** — the lowest-numbered phase that isn't done/abandoned and whose dependencies are met. If everything's blocked or done, say so.
- **Blockers** — if any phase is blocked, make the blocking questions prominent. These are the most actionable part of the status.
- **Docs coverage** — which specs, discovery docs, practices, memory, and ADRs exist. Count what's actually there, don't assume a fixed number.

Keep it scannable. The user wants to glance at this and know what to do next.
