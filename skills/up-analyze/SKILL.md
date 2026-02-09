---
name: up-analyze
description: Check consistency between specs, phases, decisions, and traceability markers
---

# Analyze project consistency

Run a read-only cross-reference scan of the documentation system and report findings. This skill never modifies files.

## Procedure

1. **Read all project docs:**
   - All spec files: `docs/specs/*.md`
   - All phase files: `docs/phases/phase-*.md` (skip `phase-template.md`)
   - Project memory: `docs/_meta/project-memory.md`
   - ADRs: `docs/decisions/adr-*.md`
   - Index: `docs/index.md`

2. **Run these checks:**

   **Coverage** — For each requirement, feature, or named entity in specs, check if at least one phase work item references it (via `[S:]` markers or by content match). Report requirements with no phase coverage.

   **Orphan tasks** — If `[S:]` markers are present, check for work items that reference spec sections that don't exist. Also flag work items with markers pointing to deleted or renamed sections.

   **Stale references** — Check phase `## Links` sections for spec files or sections that no longer exist.

   **Decision lag** — For each accepted decision in `project-memory.md`, check if the relevant spec content is consistent. Flag cases where a decision says one thing but the spec still says the old thing.

   **Dependency integrity** — Check that every `depends_on` entry in phase frontmatter references an existing phase that is not `abandoned`.

   **Stuck phases** — Flag phases that are `in_progress` or `blocked` with an `updated` date older than 7 days.

   **Change log consistency** — If specs have `## Change log` entries, check that the referenced phase and decision IDs exist.

3. **Output findings** to the console as a formatted report:

   ```
   ## Analysis Results

   ### <Check name> (N found)
   - Finding with specific file and section references

   ### Summary
   - X specs, Y phases, Z decisions scanned
   - N findings (breakdown by severity)
   - Recommendation (if any)
   ```

4. **Severity levels:**
   - **High**: coverage gaps, stale references, decision lag (things that could cause building the wrong thing)
   - **Medium**: orphan tasks, stuck phases (things that indicate drift)
   - **Low**: change log inconsistencies, missing markers (cosmetic / hygiene)

5. **If no findings**, report a clean bill of health.

6. **Do not create files or modify anything.** This is a diagnostic-only skill. If findings suggest action, recommend it but do not take it.
