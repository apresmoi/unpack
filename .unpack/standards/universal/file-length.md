# Universal — File Length Standards

> **Status**: seeded
> **Applies to**: All languages and project types
> **Depends on**: None

## The rule

**Maximum 400 lines per file.** If a file exceeds 400 lines, split it.

This applies to all source files: TypeScript, Python, YAML, CSS, etc. The only exceptions are generated files (Prisma client, lockfiles, migrations) and config files that must be monolithic.

## Why 400 lines

- **AI agent context windows**: agents work most effectively when they can read an entire file at once. 400 lines fits comfortably within a single read operation
- **Human comprehension**: a file you can't hold in your head is a file that breeds bugs
- **Code review quality**: smaller files get better reviews — reviewers actually read them
- **Merge conflicts**: smaller files have fewer conflicts and simpler resolution

## When to split

A file needs splitting when:

- It exceeds 400 lines
- It contains multiple unrelated concepts (a service class AND utility functions AND types)
- You find yourself scrolling to remember what's at the top
- Two developers frequently edit different parts of the same file (merge conflict signal)

## How to split (TypeScript)

**Large component file** → folder with sub-components:
```
# Before: Card.tsx (450 lines)

# After:
Card/
├── Card.tsx           # Main component (shell + composition)
├── CardHeader.tsx     # Sub-component
├── CardBody.tsx       # Sub-component
├── CardFooter.tsx     # Sub-component
├── types.ts           # Shared types
└── index.ts           # export * from all parts
```

**Large service class** → split by domain operation:
```
# Before: agent.service.ts (500 lines with CRUD + search + analytics)

# After:
services/
├── agent.service.ts          # Core CRUD operations
├── agent-search.service.ts   # Search/filter operations
├── agent-analytics.service.ts # Analytics queries
└── index.ts                  # Barrel re-export
```

**Large route file** → split by sub-resource:
```
# Before: agent.routes.ts (400+ lines)

# After:
routes/
├── agent.routes.ts              # /agents CRUD
├── agent-publications.routes.ts # /agents/:id/publications
└── index.ts                     # Mount all sub-routers
```

**Barrel exports preserve the public API** — consumers still import from the same path.

## How to split (Python)

**Large module** → package with sub-modules:
```
# Before: services/user_service.py (450 lines)

# After:
services/
├── __init__.py              # from .user_service import UserService (re-export)
├── user_service.py          # Core CRUD
├── user_search.py           # Search operations
└── user_notifications.py    # Notification logic
```

**`__init__.py` re-exports** preserve the public API — callers still do `from services import UserService`.

## What does NOT count toward the limit

- **Comments and docstrings**: they don't add complexity, don't penalize documentation
- **Import blocks**: long import sections are a sign of coupling, but not a file-length problem
- **Type definitions**: if a types.ts is mostly type declarations, 400+ lines is acceptable

## What counts double

Some patterns are more complex per line and should be split earlier:

- **Deeply nested logic** (3+ levels of nesting): split at 250 lines
- **Files mixing concerns** (UI + data + validation in one file): split immediately regardless of length
- **Test files**: 400 lines is fine — tests are linear and self-contained, they don't compound complexity

## Anti-patterns

- **Don't split into files with 20 lines each** — splitting too aggressively creates navigation overhead. A 150-line file doesn't need splitting
- **Don't create a file per function** — group related functions together. The unit of splitting is a *concept*, not a function
- **Don't split if it creates circular dependencies** — if two split files need to import each other, they belong together
- **Don't count and optimize** — the 400-line limit is a guideline that triggers a conversation about splitting, not a hard linter rule. Use judgment
