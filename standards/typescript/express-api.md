# TypeScript — Express API Standards

> **Status**: seeded
> **Applies to**: Express.js / Node.js backend APIs
> **Depends on**: `typescript/general.md` for base TS conventions
> **Seeded from**: mcp-service, mcp-server, mcp-query-service + stated preferences

## Project structure

```
src/
├── index.ts                # Entry point: create app, mount routes, start server
├── settings.ts             # Environment variables (validated at startup, fail fast)
├── errors.ts               # Centralized error handler middleware
├── responses.ts            # Response helper functions
├── routes/                 # Route definitions (thin controllers)
│   ├── agent.routes.ts
│   ├── chat-room.routes.ts
│   └── auth.routes.ts
├── logic/                  # Business logic / orchestration layer
│   ├── agent.logic.ts
│   ├── chat-room.logic.ts
│   └── auth.logic.ts
├── services/               # Data access layer (Prisma, external APIs)
│   ├── agent.service.ts
│   ├── chat-room.service.ts
│   └── auth.service.ts
├── validation/             # Zod schemas (one file per domain)
│   ├── agent.ts
│   ├── auth.ts
│   ├── base.ts             # Shared schemas (pagination, common params)
│   └── index.ts            # Barrel export
├── plugins/                # Infrastructure adapters
│   ├── db/
│   │   └── prisma.ts       # Prisma singleton client
│   ├── cache/
│   │   └── redis.ts        # Redis cache wrapper
│   └── pubsub/
│       └── redis.ts        # Redis pub/sub
├── middleware/              # Express middleware
│   ├── auth.middleware.ts
│   └── ...
└── test-utils/             # Test helpers, fixtures
```

## Three-layer architecture

The core architecture has three layers with clear responsibilities:

### Layer 1: Routes (thin controllers)

Routes handle HTTP concerns only — parsing, validation, response sending. No business logic.

```ts
const router = Router();

router.get('/:agentId', (async (req: Request, res: Response) => {
  const params = agentIdParamsSchema.safeParse(req.params);
  if (!params.success) throw new ValidationError({ errors: params.error.flatten().fieldErrors });

  const result = await AgentLogic.getAgent(params.data.agentId);
  sendSuccessResponse(res, result);
}) as RequestHandler);

export default router;
```

**Route responsibilities:**
- Parse request (params, query, body)
- Validate input with Zod (`.safeParse()`, throw `ValidationError` on failure)
- Call logic layer
- Send response with helper functions
- **Never contain business logic**

### Layer 2: Logic (business rules / orchestration)

The logic layer contains business rules, authorization, and orchestration of multiple services.

```ts
export class AgentLogic {
  private static agentService = new AgentService();

  static async getAgent(agentId: string): Promise<AgentResponse> {
    const agent = await this.agentService.getAgentById(agentId);
    if (!agent) throw new NotFoundError('Agent not found');
    return agent;
  }
}
```

**Logic layer pattern:**
- **Static class** with static methods (stateless orchestration)
- **Private static service instances** as class members
- Throws domain errors (`NotFoundError`, `ForbiddenError`, etc.)
- Orchestrates calls to multiple services when needed
- Contains authorization checks and business rule validation

### Layer 3: Services (data access)

Services handle database queries, external API calls, and data transformation.

```ts
export class AgentService {
  async getAgentById(id: string): Promise<AgentResponse | null> {
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent) return null;
    return AgentService.toResponse(agent);
  }

  static toResponse(agent: Agent): AgentResponse {
    return { id: agent.id, displayName: agent.displayName ?? agent.id, ... };
  }
}
```

**Service layer pattern:**
- **Instance-based classes** (may hold config or state)
- Returns `null` for not-found (logic layer decides whether to throw)
- `toResponse()` static methods transform Prisma models to DTOs
- Direct Prisma queries (no repository abstraction unless needed)

### When to add an intermediate layer

If logic becomes complex (multiple service calls, conditional branching, event emission), add named intermediate layers:
- **Managers**: for complex multi-service orchestration
- **Adapters**: for wrapping external APIs into internal interfaces
- **Processors**: for queue/event processing logic

## Routing

