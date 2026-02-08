# Organization — Agent-Friendly Repo Patterns

> **Status**: seeded
> **Applies to**: Any project that will be developed with AI coding agents (Codex, Claude Code, etc.)
> **Seeded from**: Experience building the Unpack system and working with AI agents on noopolis + mcpverse

## Why this matters

AI coding agents navigate repos by reading files, searching for patterns, and following references. A repo optimized for agent consumption gets dramatically better results — fewer wrong turns, less context wasted on navigation, faster iterations. Every pattern here exists because the alternative actively slows agents down.

## Instruction files at root

- **`AGENTS.md`** at project root — comprehensive instructions for any AI agent (Codex, Cursor, etc.)
- **`CLAUDE.md`** pointing to AGENTS.md — Claude Code reads this automatically
- **`docs/index.md`** as the project table of contents — agents read this first to understand structure
- **Keep instructions in one place** — don't scatter agent rules across multiple files. Single source of truth

## File discoverability

- **Descriptive file names**: `agent.service.ts`, not `svc.ts`. Agents can't guess abbreviations
- **Domain suffix naming**: `agent.service.ts`, `agent.logic.ts`, `agent.routes.ts` — makes file purpose immediately obvious from the name alone
- **Barrel exports** (`index.ts` / `__init__.py`): agents search for imports. Clean barrel exports mean agents find the right module on the first try
- **Consistent naming patterns**: if agents know the domain is "agent" and the layer is "service", they can predict the file is `agent.service.ts`. Predictability eliminates search
- **Max 4 levels of nesting**: agents lose context navigating deep hierarchies. `src/components/Governance/ProposalCard/` is fine. `src/app/features/modules/governance/components/cards/ProposalCard/` is not

## File size and context windows

- **Max 400 lines per file** (see [universal/file-length.md](../universal/file-length.md)). Agents read entire files into context. Anything over 400 lines risks truncation, context overflow, or partial understanding
- **One concept per file**: a file should have one clear purpose. When an agent reads `agent.service.ts`, it should find agent service methods, not also cache helpers and type definitions
- **Split proactively**: if a file approaches 400 lines, split it before it becomes a problem. Don't wait for an agent to struggle

## Code patterns that help agents

### Named exports over default exports

```ts
// ✓ Agent can search for "AgentService" and find the definition + all usages
export class AgentService { ... }

// ✗ Agent finds "export default" but can't search for the imported name (it varies by file)
export default class AgentService { ... }
```

Named exports are searchable. Default exports get renamed on import, making cross-referencing harder.

### Explicit types on public APIs

```ts
// ✓ Agent reads the return type without tracing through the implementation
export async function getAgent(id: string): Promise<AgentResponse | null> { ... }

// ✗ Agent must read the entire function body to understand what it returns
export async function getAgent(id: string) { ... }
```

Agents read type signatures to understand contracts between modules. Inferred types force them to trace through implementations.

### Co-located types

Types next to the code that uses them, not in a global `types/` folder. When an agent reads a component, it should find its types in the same directory — not hunt through a separate type hierarchy.

### Co-located tests

`.test.ts` files next to source files. Agents read source + test together to understand behavior and edge cases.

### No magic strings or dynamic imports

```ts
// ✓ Agent can trace this import
import { AgentService } from "@/services/agent.service";

// ✗ Agent can't trace dynamic strings
const service = await import(`@/services/${name}.service`);
```

Dynamic imports and magic strings break the agent's ability to trace dependencies and understand code flow.

## Documentation as navigation

- **`docs/index.md`** is the map: links to all specs, phases, practices, and decisions. Agents read this first to orient themselves
- **Phase files** describe what to build and in what order — agents follow the phase sequence
- **ADRs** explain why decisions were made — agents read these to avoid contradicting past decisions
- **Spec files** with file-path references: when a spec mentions "the agent service", it should link to `src/services/agent.service.ts`. Agents follow these links
- **`docs/practices/`** contains coding standards loaded for the project — agents read these before writing code

## Configuration clarity

- **All config at root**: `tsconfig.json`, `pyproject.toml`, `.eslintrc*`, `Dockerfile` — standard locations that agents know where to find
- **`.env.example`** committed with every required variable documented: `DATABASE_URL=postgres://...` with a comment explaining the format. Agents read this to understand what the app needs
- **Single settings file**: `settings.ts` or `config.py` — all env var reads in one place. Agents look here to understand configuration, not scattered `process.env` calls
- **Clear scripts**: `package.json` scripts or `Makefile` targets with obvious names: `dev`, `build`, `test`, `lint`. Agents run these

## Testing patterns for agents

- **One command to test**: `npm test` or `poetry run pytest`. No multi-step setup
- **Test names describe behavior**: `test_raises_on_duplicate_email` tells the agent what the feature does. `test_case_3` tells it nothing
- **Fast test suite**: agents iterate by running tests after each change. A 30-second test suite means 30 seconds of wasted context per iteration. Keep unit tests under 10 seconds
- **Isolated tests**: no shared mutable state. Agents run tests in any order and must get consistent results

## What makes repos hard for agents

These patterns actively degrade agent performance:

- **Massive files (500+ lines)**: exceed context windows, force partial reads, lead to missed context
- **Implicit conventions**: "we always put auth checks here" — unless it's documented, agents don't know
- **Inconsistent patterns**: if half the services use classes and half use plain functions, agents can't predict the pattern for a new service
- **Build steps required before code makes sense**: generated code, code-gen'd types, transpiled outputs that must exist for imports to resolve
- **Circular dependencies**: agents trace import chains. Cycles create infinite loops in reasoning
- **Monolithic config files**: a 2000-line webpack config is worse than 5 focused config files
- **Scattered business logic**: logic in route handlers, middleware, utility functions, and services makes it impossible for agents to find "where does X happen"

## Anti-patterns

- **No abbreviations in file names** — `svc.ts`, `ctrl.ts`, `mgr.ts` force agents to guess
- **No god files** (1000+ lines) — split aggressively
- **No default exports** — they're unsearchable
- **No dynamic imports for application code** — only for code splitting in frameworks
- **No scattered env reads** — centralize in one settings file
- **No undocumented conventions** — if agents should follow a pattern, write it in `docs/practices/`
- **No complex build prerequisites** — if `npm run dev` doesn't work out of the box, agents will fail during setup
