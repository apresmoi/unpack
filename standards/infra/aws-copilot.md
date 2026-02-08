# Infrastructure — AWS Copilot Standards

> **Status**: seeded
> **Applies to**: Projects deployed with AWS Copilot (ECS Fargate)
> **Seeded from**: mcpverse/copilot, noopolis/copilot

## Directory structure

```
copilot/
├── .workspace                      # Application name (auto-generated)
├── environments/
│   ├── prod/
│   │   └── manifest.yml            # Environment config (VPC, CDN, observability)
│   ├── addons/                     # Shared infrastructure (DB, Redis)
│   │   ├── <app>-db.yml            # Aurora Serverless v2
│   │   ├── <app>-redis.yml         # ElastiCache Redis
│   │   └── addons.parameters.yml   # Parameter bindings for addons
│   └── overrides/                  # CloudFormation patches
│       └── cfn.patches.yml
├── services/
│   ├── site/
│   │   └── manifest.yml            # Load Balanced Web Service (Next.js)
│   ├── server/
│   │   ├── manifest.yml            # Load Balanced Web Service (API gateway)
│   │   └── overrides/
│   │       └── cfn.patches.yml     # Service-specific CFN patches
│   ├── service/
│   │   └── manifest.yml            # Backend Service (internal API)
│   ├── query-service/
│   │   └── manifest.yml            # Load Balanced Web Service (public read API)
│   ├── worker-light/
│   │   └── manifest.yml            # Worker Service
│   └── worker-heavy/
│       └── manifest.yml            # Worker Service
├── jobs/
│   └── <job-name>/
│       └── manifest.yml            # Scheduled Job
└── AGENTS.md                       # Deployment ops instructions (optional)
```

## Service types and sizing

### Load Balanced Web Service

Public-facing services behind an ALB. Use for Next.js sites, API gateways, public APIs.

```yaml
name: site
type: Load Balanced Web Service

image:
  build: Dockerfile
  port: 3000

http:
  path: "/"
  healthcheck: /api/health
  alias:
    - example.com
    - www.example.com

cpu: 512
memory: 1024
platform: linux/x86_64
count: 1
```

**Sizing guidelines:**
| Service type | CPU | Memory | Notes |
|-------------|-----|--------|-------|
| Next.js site | 512 | 1024 | Sufficient for SSR |
| API gateway (SSE) | 1024 | 2048 | Needs more for long-lived connections |
| Public API | 512 | 1024 | Standard CRUD |
| Internal API | 512 | 1024 | Service Connect |

### Backend Service

Internal services accessible only within the VPC via Service Connect. Use for internal APIs that other services call.

```yaml
name: service
type: Backend Service

image:
  build: Dockerfile
  port: 5000

cpu: 512
memory: 1024
count: 1

network:
  connect: true  # Enable Service Connect
```

### Worker Service

Background processors consuming from SQS or running event loops. Use for async processing, event handlers, data pipelines.

```yaml
name: worker-light
type: Worker Service

image:
  build: Dockerfile

cpu: 512
memory: 1024
count: 1
```

**Split workers by weight**: separate CPU-intensive work (message processing, AI calls) from light work (metrics, notifications) into different services for independent scaling.

### Scheduled Job

Periodic tasks. Use for hourly aggregations, daily reports, cleanup jobs.

```yaml
name: impact
type: Scheduled Job

image:
  build: Dockerfile

on:
  schedule: "@hourly"

cpu: 256
memory: 512
```

## Environment configuration

```yaml
# environments/prod/manifest.yml
name: prod
type: Environment

cdn: true

network:
  vpc:
    cidr: 10.0.0.0/16
    subnets:
      public:
        - cidr: 10.0.0.0/24, az: us-east-2a
        - cidr: 10.0.1.0/24, az: us-east-2b
        - cidr: 10.0.10.0/24, az: us-east-2c
      private:
        - cidr: 10.0.2.0/24, az: us-east-2a
        - cidr: 10.0.3.0/24, az: us-east-2b
        - cidr: 10.0.20.0/24, az: us-east-2c

observability:
  container_insights: false  # Enable in production when needed
```

**Rules:**
- 3 public + 3 private subnets across 3 AZs
- CDN enabled for public-facing environments
- Container insights off by default (cost), enable for debugging

## Addons (shared infrastructure)

### Aurora Serverless v2 (PostgreSQL)

```yaml
# environments/addons/<app>-db.yml
Parameters:
  App: { Type: String }
  Env: { Type: String }

Resources:
  DBCluster:
    Type: AWS::RDS::DBCluster
    Properties:
      Engine: aurora-postgresql
      EngineVersion: "16.2"
      DatabaseName: !Sub "${App}_db"
      ServerlessV2ScalingConfiguration:
        MinCapacity: 0.5
        MaxCapacity: 8
      # ... security groups, subnet groups
```

**Pattern:**
- Aurora Serverless v2 with 0.5–8 ACU scaling
- Auto-generated credentials via Secrets Manager
- Export `DatabaseURL` for services to consume via `from_cfn`

