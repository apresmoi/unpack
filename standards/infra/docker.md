# Infrastructure — Docker Standards

> **Status**: seeded
> **Applies to**: Any project using Docker containers
> **Seeded from**: mcp-service, mcp-server, mcp-query-service

## Dockerfile patterns

### Multi-stage build (Node.js)

```dockerfile
# Stage 1: Install dependencies
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Build
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Runtime
FROM node:20-slim AS runtime
WORKDIR /app

# Non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy only what's needed
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
```

### Multi-stage build (Next.js)

```dockerfile
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

USER appuser
EXPOSE 3000
CMD ["node", "server.js"]
```

### Multi-stage build (Python)

```dockerfile
FROM python:3.11-slim AS base
WORKDIR /app
RUN pip install poetry && poetry config virtualenvs.in-project true

FROM base AS deps
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev --no-root

FROM python:3.11-slim AS runtime
WORKDIR /app
RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY --from=deps /app/.venv ./.venv
COPY src/ ./src/
ENV PATH="/app/.venv/bin:$PATH"

USER appuser
EXPOSE 8000
CMD ["python", "-m", "project_name.main"]
```

### Base image rules

- **`node:20-slim`** for Node.js — not `alpine` (native module compatibility), not full `node:20` (too large)
- **`python:3.11-slim`** for Python — same reasoning
- **Pin major version**, not specific patch: `node:20-slim` not `node:20.10.0-slim`
- **Never use `latest` tag** — builds must be reproducible

### Layer ordering (cache optimization)

Order Dockerfile commands from least-frequently-changed to most:

1. Base image + system packages
2. Package manager files (`package.json`, `pyproject.toml`)
3. Install dependencies (cacheable if lockfile unchanged)
4. Copy source code
5. Build step
6. Runtime configuration

**Key rule**: `COPY package.json package-lock.json ./` BEFORE `COPY . .` so dependency install is cached when only source changes.

## Non-root user

**Always run as non-root in production:**

```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
```

- Create the user BEFORE copying application files
- Switch to non-root AFTER all file operations that need root
- For Node.js, the built-in `node` user works too: `USER node`

## .dockerignore

```
node_modules
npm-debug.log*
.git
.gitignore
.env
.env.*
!.env.example
Dockerfile
docker-compose*.yml
.next
dist
coverage
.nyc_output
*.md
!README.md
.claude
.vscode
```

**Rules:**
- Always exclude `node_modules` (rebuilt inside container)
- Always exclude `.git` (not needed, large)
- Always exclude `.env` files (secrets don't belong in images)
- Exclude IDE/editor config

## Docker Compose (local development)

```yaml
version: "3.8"

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: app_dev
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  app:
    build:
      context: .
      target: deps  # Use deps stage for dev (faster rebuilds)
    volumes:
      - .:/app
      - /app/node_modules  # Anonymous volume to prevent overwrite
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://dev:dev@db:5432/app_dev
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis
    command: npm run dev

volumes:
  db-data:
```

**Rules:**
- Service names: `db`, `redis`, `app` — simple, lowercase
- Named volumes for persistent data (`db-data`)
- Anonymous volumes to prevent bind mount from overwriting `node_modules`
- `depends_on` for startup ordering (doesn't wait for readiness — use healthchecks if needed)
- Dev compose uses bind mounts for hot reload
- Single `docker-compose.yml` for local dev. Use `docker-compose.override.yml` for personal overrides

## HEALTHCHECK

```dockerfile
# HTTP health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# TCP check (for services without HTTP)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD nc -z localhost 5000 || exit 1
```

- Always include a HEALTHCHECK for production images
- Use the app's health endpoint when available
- 30s interval, 3s timeout, 3 retries is a reasonable default

## ENTRYPOINT vs CMD

- **CMD**: default command, can be overridden at runtime. Use for application entry:
  ```dockerfile
  CMD ["node", "dist/index.js"]
  ```
- **ENTRYPOINT**: fixed command, args appended at runtime. Use for container-as-executable:
  ```dockerfile
  ENTRYPOINT ["python", "-m", "project_name"]
  CMD ["serve"]  # default subcommand
  ```
- **Prefer CMD** for services. Use ENTRYPOINT only for CLI tools or when the container IS the command

## Security

- **Non-root user** — always (see above)
- **No secrets in images** — use runtime env vars or mounted secrets
- **Minimal packages** — don't install dev tools in runtime stage
- **No `COPY . .` before dependency install** — leaks secrets if `.dockerignore` is incomplete
- **Pin base images** to major version, not `latest`

## Anti-patterns

- **No `latest` tag** for base images — breaks reproducibility
- **No `npm install` in production** — use `npm ci` (respects lockfile exactly)
- **No single-stage Dockerfiles** for production — always multi-stage
- **No root user** in runtime containers
- **No secrets in build args** (`ARG SECRET=...`) — they're visible in image layers
- **No `apt-get install` without cleanup** — always `rm -rf /var/lib/apt/lists/*` in the same `RUN`
