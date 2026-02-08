# Standards Library — Index

This is the catalog of all available coding standards and best practices. When initializing a new project (`/up-init`), select the standards that match your stack. They'll be copied into the project's `docs/practices/` folder.

## How to populate

Standards start as **skeletons** (section headers + TODO placeholders). To fill them in:

1. Point `/up-extract-standards` at an example repo you like
2. Review and confirm the extracted patterns
3. Update the status from `skeleton` → `seeded` → `confirmed`

## Available standards

### Universal

| File | Scope | Status |
|------|-------|--------|
| [universal/file-length.md](./universal/file-length.md) | Max 400 lines per file, splitting strategies — applies to all languages | seeded |

### TypeScript — Frameworks

| File | Scope | Status |
|------|-------|--------|
| [typescript/general.md](./typescript/general.md) | Naming, exports, file patterns, imports, tooling — applies to all TS projects | seeded |
| [typescript/react.md](./typescript/react.md) | React components, hooks, state, compound patterns, composition | seeded |
| [typescript/nextjs.md](./typescript/nextjs.md) | Next.js App Router, server/client components, data fetching, SSR/SSG | seeded |
| [typescript/express-api.md](./typescript/express-api.md) | Express 3-layer architecture, routing, middleware, error handling | seeded |

### TypeScript — Libraries

| File | Scope | Status |
|------|-------|--------|
| [typescript/libraries/prisma.md](./typescript/libraries/prisma.md) | Prisma singleton, DTOs, toResponse(), generic types, migrations | seeded |
| [typescript/libraries/tailwind.md](./typescript/libraries/tailwind.md) | CSS variable design tokens, config, conditional classes, dark mode | seeded |
| [typescript/libraries/react-query.md](./typescript/libraries/react-query.md) | Query hooks, mutations, cache keys, invalidation patterns | seeded |
| [typescript/libraries/zod.md](./typescript/libraries/zod.md) | Schema naming, safeParse, preprocess, composition, validation files | seeded |

### Python

| File | Scope | Status |
|------|-------|--------|
| [python/general.md](./python/general.md) | Project structure, typing, tooling (ruff, mypy, poetry, pytest), async | seeded |

### Infrastructure

| File | Scope | Status |
|------|-------|--------|
| [infra/aws-copilot.md](./infra/aws-copilot.md) | Copilot manifests, service types, addons, environments, deployment | seeded |
| [infra/docker.md](./infra/docker.md) | Multi-stage builds, non-root user, .dockerignore, Compose, security | seeded |

### Organization

| File | Scope | Status |
|------|-------|--------|
| [organization/folder-structure.md](./organization/folder-structure.md) | Universal folder organization for Node, Python, monorepos | seeded |
| [organization/agent-friendly.md](./organization/agent-friendly.md) | Patterns that make repos easy for AI agents to navigate | seeded |

## Adding new standards

1. Create a new `.md` file under the appropriate category folder
2. Use the same skeleton format (Status, Applies to, Seed from, then categorized sections)
3. Add an entry to this index
4. Use `/up-extract-standards` to populate from an example repo
