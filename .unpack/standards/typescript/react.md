# TypeScript — React Standards

> **Status**: seeded
> **Applies to**: React applications (Vite, CRA, standalone, or within Next.js)
> **Depends on**: `typescript/general.md` for base TS conventions
> **Seeded from**: noopolis-site + stated preferences

## Project structure

- **`layout/`**: presentational/structural components — pure UI, no data fetching, no hooks that connect to external state. Examples: `Card`, `Stack`, `PageShell`, `SiteHeader`, `SiteFooter`
- **`components/`**: feature components that are connected — they use React Query hooks, context, global state, or contain business logic. Examples: `Governance/`, `Landing/`, `Analytics/`
- **`lib/`**: shared utilities, configs, integrations, DB clients
- **`services/`**: business logic (for full-stack apps with API routes)
- **`validators/`**: Zod schemas for runtime validation
- **`errors/`**: custom error classes and response helpers

## Component patterns

- **Functional components only** — no class components
- **One component per file** — the file name matches the component name: `Card.tsx` exports `Card`
- **PascalCase file and folder names** for all components: `Card/Card.tsx`, `SiteHeader/SiteHeader.tsx`
- **Simple components**: single file, no folder. `ThemeToggle.tsx` is fine if there are no related files
- **Complex components with sub-parts**: use a folder with barrel export:
  ```
  Modal/
  ├── Modal.tsx           # Main component
  ├── ModalHeader.tsx     # Sub-component
  ├── ModalBody.tsx       # Sub-component
  ├── ModalFooter.tsx     # Sub-component
  ├── types.ts            # Shared types
  └── index.ts            # export * from all parts
  ```
- **Props**: use `type` (not `interface`), defined right above the component, destructured in the function signature:
  ```tsx
  type CardProps = {
    children: ReactNode;
    className?: string;
  };

  export function Card({ children, className }: CardProps) { ... }
  ```
- **Always named exports** — never `export default` for components

## Compound components and composition

- **When a component has many nested sub-parts, use React Context** to avoid prop drilling:
  ```tsx
  // Modal context shares state between Modal, ModalHeader, ModalBody, etc.
  const ModalContext = createContext<ModalContextValue | null>(null);
  ```
- **Export all compound parts from the same barrel** so consumers import from one place:
  ```tsx
  import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/Modal";
  ```
- **Prefer composition over configuration** — pass children and sub-components rather than massive prop objects

## Hooks

- **Custom hooks**: `useXxx` naming, placed in a `hooks/` folder or co-located with the feature
- **Data fetching hooks**: `useXxx` pattern — one hook per API endpoint or data need. See [libraries/react-query.md](./libraries/react-query.md) for full query/mutation patterns
- **Extract to a custom hook** when: logic is reused, a component has more than 3-4 useState/useEffect calls, or the logic is independently testable
- **Dependency arrays**: always be explicit, never suppress the linter

## State management

- **Local state** (`useState`): default for component-specific UI state
- **URL state** (`useSearchParams`): for state that should survive navigation/refresh (filters, tabs, pagination)
- **React Context**: for state shared across a component tree (compound components, themes, auth). Avoid using Context as a global store
- **React Query**: for all server/async state. Never manually manage loading/error/data states for API calls
- **No Redux** unless the app genuinely has complex cross-cutting client state

## Types

- **Co-located types**: `types.ts` file per feature/component group, exported via barrel
- **Reuse types**: don't duplicate type definitions. If multiple components need the same shape, put it in the nearest shared `types.ts`

> **Prisma types**: See [libraries/prisma.md](./libraries/prisma.md) for Prisma-based generic types, DTO conventions, and `toResponse()` patterns.

## Styling

> **Tailwind CSS**: See [libraries/tailwind.md](./libraries/tailwind.md) for CSS variable design tokens, config patterns, conditional classes, and dark mode.

- **Utility-first**: Tailwind classes inline on elements — no component-scoped CSS files
- **Conditional classes**: use `cn()` utility — never string concatenation with ternaries
- **Responsive**: mobile-first (`sm:`, `md:`, `lg:` breakpoints)

## Centralization rule

- **All UI components must be centralized** — no random one-off component definitions buried in page files
- **First iteration**: it's OK to define inline on a page, but if a pattern appears twice or is non-trivial, extract to `layout/` or `components/`
- **Always check for existing components** before creating new ones — reuse and extend
- **Style guides are enforced via the standards** — components should follow the design token system and established patterns

## Event handling

- **Handler naming**: `handleXxx` for the function, `onXxx` for the prop:
  ```tsx
  function handleClick() { ... }
  <Button onClick={handleClick} />
  ```
- **Forms**: controlled components with Zod validation. Use React Hook Form for complex forms

## Testing

- **Vitest** + React Testing Library
- **Test behavior, not implementation**: test what the user sees and does, not internal state
- **Tests co-located** with components or in a `tests/` directory mirroring `src/`

## Anti-patterns

- **No prop drilling** through more than 2 levels — use Context or composition
- **No business logic in components** — extract to hooks or services
- **No inline styles** — use Tailwind classes
- **No random component definitions** — everything goes through the component system
- **No `useEffect` for derived state** — compute it directly
- **No manual loading/error/data state** for API calls — use React Query
