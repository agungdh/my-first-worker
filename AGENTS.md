# Cloudflare Workers

STOP. Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.

## Docs

- https://developers.cloudflare.com/workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`

For all limits and quotas, retrieve from the product's `/platform/limits/` page. eg. `/workers/platform/limits`

## Commands

| Command | Purpose |
|---------|---------|
| `npx wrangler dev` | Local development |
| `npx wrangler deploy` | Deploy to Cloudflare |
| `npx wrangler types` | Generate TypeScript types |

Run `wrangler types` after changing bindings in wrangler.jsonc.

## Project structure

Code is organized per feature module under `src/modules/<domain>/`:

| File | Purpose |
|------|---------|
| `<domain>.domain.ts` | Domain types (no DB/audit fields) |
| `<domain>.schema.ts` | Zod/OpenAPI request & response schemas |
| `<domain>.repository.ts` | Drizzle data access; extends `BaseRepository` |
| `<domain>.service.ts` | Business rules; throws chanfana exceptions |
| `<domain>.routes.ts` | Chanfana endpoints + route registration |

Shared code (container, errors, http, types) lives in `src/shared/`, DB plumbing in `src/db/`. A new domain is a new folder in `src/modules/`, wired through `src/routes/index.ts` and `src/shared/container.ts`.

## Database (D1 + Drizzle)

Schema lives in `src/db/schema.ts`, migrations in `drizzle/`.

| Command | Purpose |
|---------|---------|
| `npx drizzle-kit generate` | Generate a migration after schema changes |
| `npm run migrate` | Apply migrations locally (`wrangler d1 migrations apply my-first-worker-db --local`) |
| `npx wrangler d1 migrations apply my-first-worker-db --remote` | Apply migrations remotely |

Migrations are applied manually, not as part of `wrangler deploy`.

### Audit columns

Every table MUST include the shared audit columns by spreading `...auditColumns` from `src/db/audit.ts`:

| Column | Type | Meaning |
|--------|------|---------|
| `created_at` | integer NULL | epoch milliseconds |
| `updated_at` | integer NULL | epoch milliseconds |
| `deleted_at` | integer NULL | epoch milliseconds; soft-delete marker |
| `created_by` | integer NULL | user id |
| `updated_by` | integer NULL | user id |
| `deleted_by` | integer NULL | user id |

Rules:

- All audit columns are nullable and have no database default. Values are written pre-persist by the application through `auditCreate()` / `auditUpdate()` / `auditDelete()`.
- Timestamps are epoch milliseconds (`Date.now()`), never ISO strings or SQLite datetime text.
- `*_by` are nullable integers, the same type as the user id. There is no auth yet, so they are written as `null`, but always go through the audit helpers so a real actor can be wired in one place later.
- Audit columns are internal only. Never add them to domain types (`src/modules/*/*.domain.ts`), Zod/OpenAPI schemas (`src/modules/*/*.schema.ts`), endpoint payloads, or API responses. Repositories map DB rows to domain objects and must drop audit fields.
- Deletes are soft: set `deleted_at` / `deleted_by` instead of removing rows. Repositories extend `BaseRepository` (`src/db/baseRepository.ts`) and every read (list, get, update target) MUST filter through `liveWhere(...)`, which adds `isNull(table.deletedAt)`.
- Unique constraints MUST be partial unique indexes scoped to live rows and case-insensitive: `uniqueIndex("...").on(sql`lower(${table.column})`).where(sql`${table.deletedAt} IS NULL`)`. Never use `.unique()` on a column, otherwise a soft-deleted row keeps blocking reuse of that value.
- Queries that filter by a unique text column (get, update, delete target) MUST compare with `lower(column)` too (e.g. `eq(sql`lower(${table.slug})`, value.toLowerCase())`). Otherwise a row stored with different casing won't match the uniqueness semantics of the index.

## Authentication

