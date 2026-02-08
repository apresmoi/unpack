# TypeScript Library — Tailwind CSS

> **Status**: seeded
> **Applies to**: Any TypeScript/React project using Tailwind CSS
> **Depends on**: `typescript/general.md` for base TS conventions
> **Seeded from**: noopolis-site + stated preferences

## Design tokens as CSS variables

Define all design tokens as CSS variables in `globals.css`, then reference them in `tailwind.config.ts`. This enables theming (dark mode, multi-tenant) without changing Tailwind classes.

### globals.css

```css
:root {
  --app-bg: 246 248 255;
  --app-surface: 255 255 255;
  --app-ink: 11 16 32;
  --app-muted: 45 57 90;
  --app-border: 217 225 255;
  --app-accent: 79 70 229;
}

[data-theme="dark"] {
  --app-bg: 15 17 25;
  --app-surface: 24 26 36;
  --app-ink: 230 233 245;
  --app-muted: 160 168 195;
  --app-border: 45 50 72;
  --app-accent: 129 120 255;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --app-bg: 15 17 25;
    /* ... same dark values ... */
  }
}
```

**Token format**: space-separated RGB values (no `rgb()` wrapper) so Tailwind can add alpha values.

### tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "app-bg": "rgb(var(--app-bg) / <alpha-value>)",
        "app-surface": "rgb(var(--app-surface) / <alpha-value>)",
        "app-ink": "rgb(var(--app-ink) / <alpha-value>)",
        "app-muted": "rgb(var(--app-muted) / <alpha-value>)",
        "app-border": "rgb(var(--app-border) / <alpha-value>)",
        "app-accent": "rgb(var(--app-accent) / <alpha-value>)",
      },
      fontSize: {
        // Define with explicit line heights
        "heading-xl": ["2.5rem", { lineHeight: "1.2" }],
        "heading-lg": ["2rem", { lineHeight: "1.25" }],
        "heading-md": ["1.5rem", { lineHeight: "1.3" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body-md": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
      },
    },
  },
};

export default config;
```

## Usage in components

### Utility-first

Always use Tailwind utility classes directly on elements. No custom CSS files per component.

```tsx
export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-xl border border-app-border bg-app-surface p-6", className)}>
      {children}
    </div>
  );
}
```

### Conditional classes

Use a `classNames()` helper or `clsx`/`cn()` utility. Never use string concatenation with ternaries.

```tsx
// Helper function (define once in lib/utils.ts)
export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

// Usage
<button className={cn(
  "rounded-lg px-4 py-2 font-medium transition-colors",
  variant === "primary" && "bg-app-accent text-white",
  variant === "secondary" && "border border-app-border text-app-ink",
  disabled && "opacity-50 cursor-not-allowed",
)} />
```

### Responsive design

Mobile-first with `sm:`, `md:`, `lg:` breakpoints:

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} item={item} />)}
</div>
```

## Dark mode

Dark mode is handled entirely through CSS variable swaps — no conditional Tailwind dark: prefix classes needed.

- **CSS variables swap values** under `[data-theme="dark"]` selector
- **System preference fallback**: `prefers-color-scheme` media query for users who haven't explicitly chosen
- **SSR consistency**: store theme preference in a cookie, read server-side to prevent flash
- **Toggle component**: sets `data-theme` attribute on `<html>` and updates cookie

## Rules

- **No `@apply`** except in truly global base styles (`globals.css`). Keep utilities in JSX
- **No hardcoded colors or spacing** — always use design tokens
- **No custom CSS files per component** — Tailwind utilities only
- **No `style` prop** for things Tailwind can handle
- **Always pass `className` prop** on reusable components for override flexibility

## Anti-patterns

- **No string concatenation for conditional classes**: `className={"base " + (active ? "active" : "")}` → use `cn()`
- **No `@apply` in component-scoped CSS** — defeats the purpose of utility-first
- **No raw hex/rgb values in className** — add them as design tokens first
- **No `!important`** via Tailwind's `!` prefix — fix specificity issues properly