### ElastiCache Redis

```yaml
# environments/addons/<app>-redis.yml
Resources:
  RedisCluster:
    Type: AWS::ElastiCache::CacheCluster
    Properties:
      Engine: redis
      EngineVersion: "7.1"
      CacheNodeType: cache.t4g.small
      NumCacheNodes: 1
```

**Pattern:**
- Single-node `cache.t4g.small` for non-HA workloads
- Separate clusters for cache vs pub/sub when needed (different eviction policies)
- Export endpoint as `host:port` string for `REDIS_URL`

### Parameter bindings

```yaml
# environments/addons/addons.parameters.yml
Parameters:
  dbURI: !GetAtt DBCluster.Endpoint
  redisCacheEndpoint: !Sub "${RedisCluster.RedisEndpoint.Address}:${RedisCluster.RedisEndpoint.Port}"
```

## Variable and secret patterns

### Environment variables (in manifests)

```yaml
variables:
  PORT: 3000
  LOG_LEVEL: info
  NODE_ENV: production
  # Reference other services
  SERVICE_URL: !Sub "http://service.${COPILOT_ENVIRONMENT_NAME}.${COPILOT_APPLICATION_NAME}.local:5000"
  # Reference addons via CloudFormation exports
  DATABASE_URL:
    from_cfn: !Sub "${COPILOT_APPLICATION_NAME}-${COPILOT_ENVIRONMENT_NAME}-dbURI"
  REDIS_URL:
    from_cfn: !Sub "${COPILOT_APPLICATION_NAME}-${COPILOT_ENVIRONMENT_NAME}-redisCacheEndpoint"
```

### Secrets (from SSM Parameter Store)

```yaml
secrets:
  JWT_SECRET: /copilot/${COPILOT_APPLICATION_NAME}/${COPILOT_ENVIRONMENT_NAME}/secrets/JWT_SECRET
  GITHUB_TOKEN: /copilot/${COPILOT_APPLICATION_NAME}/${COPILOT_ENVIRONMENT_NAME}/secrets/GITHUB_TOKEN
```

**Rules:**
- Environment variables for non-sensitive config (ports, log levels, feature flags)
- `from_cfn` for infrastructure references (DB URLs, Redis endpoints)
- SSM Parameter Store for secrets (API keys, tokens, credentials)
- Never hardcode secrets in manifests

## CloudFormation overrides

Use `cfn.patches.yml` for customizations Copilot doesn't natively support:

**ALB session stickiness** (for SSE/WebSocket):
```yaml
# services/server/overrides/cfn.patches.yml
- op: add
  path: /Resources/TargetGroup/Properties/TargetGroupAttributes/-
  value:
    Key: stickiness.enabled
    Value: "true"
- op: add
  path: /Resources/TargetGroup/Properties/TargetGroupAttributes/-
  value:
    Key: stickiness.app_cookie.cookie_name
    Value: "session-id"
```

**ALB idle timeout** (for long-lived connections):
```yaml
- op: replace
  path: /Resources/PublicLoadBalancer/Properties/LoadBalancerAttributes/0/Value
  value: "300"
```

## CloudFront CDN

For sophisticated caching, use environment-level overrides:

- **Static assets** (`/_next/static/*`): long TTL (1h+), gzip/brotli
- **Image optimization** (`/_next/image*`): 1-day default, vary by Accept + query params
- **API routes with caching** (`/api/v1/public/*`): 1h TTL, no cookies
- **API routes without caching** (`/api/auth/*`, SSE streams): disabled
- **Default HTML**: short TTL (5min), strip Set-Cookie for CDN caching

## Deployment workflow

```bash
# Initial setup
copilot app init <app-name>
copilot env init --name prod
copilot env deploy --name prod

# Deploy addons (after creating addon YAMLs)
copilot env deploy --name prod

# Deploy services
copilot svc deploy --name site --env prod
copilot svc deploy --name server --env prod

# Deploy jobs
copilot job deploy --name impact --env prod

# Store secrets
aws ssm put-parameter \
  --name "/copilot/<app>/<env>/secrets/JWT_SECRET" \
  --type SecureString \
  --value "your-secret"
```

## Health checks

- **Load Balanced Web Services**: always define `http.healthcheck` path
- **Backend Services**: health check via Service Connect
- **Workers/Jobs**: no HTTP health check (ECS task health)
- **Common pattern**: `GET /health` → `200 OK` or `GET /api/health` for Next.js

## Anti-patterns

- **No secrets in manifest files** — use SSM Parameter Store
- **No hardcoded resource ARNs** — use `from_cfn` and CloudFormation references
- **No manual AWS Console changes** — everything in code (manifests + overrides)
- **No shared workers** processing unrelated domains — split by weight/domain
- **No over-provisioning** — start small (0.5 ACU, t4g.small), scale up based on metrics
- **No public Backend Services** — they should only be accessible via Service Connect
