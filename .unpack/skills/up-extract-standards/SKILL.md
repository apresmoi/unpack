---
name: up-extract-standards
description: Scan an example repo and extract its coding patterns into a standards file
---

# Extract coding standards from an example repository

Scan an example repository and extract its patterns into a standards file for the standards library.

## Input

`$ARGUMENTS` should be the path to an example repository to scan. If empty, ask the user.

## Procedure

1. **Scan the repository**:
   - Detect language(s) and framework(s)
   - Read `package.json`, `tsconfig.json`, `pyproject.toml`, `.eslintrc*`, `.prettierrc*`, `ruff.toml`, and similar config files
   - Examine folder structure (depth 3 levels)
   - Sample 5-10 representative source files to detect patterns

2. **Extract patterns** across these categories:

   **Project structure**:
   - Root folder layout
   - Source code organization (by feature, by type, hybrid)
   - Where tests live relative to source
   - Config file locations

   **Naming conventions**:
   - File naming (camelCase, kebab-case, PascalCase)
   - Folder naming
   - Component/class/function naming
   - Export naming (named vs default)

   **File patterns**:
   - Typical file length range
   - One-component-per-file or grouped
   - Barrel exports (index.ts re-exports)
   - Co-located tests, styles, types

   **Import/export patterns**:
   - Absolute vs relative imports
   - Path aliases (@/ etc.)
   - Named exports vs default exports
   - Import ordering conventions

   **Tooling**:
   - Linter + config (ESLint, Ruff, etc.)
   - Formatter (Prettier, Black, etc.)
   - Type checker (TypeScript strict mode, mypy, etc.)
   - Test runner + patterns (Jest, Vitest, pytest, etc.)
   - Build tool

   **Library-specific patterns**:
   - Styling approach (Tailwind, CSS Modules, styled-components, etc.)
   - State management
   - API/data fetching patterns
   - Middleware patterns (if backend)

   **Anti-patterns observed**:
   - Note any inconsistencies or patterns that seem intentionally avoided

3. **Determine the right standards file** to write or update:
   - Match to existing files in `.unpack/standards/` based on detected stack
   - If no match, propose a new file name

4. **Write the standards file** with status `seeded` and all extracted patterns.

5. **Report** what was extracted, confidence level on each pattern, and ask the user to confirm or adjust key patterns before marking as `confirmed`.

## Important

- This is a read-only scan — do NOT modify the example repo
- Distinguish between patterns the repo uses consistently vs one-off occurrences
- If the repo is inconsistent, note the inconsistency rather than picking a side
