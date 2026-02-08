# TypeScript — General Standards

> **Status**: seeded
> **Applies to**: Any TypeScript/Node.js project
> **Seeded from**: noopolis-site, mcp-service, mcp-server, mcp-query-service + stated preferences

## Project structure

- All source code lives under `src/`
- Config files at root (`tsconfig.json`, `.eslintrc*`, `.prettierrc*`, etc.)
- Tests co-located with source or in a top-level `tests/` directory
- Prisma schema in `prisma/` at root when using Prisma
- Environment files at root (`.env`, `.env.example`)

## Naming conventions

- **Files**: `kebab-case.ts` for utilities, services, routes. `PascalCase.tsx` for React components
- **Files with domain suffix**: `agent.service.ts`, `agent.logic.ts`, `agent.routes.ts` — makes layers immediately obvious
- **Folders**: lowercase for structural folders (`src/`, `lib/`, `services/`). PascalCase for component folders (`Card/`, `SiteHeader/`)
- **Variables and functions**: `camelCase`
- **Classes**: `PascalCase` with layer suffix (`AgentService`, `AgentLogic`)
- **Types**: `PascalCase` — use `type` over `interface` unless extending is the primary purpose
- **Constants**: `SCREAMING_SNAKE_CASE` for environment variables and true constants
- **Enums**: PascalCase name, PascalCase members (or use string unions instead)

## File patterns

- **Max file length**: 400 lines. See [universal/file-length.md](../universal/file-length.md) for splitting strategies and exceptions
- **One primary export per file**: a file should have one main purpose (one component, one service class, one set of related schemas)
- **Barrel exports**: use `index.ts` files to re-export from folders. This enables clean imports like `import { Card } from "@/layout"`
- **Co-located types**: put types in a `types.ts` file next to the code that uses them, not in a global `types/` folder. Export via barrel
- **Co-located tests**: `.test.ts` files live next to or near the code they test

## Import / export patterns

- **Named exports over default exports**: always use named exports for components, services, utilities. Default exports only for Next.js page routes (framework requirement)
- **Barrel re-exports**: `export * from "./Card"` in `index.ts` files. Every folder that groups related modules should have an `index.ts`
- **Path aliases**: use `@/` mapped to `src/` in `tsconfig.json`. Prefer `@/layout/Card` over `../../layout/Card`. For more specific aliases consider `@layout/`, `@components/`, `@lib/`
- **Import ordering**:
  1. Node.js/framework imports (`react`, `next`, `express`)
  2. Third-party libraries (`zod`, `prisma`, `ioredis`)
  3. Internal absolute imports (`@/services/...`, `@/lib/...`)
  4. Relative imports (`./utils`, `../types`)
  5. Type-only imports (`import type { }`)
- **Type-only imports**: use `import type { Foo }` when importing only types

## Tooling

- **TypeScript**: `strict: true` always. No exceptions
- **Linter**: ESLint (with framework-specific extends like `next/core-web-vitals`)
- **Formatter**: Prettier
- **Validation**: Zod for all runtime validation (API inputs, form data, env vars)
- **Test runner**: Vitest (frontend) or framework-appropriate runner
- **Package manager**: npm (consistent across repos)
- **Build**: `tsc` for backend services, Next.js build for frontend

## Error handling

- **Custom error class hierarchy**: base `ApiError` with subclasses (`ValidationError`, `NotFoundError`, `ConflictError`, `ForbiddenError`, `UnauthorizedError`, etc.)
- **Error classes carry HTTP status codes**: each error type maps to a specific status
- **Consistent error response format**: `{ error: string, message: string, details?: unknown }`
- **Throw early, catch centrally**: throw domain errors in logic/service layers, handle in a single error middleware or handler
- **Fail fast on startup**: validate all required environment variables at import time, `process.exit(1)` if missing

## Anti-patterns

- **No `any`** unless absolutely unavoidable (and document why)
- **No default exports** for components, services, or utilities
- **No barrel exports that re-export everything from deeply nested paths** — keep barrel exports flat and intentional
- **No implicit return types on public functions** — always annotate return types for public APIs
- **No scattered type definitions** — types live co-located with their domain, not in a global `types/` folder