- **One route file per resource**: `agent.routes.ts`, `chat-room.routes.ts`
- **Express Router**: `const router = Router();` then `export default router;`
- **Mount in index.ts**: `app.use('/api/agents', agentRoutes);`
- **RESTful naming**: `/api/agents/:agentId`, `/api/agents/:agentId/publications/latest`
- **API versioning**: `/api/v1/` when multiple versions are needed
- **Health check**: always `GET /health` → `200 OK`

## Middleware

- **Global middleware stack** in `index.ts`:
  ```ts
  app.use(cors());
  app.use(express.json());
  // ... routes ...
  app.use(errorHandler);  // Error handler ALWAYS last
  ```
- **Auth middleware**: extracts identity from headers/tokens, attaches to `req`
- **Per-route middleware**: applied on specific routes, not globally
- **JSON parser**: can be global or per-route (`express.json()`)

## Validation

> **Zod**: See [libraries/zod.md](./libraries/zod.md) for schema naming, `.safeParse()` patterns, preprocess, composition, and file organization.

- **Zod validates all input**: request params, query strings, body payloads
- **In routes**: always `.safeParse()` → throw `ValidationError` on failure
- **File organization**: one validation file per domain + barrel export + shared base schemas

## Error handling

- **Custom error classes** in a shared package or `errors.ts`:
  - `ValidationError` → 422
  - `BadRequestError` → 400
  - `UnauthorizedError` → 401
  - `ForbiddenError` → 403
  - `NotFoundError` → 404
  - `ConflictError` → 409
  - `TooManyRequestsError` → 429
  - `InternalServerError` → 500
  - `ServiceUnavailableError` → 503
- **Centralized error middleware** as the last `app.use()`:
  ```ts
  export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
    if (error instanceof ValidationError) { res.status(422).json({ message: error.message }); return; }
    if (error instanceof NotFoundError) { res.status(404).json({ message: error.message }); return; }
    // ... etc
    res.status(500).json({ message: error.message });
  }
  ```
- **Consistent response format**: `{ message: string }` for errors

## Response helpers

```ts
export function sendSuccessResponse<T>(res: Response, data: T) {
  return res.status(200).json(data);
}

export function sendCreatedResponse<T>(res: Response, data: T) {
  return res.status(201).json(data);
}
```

## Database

> **Prisma**: See [libraries/prisma.md](./libraries/prisma.md) for singleton client, DTO patterns, type conventions, and migration workflow.

- **Client location**: `plugins/db/prisma.ts`
- **Access rule**: services layer only — routes and logic never import Prisma directly
- **DTOs via `toResponse()`** — never expose raw Prisma models to the API

## Infrastructure as plugins

- **`plugins/` folder** isolates infrastructure from business logic:
  - `plugins/db/prisma.ts` — database client
  - `plugins/cache/redis.ts` — typed cache wrapper with `get<T>`, `set<T>`, `del`
  - `plugins/pubsub/redis.ts` — pub/sub for real-time features
- **Cache wrapper pattern**:
  ```ts
  export const cache = {
    async get<T>(key: string): Promise<T | null> { ... },
    async set<T>(key: string, value: T, ttl?: number): Promise<void> { ... },
    async del(key: string): Promise<void> { ... },
  };
  ```

## Settings (environment)

- **Fail fast**: validate all env vars at startup, `process.exit(1)` if missing:
  ```ts
  const REDIS_URL = process.env.REDIS_URL as string;
  if (!REDIS_URL) { console.error("FATAL: REDIS_URL not defined"); process.exit(1); }
  export { REDIS_URL };
  ```
- **Single `settings.ts`** file — all env reads happen here, nowhere else

## Types and DTOs

> **Prisma types**: See [libraries/prisma.md](./libraries/prisma.md) for DTO naming conventions, `toResponse()` patterns, and generic types.

- **Shared types in a common package** (`mcp-common` pattern) for monorepos
- **Response DTOs**: PascalCase with `Response` suffix — `AgentResponse`, `MessageListItemResponse`
- **Payload DTOs**: PascalCase with `PayloadDTO` suffix — `AgentUpdatePayloadDTO`
- **Paginated responses**: generic `PaginatedResponse<T>` type

## Anti-patterns

- **No business logic in routes** — routes are thin controllers only
- **No Prisma imports in routes or logic** — services only
- **No hardcoded status codes scattered in routes** — use error classes and response helpers
- **No `try/catch` in routes for validation** — let Zod `.safeParse()` + error middleware handle it
- **No environment variable reads outside `settings.ts`**
