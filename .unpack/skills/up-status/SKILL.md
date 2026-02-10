---
name: up-status
description: Show project progress, phases, blockers, and the next runnable phase
---

# Show Unpack project status

Display the current state of the documentation and phase system.

## Procedure

1. **Read `AGENTS.md`** and extract the current `AGENTS_STATE` (ADOPT, BOOTSTRAP, or BUILD).

2. **Read `.unpack/docs/index.md`** for the full documentation index and phase status table.

3. **Read all phase files** in `.unpack/docs/phases/` (skip `phase-template.md`).

4. **Count conversations** in `.unpack/conversations/` folder.

5. **Output a formatted summary**:

   ```
   ## Project Status

   Mode: <current AGENTS_STATE>
   Conversations processed: <count>

   ### Phases
   | # | Title | Status | Depends On | Blockers |
   |---|-------|--------|------------|----------|
   | ... | ... | ... | ... | ... |

   ### Next runnable phase
   <phase id + title, or "none — all done" or "blocked — see blockers">

   ### Open questions / blockers
   - <list from phase files>

   ### Docs coverage
   - Specs: X/9 populated
   - Discovery: X/4 populated
   - Practices: X loaded
   - Project memory: exists/missing
   - ADRs: X created
   ```

6. If any phase is `blocked`, highlight the blocking questions prominently.

7. If `.unpack/docs/index.md` is missing, tell the user the Unpack system isn't set up yet and suggest `/up-init` or `/up-adopt`.
