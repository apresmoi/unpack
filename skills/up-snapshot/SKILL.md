---
name: up-snapshot
description: Export current project state as a portable markdown snapshot for external research
---

# Export project state as a portable snapshot

You are creating a compressed markdown snapshot of the current project state. This snapshot is designed to be pasted into ChatGPT, Claude, or another AI tool for further research and iteration.

## Input

`$ARGUMENTS` can specify focus areas (e.g., "auth", "phase-3", "architecture"). If empty, export everything.

## Procedure

1. **Read the full project state**:
   - `docs/index.md`
   - All `docs/specs/*` files
   - All `docs/phases/*` files (skip `phase-template.md`)
   - `docs/_meta/project-memory.md` (if exists)
   - `docs/_meta/workflow.md`
   - `docs/practices/*` (summarize, don't copy verbatim)
   - List files in `conversations/` for history

2. **If focus areas specified**: filter to only relevant specs, phases, and decisions. Include enough surrounding context for the external AI to understand the project.

3. **Compile a single markdown document** with this structure:

   ```markdown
   # Project Snapshot — <project name>

   Generated: <date>
   Focus: <focus areas or "full project">

   ## Current state
   - Phase status table (from index.md)
   - Active/next phase details
   - Open questions/blockers

   ## Specs summary
   (Compressed version of all relevant specs — key requirements, architecture, decisions)

   ## Architecture
   (From specs/03-architecture.md — components, boundaries, data flows)

   ## Key decisions
   (From project-memory.md — decisions with rationale, tagged Explicit/Inferred)

   ## Active phase details
   (Full content of current/next phase including work items and completion criteria)

   ## Coding standards in use
   (List of loaded practices with key highlights — not full content)

   ## Conversation history
   (Numbered list of processed conversations with names)

   ## Open questions
   (Aggregated from all phase files and specs)
   ```

4. **Write to `snapshot.md`** at the repo root.

5. **Report**:
   - "Snapshot exported to `snapshot.md`"
   - "To continue research: paste `prompts/snapshot-context.md` into ChatGPT, then paste the snapshot content"
   - "When done: save the new conversation as `conversation.md` and run `/up-apply`"

## Important

- Optimize for signal density — this will be pasted into a context window
- Include enough context that the external AI understands the project without repo access
- Do NOT include source code from `src/` — only documentation
- Keep under 8000 words if possible (to fit in a single ChatGPT message)
- If the project is large and a full snapshot exceeds the limit, prioritize: current phase > architecture > decisions > specs > standards
