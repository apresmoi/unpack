---
name: up-next
description: Execute the next runnable build phase
---

# Execute the next runnable phase

Pick up and execute the next phase in the development plan.

## Procedure

Follow the **BUILD** loop defined in `AGENTS.md`:

1. **Read first** (mandatory before any work):
   - `docs/index.md`
   - `docs/_meta/workflow.md`
   - `docs/_meta/project-memory.md` (if it exists)
   - `docs/practices/*` (loaded standards for this project)
   - All phase files in `docs/phases/`

2. **Select the next runnable phase**:
   - Status is NOT `done` or `abandoned`
   - All `depends_on` phases are `done`
   - If multiple phases are runnable, pick the lowest-numbered one
   - If no phase is runnable (all blocked or done), report that to the user

3. **If the phase has open questions**: ask the user, set status to `blocked`, record the questions.

4. **Execute the phase**:
   - Work through the ordered work items
   - Check off each item as completed
   - Follow loaded standards in `docs/practices/*` for code style, naming, structure
   - Implement only what is in-scope for this phase

5. **Run the test plan** specified in the phase file. If tests fail, fix and re-run.

6. **Update everything**:
   - Phase file: status, checkboxes, timestamps
   - `docs/index.md`: phase status table, current focus
   - Any affected specs (if behavior/architecture changed)
   - `docs/_meta/project-memory.md`: append new decisions
   - Create ADRs for significant decisions

7. **Steering check**: if during implementation you discover scope/architecture/constraint changes:
   - Stop at the smallest safe boundary
   - Create a new `kind: steering` phase
   - Update dependencies and `docs/index.md`
   - Add a decision entry in project-memory.md
   - Report the steering to the user

8. **Report** what was done, what passed, and what's next.