Credentials live on the `users` table (`username`, `name`, `password_hash`). Auth endpoints are in `src/modules/user/user.routes.ts`:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/register` | Create a user, hash the password, and set the auth cookie |
| `POST /api/auth/login` | Verify credentials and set the auth cookie |
| `POST /api/auth/logout` | Clear the auth cookie |

Rules:

- Passwords are hashed with PBKDF2-SHA256 (100k iterations, random salt) via `src/modules/user/user.password.ts`. The stored format is `pbkdf2_sha256$<iterations>$<salt>$<hash>` so the iteration count can be raised later.
- `password_hash` is internal only. It never appears in domain types, Zod/OpenAPI schemas, or API responses.
- Usernames are unique case-insensitively (partial unique index on `lower(username)` where `deleted_at IS NULL`) and all lookups compare with `lower(username)`.
- JWT helpers (`src/shared/auth.ts`) sign HS256 tokens with `JWT_SECRET` and a 7 day expiry, stored in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie named `access_token`. Read the identity from that cookie instead of accepting tokens from headers.
- The token carries the full user identity (`id` as `sub`, `username`, `name`). Route handlers get the current user from `c.get("user")` with no extra request, so **never** add a `/me` endpoint or a per-request user lookup: the frontend decodes/keeps the identity from login/register or the JWT payload.
- `JWT_SECRET` is an environment secret. Set it locally in `.dev.vars` and remotely with `wrangler secret put JWT_SECRET`. Never commit the real value.
- Protection is default-deny: `src/index.ts` wires `app.use("*", requireAuth)`, so every route requires auth unless listed in `publicRoutes` (`src/shared/auth.ts`) as `"METHOD /path"`. Currently public: register, login, logout, and the docs routes (`/`, `/redocs`, `/openapi.json`, `/openapi.yaml`). New public endpoints MUST be added there explicitly.
- The guard verifies the cookie signature only (no DB query), sets `c.get("user")` from the token claims, and returns 401 otherwise. Route handlers read the identity from that context variable instead of verifying tokens themselves. Consequence: profile changes are not reflected until the user logs in again, and a soft-deleted user keeps access until the token expires.
- The guard returns a 401 JSON response directly instead of throwing chanfana's `UnauthorizedException`: `ApiException` is not a Hono `HTTPException`, so in middleware it would surface as a 500 through `app.onError`.
- Chanfana drops headers set via `c.header()` when `handle()` returns a plain object. Any route that sets or clears a cookie MUST return `c.json(...)` so the `Set-Cookie` header survives.

## Local Explorer (Debugging & Inspection)

When running `npx wrangler dev`, a Local Explorer API is available for inspecting and debugging local Workers, bindings, and storage state. The API base URL is printed in the terminal when the dev server starts.

Key endpoints (relative to the dev server URL):

| Endpoint | Description |
|----------|-------------|
| `GET /cdn-cgi/local/explorer/api/local/workers` | List local Workers and their bindings |
| `GET /cdn-cgi/local/explorer/api/storage/kv/namespaces` | List KV namespaces |
| `GET /cdn-cgi/local/explorer/api/d1/database` | List D1 databases |
| `GET /cdn-cgi/local/explorer/api/r2/buckets` | List R2 buckets |
| `GET /cdn-cgi/local/explorer/api/workers/durable_objects/namespaces` | List Durable Object namespaces |
| `GET /cdn-cgi/local/explorer/api/workflows` | List Workflows |
| `POST /cdn-cgi/local/explorer/api/local/observability/query` | Run a read-only SQL query (SELECT/WITH only) over captured request traces and console logs. Tables: `spans`, `logs` (read attributes via `json(attributes)`). Example: `curl -X POST <base>/cdn-cgi/local/explorer/api/local/observability/query -H 'Content-Type: application/json' -d '{"sql":"SELECT service, name, outcome, duration_ms FROM spans WHERE parent_id IS NULL LIMIT 20"}'` |
| `POST /cdn-cgi/local/explorer/api/local/observability/clear` | Clear all captured traces and logs |

If the routes above don't cover what you need, fetch the full OpenAPI schema (large - use only as a last resort): `GET /cdn-cgi/local/explorer/api`

Use the Local Explorer to debug issues by inspecting storage state (KV keys, D1 rows, R2 objects, DO storage), viewing Worker bindings, and querying request traces and logs captured during the dev session.

## Node.js Compatibility

https://developers.cloudflare.com/workers/runtime-apis/nodejs/

## Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from `/workers/platform/limits/`
- **All errors**: https://developers.cloudflare.com/workers/observability/errors/

## Product Docs

Retrieve API references and limits from:
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`

## Best Practices (conditional)

If the application uses Durable Objects or Workflows, refer to the relevant best practices:

- Durable Objects: https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/
- Workflows: https://developers.cloudflare.com/workflows/build/rules-of-workflows/
