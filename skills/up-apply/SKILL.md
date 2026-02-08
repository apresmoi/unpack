---
name: up-apply
description: Apply a follow-up conversation to patch or steer existing docs
---

# Apply a follow-up conversation to existing docs

You are reading a follow-up design conversation and patching/steering the existing documentation system. This is NOT a full bootstrap — it updates existing docs based on new research.

## Input

`$ARGUMENTS` can be a path to a conversation file. If empty, check for `conversation.md` at the repo root. If that doesn't exist, ask the user.

## Conversation format

The conversation does NOT need to follow any specific format. It can be:
- A ChatGPT/Claude session started with the snapshot context prompt (ideal — most aligned with current state)
- A raw conversation about project changes (common — works fine)
- Meeting notes, design discussions, or requirement changes in any markdown format

If the conversation wasn't started with the snapshot context prompt, the agent should work harder to map changes to existing docs. Extract what you can and flag anything ambiguous for user resolution.

## Procedure

1. **Read the conversation file**.

2. **Assess conversation complexity**. If the conversation is both long (2000+ lines) and complex (multiple pivots, abandoned directions), use the **Large Conversation Protocol** (same as in `/up-bootstrap`) before proceeding:
   - **Scan** the conversation in chunks and build a topic index with pivots, abandoned directions, and final decisions
   - **Present the conversation map** to the user for confirmation
   - **Extract** only from confirmed sections, taking the latest version of repeated topics
   - Then continue with step 3 using only the confirmed material

3. **Read the current project state**:
   - `docs/index.md`
   - All `docs/specs/*`
   - All `docs/phases/*`
   - `docs/_meta/project-memory.md`
   - `docs/_meta/workflow.md`

3. **Ask the user for a conversation name** (e.g., "auth-iteration", "performance-steering") for versioning.

4. **Move the conversation file** to `conversations/NNN-name.md` (auto-increment based on existing files).

5. **Analyze the conversation for changes**:
   - New requirements or changed requirements
   - Architecture changes
   - New decisions or overridden decisions
   - New phases or modified phase scope
   - Resolved open questions

6. **Apply changes to docs**:

   **Specs**: Update affected spec files only. Do NOT rewrite unchanged specs. Mark changed sections with the conversation source (e.g., "Updated from conversation 003").

   **Phases**:
   - If the conversation introduces material scope changes → create a new `kind: steering` phase (per AGENTS.md steering rule)
   - If it adds new features → add new delivery phases
   - Update dependencies if needed
   - Do NOT modify completed phases

   **Project memory**: Append new decisions (never overwrite existing). If a previous decision is superseded, mark it as "superseded by D-0XX" and add the new decision.

7. **Update `docs/index.md`** with any new or changed phases and updated status table.

8. **Report**:
   - What changed: specs updated, phases added/modified, decisions added
   - Conversation archived as `conversations/NNN-name.md`
   - Any open questions that emerged
   - Any contradictions with existing docs that need user resolution
   - Next step: `/up-next` or `/up-status`

## Important

- This is a PATCH operation, not a full rewrite
- Preserve all existing decisions and phase history
- If the conversation contradicts existing specs, flag it and ask the user — do not silently overwrite
- Create steering phases for material changes (per AGENTS.md steering rule)
- Decision IDs must be globally unique and sequential (check existing entries)
- Accept ANY conversation format — the snapshot context prompt is recommended, not required
- For long, complex conversations (2000+ lines with multiple pivots), use the Large Conversation Protocol (triage before extraction)
