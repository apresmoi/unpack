# TypeScript Library — Zod Validation

> **Status**: seeded
> **Applies to**: Any TypeScript project using Zod for runtime validation
> **Depends on**: `typescript/general.md` for base TS conventions
> **Seeded from**: mcp-service, mcp-server, mcp-query-service + stated preferences

## Core principle

**Zod validates all external input.** API request params, query strings, request bodies, form data, environment variables — anything that crosses a trust boundary gets a Zod schema.

## File organization

One validation file per domain, plus a shared base file:

```
src/validation/           # or src/validators/
├── agent.ts              # Agent-related schemas
├── auth.ts               # Auth-related schemas
├── chat-room.ts          # Chat room schemas
├── base.ts               # Shared schemas (pagination, common params)
└── index.ts              # Barrel export: export * from all files
```

**Rules:**
- File name matches the domain: `agent.ts` for agent schemas
- All schemas exported via barrel: `import { agentIdParamsSchema } from "@/validation"`
- Shared schemas (pagination, sorting, common query params) live in `base.ts`

## Schema naming

```ts
// Params schemas: <resource><Field>ParamsSchema
export const agentIdParamsSchema = z.object({
  agentId: z.string().uuid(),
});

// Query schemas: <resource>QuerySchema
export const agentsQuerySchema = z.object({
  page: z.preprocess(val => parseInt(z.string().parse(val), 10), z.number().int().positive()),
  pageSize: z.preprocess(val => parseInt(z.string().parse(val), 10), z.number().int().positive().max(50)),
  status: z.enum(["active", "inactive"]).optional(),
});

// Body schemas: <resource><Action>BodySchema
export const agentCreateBodySchema = z.object({
  displayName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

// Response schemas (if needed): <resource>ResponseSchema
export const agentResponseSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  createdAt: z.string().datetime(),
});
```

## Always `.safeParse()`, never `.parse()`

`.parse()` throws on failure, making error handling implicit. `.safeParse()` returns a result object, giving you explicit control:

```ts
// ✓ Correct: safeParse + explicit error handling
const result = agentIdParamsSchema.safeParse(req.params);
if (!result.success) {
  throw new ValidationError({
    errors: result.error.flatten().fieldErrors,
  });
}
// result.data is now typed and validated
const { agentId } = result.data;

// ✗ Wrong: parse throws implicitly
const { agentId } = agentIdParamsSchema.parse(req.params); // throws ZodError
```

## `.strict()` on param schemas

Use `.strict()` to reject unexpected fields in request params and bodies:

```ts
export const agentIdParamsSchema = z.object({
  agentId: z.string().uuid(),
}).strict();
```

This prevents clients from sending extra fields that might be silently ignored.

## Preprocess for query strings

Query string values are always strings. Use `z.preprocess()` to coerce types:

```ts
// Convert string → number for pagination
export const paginationSchema = z.object({
  page: z.preprocess(
    val => parseInt(z.string().parse(val), 10),
    z.number().int().positive()
  ),
  limit: z.preprocess(
    val => parseInt(z.string().parse(val), 10),
    z.number().int().positive().max(50)
  ),
});

// Convert string → boolean
export const filterSchema = z.object({
  includeInactive: z.preprocess(
    val => val === "true",
    z.boolean()
  ).optional(),
});
```

## Shared base schemas

Common patterns that are reused across domains:

```ts
// validation/base.ts
export const paginationSchema = z.object({
  page: z.preprocess(val => parseInt(z.string().parse(val), 10), z.number().int().positive()),
  pageSize: z.preprocess(val => parseInt(z.string().parse(val), 10), z.number().int().positive().max(50)),
});

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
}).strict();
```

Compose base schemas into domain schemas:

```ts
// validation/agent.ts
import { paginationSchema, sortSchema } from "./base";

export const agentsQuerySchema = paginationSchema.merge(sortSchema).extend({
  status: z.enum(["active", "inactive"]).optional(),
});
```

## Schema composition

```ts
// Extend a schema
const createSchema = z.object({ name: z.string(), email: z.string().email() });
const updateSchema = createSchema.partial(); // all fields optional

// Merge schemas
const fullQuerySchema = paginationSchema.merge(filterSchema);

// Pick/omit fields
const publicSchema = fullSchema.pick({ id: true, name: true });
const internalSchema = fullSchema.omit({ password: true });

// Refine with custom validation
const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine(data => data.startDate < data.endDate, {
  message: "startDate must be before endDate",
  path: ["endDate"],
});
```

## Infer types from schemas

Use `z.infer<>` to derive TypeScript types from Zod schemas:

```ts
export const agentCreateBodySchema = z.object({
  displayName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export type AgentCreateBody = z.infer<typeof agentCreateBodySchema>;
// { displayName: string; description?: string | undefined }
```

## Environment variable validation

```ts
// settings.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  PORT: z.preprocess(val => parseInt(String(val), 10), z.number().int().positive()).default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: z.string().min(32),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```

## Anti-patterns

- **No `.parse()` in route handlers** — always `.safeParse()` with explicit error handling
- **No inline schemas** in route handlers — define in validation files, import via barrel
- **No duplicated schemas** — compose from base schemas using `.merge()`, `.extend()`, `.partial()`
- **No `z.any()` or `z.unknown()` on input boundaries** — validate the shape explicitly
- **No validation in service layer** — validate once at the route boundary, services trust their inputs
