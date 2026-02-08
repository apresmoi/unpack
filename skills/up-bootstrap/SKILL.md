---
name: up-bootstrap
description: Process a research conversation into structured docs, specs, and phases
---

# Bootstrap project from a conversation

You are reading a design conversation and decomposing it directly into the Unpack documentation system.

## Input

`$ARGUMENTS` can be a path to a conversation file. If empty, check for `conversation.md` at the repo root. If that doesn't exist, check `conversations/` for unprocessed files and ask the user.

## Conversation format

The conversation does NOT need to follow any specific format. It can be:
- A ChatGPT/Claude export started with the research guide prompt (ideal — most structured)
- A raw ChatGPT/Claude conversation copy-paste (common — works fine)
- Meeting notes, brainstorm docs, or any markdown with design discussions (works, may have more gaps)

If the conversation wasn't started with the research guide, extract what you can and mark missing areas as open questions. The agent should work harder to find structure in unstructured input rather than rejecting it.

## Procedure

0. **Project setup** (first run only — skip if README already looks project-specific):

   Read `docs/_meta/guide-config.md` for the user's preferences, then:

   - **README**: Replace with a project-specific one. Use the project name from the conversation (or directory name as placeholder). Include the Unpack commands table and links to `docs/` and `guide/`.
   - **LICENSE**: Update with the chosen license text (current year, ask for copyright holder if needed). If "none", delete it.
   - **CONTRIBUTING.md**: Delete (template file).
   - **.gitignore**: Append stack-appropriate entries based on what you detect in the conversation (TypeScript → node_modules/dist/.env, Python → __pycache__/.venv, etc.). Always include: `snapshot.md`, `conversation.md`, `.DS_Store`, `Thumbs.db`, `*.swp`.
   - **Standards**: Copy universal standards (`standards/universal/file-length.md`, `standards/organization/folder-structure.md`, `standards/organization/agent-friendly.md`) to `docs/practices/`. Match and copy stack-specific standards based on what the conversation discusses. Copy deployment standards if applicable.
   - **guide/**: If human docs are enabled, create the directory. If Mintlify is enabled, create a starter `mint.json`.
   - **AGENTS_STATE**: Set to `BUILD` (done at the end of bootstrap, step 9).

1. **Read the conversation file**.

2. **Assess conversation complexity**. Triage is based on complexity, not just length — a 3000-line focused conversation may not need it, while a 1500-line conversation with 5 pivots does. Use the **Large Conversation Protocol** below if the conversation has **both** significant length (roughly 2000+ lines) **and** multiple topic pivots or abandoned directions. Otherwise, continue directly.

3. **Ask the user for a conversation name** (e.g., "initial-design", "auth-flow"). This will be used for versioning.

4. **Move the conversation file** to `conversations/NNN-name.md`:
   - Look at existing files in `conversations/` to determine the next number
   - Format: `001-initial-design.md`, `002-auth-iteration.md`, etc.

5. **Read the unpack map** from `docs/_meta/unpack-map.md` for the topic-to-file mapping.

6. **Read `docs/_meta/workflow.md`** for operating rules and **`docs/practices/*`** for any loaded standards.

7. **Extract and decompose** the conversation into docs:

   **Specs** (`docs/specs/*`):
   - Map conversation topics to spec files using the unpack map
   - Each spec must be self-contained and readable
   - Link to related specs and relevant phases
   - Label anything uncertain as "inferred" or "needs confirmation"
   - Do NOT invent requirements not discussed in the conversation
   - If a spec area (e.g., security, operations) wasn't discussed, create the file with a note: "Not covered in initial conversation — needs discussion"

   **Project memory** (`docs/_meta/project-memory.md`):
   - Extract decisions with IDs (D-001, D-002, ...)
   - Capture philosophy, constraints, non-negotiables
   - Tag everything as **Explicit** or **Inferred**
   - Include rationale and alternatives considered
   - Keep evidence quotes to 20 words or less

   **Phases** (`docs/phases/*`):
   - Generate phase files from the discussed build plan
   - Each phase must have: YAML frontmatter, `depends_on`, work items, completion criteria, test plan
   - Create `phase-0.md` as bootstrap and mark it `done`
   - Keep phases small (1-3 focused iterations each)
   - If the conversation didn't include a build plan, generate a reasonable default based on the discussed architecture and ask the user to confirm

8. **Update `docs/index.md`**:
   - Index all spec files and phase files
   - Update the phase status table
   - Set "Current focus" to the next runnable phase
   - Add conversation reference

9. **Switch to BUILD mode** in `AGENTS.md`:
   - Change `<!-- AGENTS_STATE: BOOTSTRAP -->` to `<!-- AGENTS_STATE: BUILD -->`

10. **Report** to the user:
    - Summary: specs created, phases generated, decisions captured, open questions
    - Conversation archived as `conversations/NNN-name.md`
    - Areas that need more discussion (gaps from unstructured conversations)
    - Next step: "Run `/up-next` to begin building, or `/up-status` to review the plan"

## Large Conversation Protocol

When the conversation is both long (2000+ lines) and complex (multiple topic pivots, abandoned directions, or heavily iterative exploration), do NOT attempt to extract everything in one pass. A single AI response with extended thinking can easily be 300+ lines, so raw length alone is not the trigger — look for **pivots and abandoned directions** as the primary signal. Use this two-pass triage protocol:

### Pass 1: Scan and index

Read the conversation in chunks and build a **conversation map**:

- **Topic timeline**: List each major topic discussed, in order, with approximate line ranges
- **Pivot points**: Where the conversation changed direction significantly (e.g., "Started with a CLI tool, pivoted to a web app at line ~400")
- **Abandoned directions**: Topics explored then explicitly dropped or superseded
- **Final decisions**: For topics discussed multiple times, identify the latest/final version
- **Meta-conversation to skip**: Writing tips, formatting discussions, tangential asides, bibliographies that are reference-only
- **Key artifacts**: Schemas, code blocks, data structures, or existing work the user shared

### Pass 2: Confirm with user

Present the conversation map to the user:

```
## Conversation Map

### Topic arc
1. [lines 1-250] Explored X approach → abandoned
2. [lines 250-800] Pivoted to Y, designed core architecture
3. [lines 800-1500] Detailed data model + UI flows
4. [lines 1500-2000] Bibliography and reference dump

### Final direction: Y approach
### Decisions found: ~15
### Abandoned: X approach (lines 1-250)
### Skip: Bibliography section (reference only, not specs)

Does this look right? Should I follow this map for extraction?
```

The user confirms or corrects. Then proceed with targeted extraction:
- Deep-read only the confirmed sections
- For topics discussed multiple times, use the latest version only
- Skip abandoned directions entirely
- Treat bibliographies/reading lists as references, not requirements
- Extract meta-discussion only if it contains actual decisions

### Why this matters

Without triage, the agent will:
- Create specs for abandoned ideas (wasted work, confusing docs)
- Get confused by contradictory decisions (early vs late in conversation)
- Spend excessive tokens processing reference material that isn't specs
- Miss the actual final architecture buried under 8000 lines of exploration

## Important

- Do NOT invent requirements not in the conversation
- Label anything uncertain as "Inferred" vs "Explicit"
- Prefer structured bullets over prose
- Phases must be small enough for 1-3 focused iterations
- Memory extraction happens as part of this process, not as a separate step
- Accept ANY conversation format — the research guide is recommended, not required
- For long, complex conversations (2000+ lines with multiple pivots), ALWAYS use the Large Conversation Protocol
