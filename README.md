# my-first-worker

Cloudflare Worker API built with [Hono](https://hono.dev/docs) and [chanfana](https://chanfana.pages.dev/) (OpenAPI 3.1), D1 + Drizzle ORM.

## Get started

1. Install dependencies: `npm install`
2. Copy `.dev.vars.example` to `.dev.vars` and fill in the secrets
3. `wrangler login`
4. Apply migrations locally: `npm run migrate`
5. Seed master data + the first admin: `npm run seed`
6. `npx wrangler dev` — docs at `http://localhost:8787/`
7. `npx wrangler deploy` to publish

API docs (Swagger UI at `/`, ReDoc at `/redocs`, schema at `/openapi.json` and `/openapi.yaml`) are development-only. They are served when `ENVIRONMENT=development` (set in `.dev.vars`); on the deployed worker `ENVIRONMENT=production` makes those paths answer `{ "success": true }` for use as a health check.

The seeded admin NIP defaults to `198001012000011001` with the NIP as its password. Override with `ADMIN_NIP`, `ADMIN_NAMA`, and `ADMIN_PASSWORD` when running the seed script.

## Project structure

| Path | Purpose |
|------|---------|
| `src/index.ts` | App bootstrap: CORS, services, auth guard, error handlers, docs |
| `src/routes/index.ts` | Central route registration + admin role guard |
| `src/modules/<domain>/` | One folder per feature: `constants`, `domain`, `schema`, `repository`, `service`, `routes` |
| `src/shared/` | Cross-cutting code: container, auth, errors, http, config, time, types |
| `src/db/` | Drizzle schema, audit helpers, `BaseRepository`, DB factory |
| `drizzle/` | Generated SQL migrations + hand-written FTS5 migration |
| `scripts/seed.mjs` | Seeds bidang, pangkat golongan, and the first admin |

Modules: `pegawai` (the `users` table, plus auth), `bidang`, `pangkat-golongan`. All CRUD endpoints are admin-only; `/api/auth/login` and `/api/auth/logout` are public.

## Database

| Command | Purpose |
|---------|---------|
| `npx drizzle-kit generate` | Generate a migration after schema changes |
| `npm run migrate` | Apply migrations to the local D1 database |
| `npm run seed` | Seed master data + first admin locally |
| `npx wrangler d1 migrations apply my-first-worker-db --remote` | Apply migrations remotely |

Migrations are applied manually, never as part of `wrangler deploy`.

Timestamps: audit columns (`created_at`, `updated_at`, `deleted_at`) use epoch milliseconds; business/transaction dates use epoch seconds via `src/shared/time.ts`.

Search uses an FTS5 trigram index (`pegawai_fts`) and requires at least 3 characters. The FTS DDL lives in `drizzle/0001_pegawai_fts.sql` because drizzle-kit cannot generate virtual tables.

See `AGENTS.md` for the full conventions (audit columns, soft delete, transactions, search, auth, API shape).
