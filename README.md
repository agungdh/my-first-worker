# my-first-worker

Cloudflare Worker API built with [Hono](https://hono.dev/docs) and [chanfana](https://chanfana.pages.dev/) (OpenAPI 3.1), D1 + Drizzle ORM.

## Get started

1. Install dependencies: `npm install`
2. Copy `.dev.vars.example` to `.dev.vars` and fill in the secrets
3. `wrangler login`
4. Apply migrations locally: `npm run migrate`
5. `npx wrangler dev` — docs at `http://localhost:8787/`
6. `npx wrangler deploy` to publish

## Project structure

| Path | Purpose |
|------|---------|
| `src/index.ts` | App bootstrap: CORS, services, auth guard, error handlers, docs |
| `src/routes/index.ts` | Central route registration |
| `src/modules/<domain>/` | One folder per feature: `domain`, `schema`, `repository`, `service`, `routes` |
| `src/shared/` | Cross-cutting code: container, auth, errors, http, config, types |
| `src/db/` | Drizzle schema, audit helpers, `BaseRepository`, DB factory |
| `drizzle/` | Generated SQL migrations |

Currently the only module is `src/modules/user/` (register, login, logout).

## Database

| Command | Purpose |
|---------|---------|
| `npx drizzle-kit generate` | Generate a migration after schema changes |
| `npm run migrate` | Apply migrations to the local D1 database |
| `npx wrangler d1 migrations apply my-first-worker-db --remote` | Apply migrations remotely |

Migrations are applied manually, never as part of `wrangler deploy`.

See `AGENTS.md` for the full conventions (audit columns, soft delete, auth, API shape).
