# TypeScript Library — React Query (TanStack Query)

> **Status**: seeded
> **Applies to**: React/Next.js projects using TanStack Query for server state
> **Depends on**: `typescript/react.md` for component/hook patterns
> **Seeded from**: noopolis-site + stated preferences

## Core principle

**React Query owns all server/async state.** Never manually manage `loading`, `error`, `data` state for API calls. If data comes from a server, it goes through React Query.

## Hook naming

One custom hook per API endpoint or data need, following the `useXxx` pattern:

```tsx
// hooks/useAgent.ts
export function useAgent(agentId: string) {
  return useQuery({
    queryKey: ["agent", agentId],
    queryFn: () => fetchAgent(agentId),
    enabled: !!agentId,
  });
}

// hooks/useAgents.ts
export function useAgents(filters?: AgentFilters) {
  return useQuery({
    queryKey: ["agents", filters],
    queryFn: () => fetchAgents(filters),
  });
}
```

**Rules:**
- Hook name matches the data it fetches: `useAgent`, `useAgents`, `useRoomMessages`
- One hook per file, or group related hooks in a domain file (`hooks/useAgent.ts` has both `useAgent` and `useAgents`)
- Hooks live co-located with their feature or in a shared `hooks/` folder

## Query keys

Structured as arrays, from general to specific:

```ts
// Resource collection
queryKey: ["agents"]

// Single resource
queryKey: ["agent", agentId]

// Filtered collection
queryKey: ["agents", { status: "active", page: 2 }]

// Nested resource
queryKey: ["agent", agentId, "publications"]

// Nested resource with filter
queryKey: ["agent", agentId, "publications", { sort: "latest" }]
```

**Rules:**
- Always use arrays (not strings)
- First element is the resource name (singular or plural)
- IDs before filters
- Query keys determine cache identity — same key = same cache entry

## Query patterns

### Basic query

```tsx
export function useAgent(agentId: string) {
  return useQuery({
    queryKey: ["agent", agentId],
    queryFn: () => fetchAgent(agentId),
    enabled: !!agentId,
  });
}
```

### Paginated query

```tsx
export function useAgents(page: number, pageSize: number = 20) {
  return useQuery({
    queryKey: ["agents", { page, pageSize }],
    queryFn: () => fetchAgents({ page, pageSize }),
    placeholderData: keepPreviousData,
  });
}
```

### Dependent query

```tsx
export function useAgentPublications(agentId: string) {
  const { data: agent } = useAgent(agentId);

  return useQuery({
    queryKey: ["agent", agentId, "publications"],
    queryFn: () => fetchPublications(agent!.id),
    enabled: !!agent,
  });
}
```

## Mutations

```tsx
export function useUpdateAgent(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AgentUpdatePayloadDTO) =>
      updateAgent(agentId, payload),
    onSuccess: () => {
      // Invalidate the specific agent AND the list
      queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
```

**Mutation rules:**
- Invalidate related queries on success
- Invalidate both the specific resource AND any lists that include it
- Use optimistic updates only when the UX demands it (not by default)

## Cache invalidation

```tsx
const queryClient = useQueryClient();

// Invalidate a specific resource
queryClient.invalidateQueries({ queryKey: ["agent", agentId] });

// Invalidate all queries starting with "agents"
queryClient.invalidateQueries({ queryKey: ["agents"] });

// Invalidate everything for an agent (including nested resources)
queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
```

## Fetch functions

Keep fetch functions separate from hooks — they're plain async functions that return typed data:

```ts
// api/agents.ts
export async function fetchAgent(id: string): Promise<AgentResponse> {
  const res = await fetch(`/api/v1/agents/${id}`);
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}

export async function fetchAgents(filters?: AgentFilters): Promise<PaginatedResponse<AgentResponse>> {
  const params = new URLSearchParams(filters as Record<string, string>);
  const res = await fetch(`/api/v1/agents?${params}`);
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}
```

## When NOT to use React Query

- **Server components** (Next.js): fetch data directly with `async/await` — React Query is for client components only
- **Static data**: data that never changes (app config, feature flags loaded at build time) doesn't need React Query
- **Local UI state**: toggle states, form inputs, modals — use `useState`

## Anti-patterns

- **No manual `useState` for loading/error/data** — React Query handles these states
- **No `useEffect` to fetch data** — use `useQuery` instead
- **No caching logic outside React Query** — it has a built-in cache, don't add another layer
- **No fetch calls directly in components** — always wrap in a custom hook
- **No generic hook names** like `useFetchData` — name hooks after the data they return
