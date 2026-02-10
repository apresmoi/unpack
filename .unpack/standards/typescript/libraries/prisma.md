# TypeScript Library — Prisma

> **Status**: seeded
> **Applies to**: Any TypeScript project using Prisma ORM
> **Depends on**: `typescript/general.md` for base TS conventions
> **Seeded from**: noopolis-site, mcp-service, mcp-server, mcp-query-service + stated preferences

## Singleton client

Use a singleton pattern to prevent multiple Prisma Client instances during development hot reload:

```ts
// lib/db/prisma.ts (Next.js) or plugins/db/prisma.ts (Express)
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Location**:
- Next.js: `src/lib/db/prisma.ts`
- Express: `src/plugins/db/prisma.ts`

## Access rules

- **Services layer only**: only service classes import and use the Prisma client
- **Routes and logic layers NEVER import Prisma directly** — they call service methods
- This enforces separation of concerns: routes handle HTTP, logic handles rules, services handle data

```
routes/agent.routes.ts  →  logic/agent.logic.ts  →  services/agent.service.ts  →  prisma
         ✗ no prisma           ✗ no prisma              ✓ prisma queries
```

## DTO transformation

Services transform Prisma models to response DTOs using `toResponse()` static methods. Never expose raw Prisma models to the API.

```ts
export class AgentService {
  async getAgentById(id: string): Promise<AgentResponse | null> {
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent) return null;
    return AgentService.toResponse(agent);
  }

  static toResponse(agent: Agent): AgentResponse {
    return {
      id: agent.id,
      displayName: agent.displayName ?? agent.id,
      createdAt: agent.createdAt.toISOString(),
    };
  }
}
```

**Pattern rules:**
- `toResponse()` is a **static method** on the service class
- Returns `null` for not-found (the logic layer decides whether to throw)
- Transforms dates to ISO strings, omits internal fields, flattens relations

## Type conventions

### Response DTOs

PascalCase with `Response` suffix:

```ts
type AgentResponse = {
  id: string;
  displayName: string;
  createdAt: string;
};

type MessageListItemResponse = {
  id: string;
  content: string;
  agentId: string;
};
```

### Payload DTOs

PascalCase with `PayloadDTO` suffix for incoming data:

```ts
type AgentUpdatePayloadDTO = {
  displayName?: string;
  description?: string;
};
```

### Paginated responses

Use a generic wrapper:

```ts
type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};
```

### Prisma-based component types

When React components render data from Prisma models, base types on the Prisma-generated types using generics and `Pick`/`extends`:

```tsx
import type { Agent } from "@prisma/client";

type AgentCardProps<T extends Pick<Agent, "id" | "displayName"> = Agent> = {
  agent: T;
};

export function AgentCard<T extends Pick<Agent, "id" | "displayName">>({
  agent,
}: AgentCardProps<T>) {
  return <div>{agent.displayName}</div>;
}
```

This pattern:
- Works with both full Prisma models and partial DTOs
- Provides autocomplete for Prisma fields
- Defaults to the full model type when no generic is specified

## Schema and migrations

- **Schema location**: `prisma/schema.prisma` at project root
- **Migrations**: `prisma migrate dev` locally, `prisma migrate deploy` in production/CI
- **Progressive seeding**: numbered seed scripts for reproducible data states (`db:seed:1`, `db:seed:2`, etc.)
- **Never edit migration files** after they've been applied — create new migrations instead

## Anti-patterns

- **No Prisma imports in routes or logic** — services only
- **No raw Prisma models in API responses** — always use DTOs via `toResponse()`
- **No `prisma.$queryRaw` unless absolutely necessary** — use the Prisma query API
- **No business logic in `toResponse()`** — it's a pure data transformation
- **No multiple PrismaClient instances** — always use the singleton
