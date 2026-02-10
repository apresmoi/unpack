# Organization — Folder Structure Standards

> **Status**: seeded
> **Applies to**: Any project (Node.js, Python, monorepo, etc.)
> **Seeded from**: noopolis-site, mcp-service, mcp-server, mcp-query-service + stated preferences

## Universal principles

- **Flat where possible, nested where meaningful**: don't create folders until there are 3+ related files. Don't nest beyond 4 levels
- **Group by domain/feature** for business code, **group by type** for infrastructure: `components/Governance/` (feature) but `plugins/cache/` (type)
- **Every folder with multiple exports gets an `index.ts`** barrel file
- **Naming**: lowercase for structural folders (`src/`, `lib/`, `routes/`), PascalCase for component folders (`Card/`, `SiteHeader/`)
- **Predictable names**: if you know the domain and the layer, you can guess the file name. `agent.service.ts`, `agent.logic.ts`, `agent.routes.ts`

## Root-level layout

```
project-root/
├── src/                    # All source code
├── prisma/                 # Database schema + migrations (if using Prisma)
├── public/                 # Static assets (frontend only)
├── tests/                  # Tests (if not co-located)
├── .unpack/                # Unpack framework (docs, skills, standards, prompts, tools)
│   ├── docs/               # Agent documentation system
│   ├── skills/             # Agent skills (deployed during init)
│   └── ...
├── AGENTS.md               # Agent instructions
├── CLAUDE.md               # Points to AGENTS.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts      # If using Tailwind
├── Dockerfile
├── docker-compose.yml
├── .env.example            # Template for required env vars (NEVER .env itself)
├── .eslintrc.*
├── .prettierrc
└── .gitignore
```

**Rules:**
- Config files live at root, not in `config/` folders
- `.env.example` is committed, `.env` is gitignored
- `README.md` only if truly needed — the Unpack docs system replaces most README content

## Next.js / React frontend

```
src/
├── app/                    # Next.js App Router (routes + pages)
│   ├── api/v1/             # API routes
│   ├── <page>/page.tsx     # Page routes
│   ├── layout.tsx
│   └── globals.css
├── layout/                 # Presentational layout primitives (pure UI)
│   ├── Card/
│   ├── Stack/
│   ├── PageShell/
│   └── index.ts            # Barrel export for all layout components
├── components/             # Feature components (connected, with data/hooks)
│   ├── <Feature>/          # Grouped by feature domain
│   │   ├── <Component>/
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── index.ts
│   └── ...
├── lib/                    # Utilities, integrations, clients
│   ├── db/
│   ├── auth/
│   └── config/
├── services/               # Business logic
├── validators/             # Zod schemas
├── errors/                 # Error classes + response helpers
└── middleware.ts
```

**Key distinction: `layout/` vs `components/`**
- `layout/`: purely presentational, no data fetching, no external state, no context consumers. Think: `Card`, `Stack`, `PageContainer`
- `components/`: connected to data, business logic, hooks, React Query, context. Think: `Governance/ProposalCard`, `Landing/LandingClient`

## Express API backend

```
src/
├── index.ts                # Entry: create app, mount routes, start server
├── settings.ts             # All env var reads (fail fast)
├── errors.ts               # Error handler middleware
├── responses.ts            # Response helpers
├── routes/                 # Thin controllers
│   └── <domain>.routes.ts
├── logic/                  # Business logic / orchestration
│   └── <domain>.logic.ts
├── services/               # Data access (Prisma, external APIs)
│   └── <domain>.service.ts
├── validation/             # Zod schemas
│   ├── <domain>.ts
│   ├── base.ts
│   └── index.ts
├── plugins/                # Infrastructure adapters
│   ├── db/prisma.ts
│   ├── cache/redis.ts
│   └── pubsub/redis.ts
├── middleware/              # Express middleware
└── test-utils/
```

**Layer correspondence**: `routes/<domain>.routes.ts` → `logic/<domain>.logic.ts` → `services/<domain>.service.ts`. Always 1:1 naming between layers.

## Python projects

```
project-root/
├── src/
│   └── <package_name>/     # Main package
│       ├── __init__.py
│       ├── main.py         # Entry point
│       ├── settings.py     # Config (env vars, fail fast)
│       ├── routes/         # API routes (FastAPI routers)
│       ├── services/       # Business logic
│       ├── models/         # Data models (Pydantic, SQLAlchemy)
│       └── utils/
├── tests/
│   ├── conftest.py
│   └── test_<module>.py
├── pyproject.toml
├── Dockerfile
└── .env.example
```

## Monorepo patterns

```
monorepo-root/
├── packages/
│   ├── common/             # Shared types, errors, utilities
│   ├── service/            # Backend service
│   ├── query-service/      # Read-optimized backend
│   ├── server/             # Protocol server
│   └── client/             # Frontend app
├── docker-compose.yml      # Orchestrates all services
├── package.json            # Workspace config
└── tsconfig.base.json      # Shared TS config
```

**Rules:**
- Shared code lives in a `common` or `shared` package
- Each package has its own `package.json`, `tsconfig.json`
- Local packages referenced as `"common": "file:../common"` in `package.json`
- Each service has its own Dockerfile

## Configuration files

- **Environment**: `.env.example` at root (committed), `.env` gitignored
- **CI/CD**: `.github/workflows/` or equivalent
- **Docker**: `Dockerfile` at root per service, `docker-compose.yml` at monorepo root
- **Linter/formatter**: at root (single config for the project/package)

## Anti-patterns

- **No `utils/` dumping ground** — if a utility is specific to a domain, put it in that domain's folder
- **No deeply nested folders** (5+ levels) — restructure or flatten
- **No `types/` global folder** — co-locate types with their domain
- **No `helpers/` folder** — name things by what they do, not that they "help"
- **No duplicate folder names at different levels** — e.g., don't have both `src/components/utils/` and `src/utils/`
