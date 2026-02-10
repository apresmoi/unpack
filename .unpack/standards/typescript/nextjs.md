# TypeScript — Next.js Standards

> **Status**: seeded
> **Applies to**: Next.js applications (App Router, v14+)
> **Depends on**: `typescript/general.md` for base TS conventions, `typescript/react.md` for component patterns
> **Seeded from**: noopolis-site + stated preferences

## Project structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/v1/             # API routes (versioned)
│   │   ├── auth/
│   │   ├── <resource>/     # One folder per resource
│   │   │   └── route.ts
│   │   └── ...
│   ├── <page>/             # Page routes
│   │   └── page.tsx
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles + CSS variables
├── components/             # Feature components (connected, with hooks/data)
│   ├── <Feature>/          # Grouped by feature domain
│   │   ├── <Component>/
│   │   ├── types.ts
│   │   └── index.ts        # Barrel export
│   └── ...
├── layout/                 # Presentational layout primitives
│   ├── Card/
│   ├── Stack/
│   ├── PageShell/
│   └── index.ts            # Barrel: export * from all layout components
├── lib/                    # Shared utilities and integrations
│   ├── db/                 # Prisma client singleton
│   ├── auth/
│   ├── config/
│   └── ...
├── services/               # Business logic (called from API routes)
├── validators/             # Zod schemas
├── errors/                 # Error classes + response helpers
└── middleware.ts            # Next.js middleware
```

## Routing

- **App Router** (not Pages Router) — all routes under `src/app/`
- **API routes versioned**: `app/api/v1/<resource>/route.ts`
- **One `route.ts` per resource**: exports `GET`, `POST`, `PUT`, `DELETE` as needed
- **Dynamic routes**: `[id]/route.ts` for parameterized endpoints
- **Layout files**: `layout.tsx` at each route group level for shared UI
- **Use `loading.tsx`** for streaming/suspense loading states
- **Use `error.tsx`** for error boundaries at the route level
- **Middleware**: `src/middleware.ts` for auth checks, redirects, headers

## Components (Server vs Client)

- **Server components are the default** — no directive needed. Use for:
  - Data fetching (async/await directly in component)
  - Database queries
  - Anything that doesn't need interactivity
- **Client components** marked with `"use client"` — use for:
  - Interactive UI (clicks, forms, animations)
  - Browser APIs
  - Hooks (useState, useEffect, useSearchParams)
- **Data flow pattern**: server component fetches data → passes as props to client component:
  ```tsx
  // ServerWrapper.tsx (no "use client")
  export async function ServerWrapper() {
    const data = await fetchData();
    return <ClientInteractive data={data} />;
  }
  ```
- **Never fetch data in client components when server components can do it** — push data fetching up to the server boundary

## Styling

> **Tailwind CSS**: See [libraries/tailwind.md](../libraries/tailwind.md) for CSS variable design tokens, config patterns, conditional classes, and dark mode.

- **Design tokens defined in `globals.css`** as CSS variables, referenced in `tailwind.config.ts`
- **Dark mode**: CSS variable swaps under `[data-theme="dark"]` + `prefers-color-scheme` fallback
- **Theme persistence**: cookie-based for SSR consistency (no flash of wrong theme)

## Data fetching

- **Server components**: direct `async/await` with `fetch()` or Prisma queries
- **`cache: "no-store"`** for data that must be fresh on every request
- **`export const dynamic = "force-dynamic"`** on pages that must not be statically generated
- **Client-side data** (when needed): React Query with `useXxx` hooks
- **Loading states**: `loading.tsx` files for route-level suspense, skeleton components for in-page loading

## State management

- **Server state**: handled by server components (no client state needed for fetched data)
- **URL state**: `useSearchParams` + `router.replace()` for filters, tabs, pagination — state survives refresh
- **Local UI state**: `useState` for toggles, modals, form inputs
- **Theme state**: cookie-based with server-side reading for SSR consistency
- **No global client state store** unless the app genuinely needs it

## API routes pattern

```tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // 1. Auth (if needed)
    const user = await requireAuth(request);

    // 2. Validate input
    const params = parseWithSchema(querySchema, Object.fromEntries(request.nextUrl.searchParams));

    // 3. Rate limit (if needed)
    const limit = await rateLimit(`rate:resource:${user.id}`, { limit: 10, windowSeconds: 60 });
    if (!limit.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

    // 4. Business logic (via service)
    const result = await someService.getData(params);

    // 5. Return response
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error); // Centralized error handling
  }
}
```

## Performance

- **`next/image`** for all images — automatic optimization, lazy loading
- **`next/font`** for font loading — no layout shift
- **Dynamic imports** (`next/dynamic`) for heavy client components
- **Prefer SSG/ISR** for pages that don't need per-request data
- **Use `Suspense` boundaries** for streaming partial page content

## Database

> **Prisma**: See [libraries/prisma.md](../libraries/prisma.md) for singleton client, DTO patterns, type conventions, and migration workflow.

- **Client location**: `src/lib/db/prisma.ts` (uses `globalThis` pattern to prevent hot-reload duplication)
- **Access rule**: services layer only — routes and server components never import Prisma directly

## Anti-patterns

- **No `"use client"` on components that don't need interactivity** — keep as server components
- **No data fetching in client components** when a server component can do it
- **No `getServerSideProps`** — that's Pages Router, use App Router patterns
- **No global CSS classes** for component styles — use Tailwind utilities
- **No hardcoded colors/spacing** — use design tokens
