# Payload CMS — deployment & architecture notes

Reference notes distilled from the official Payload docs and community guides,
plus the decisions we made for this project (Coolify + Docker + Postgres).
Keep this file up to date; it is the project's "context" for how/why things
are set up the way they are.

## TL;DR — are we doing it "by the book"?

Yes. Our setup matches the official Payload guidance:

| Topic | Official recommendation | What we do |
|-------|------------------------|------------|
| Build image | Multi-stage Dockerfile, Next.js `output: 'standalone'`, **pin pnpm version**, set file permissions, `NODE_ENV=production` | ✅ all of this (pnpm pinned to `10.33.0`, standalone enabled) |
| Schema in dev | Leave Drizzle `push` on; treat local DB as a sandbox | ✅ `push` defaults on (`PAYLOAD_DB_PUSH`), used only in dev |
| Schema in prod | Generate migrations with `migrate:create`, run them on deploy | ✅ committed `src/migrations`, run automatically on boot |
| Run migrations (long-running container) | `prodMigrations` adapter option — "ideal for long-running services" | ✅ `prodMigrations: migrations` in `payload.config.ts` |
| Secrets | `PAYLOAD_SECRET`, `DATABASE_URI` via env, nothing hardcoded | ✅ env-driven via Coolify magic vars |

## Database migrations (the important one)

Why this matters: in the **production** standalone build, Drizzle `push` is
**skipped** (`NODE_ENV=production`), so it never creates tables. Symptom if you
forget migrations: `error: relation "users" does not exist` (Postgres 42P01).

Official workflow (https://payloadcms.com/docs/database/migrations):

1. **Dev**: `push` auto-syncs schema to your local DB. Official doc: *"we suggest
   that you leave `push` as its default setting and treat your local dev
   database as a sandbox."*
2. **Create a migration** after schema changes:
   ```bash
   pnpm payload migrate:create
   ```
   Generates SQL under `src/migrations/` + updates `src/migrations/index.ts`.
   **Commit these files.**
3. **Run in production.** Two supported ways:
   - `pnpm payload migrate` as a deploy/CI step (needs the Payload CLI + full
     deps — not available in the slim standalone image), or
   - **`prodMigrations`** on the DB adapter — runs pending migrations at
     startup, *before* Payload finishes init. Official doc: *"This is ideal for
     long-running services where Payload will only be initialized at startup."*
     (The only caveat is serverless cold starts on e.g. Vercel — not our case.)

   We use **`prodMigrations`** because our Coolify container is a long-running
   server and the standalone image has no Payload CLI. See `src/payload.config.ts`.

> When you change collections/fields: run `pnpm payload migrate:create`, commit
> the new files, then redeploy. `prodMigrations` applies them on the next boot.

## Docker / Coolify

- Official production deploy docs: https://payloadcms.com/docs/production/deployment
- Common Docker fixes the guides call out (all applied here): **pin pnpm**,
  enable **standalone**, correct **file permissions**, `NODE_ENV=production`.
- Required env: `PAYLOAD_SECRET`, `DATABASE_URI`. We also set
  `PAYLOAD_PUBLIC_SERVER_URL` (clean public URL) and optionally `CORS_ORIGINS`.
- Coolify magic vars: `SERVICE_BASE64_64_PAYLOADSECRET` → secret,
  `SERVICE_USER/PASSWORD_POSTGRES` + `POSTGRES_DB` → `DATABASE_URI`,
  `SERVICE_URL_PAYLOAD` → public URL. The `*_3000` variants carry a `:3000`
  suffix; the domain is changed in the service's **Domains** field, not by
  editing the (locked) magic env vars.
- Object storage: for production uploads, the guides recommend a cloud storage
  adapter (S3/R2/etc.) instead of the local filesystem. Not set up yet — worth
  doing before the client uploads real media, since container storage is
  ephemeral.

## Multi-tenancy & access control

Plugin: `@payloadcms/plugin-multi-tenant`. Reference: the official example at
https://github.com/payloadcms/payload/tree/main/examples/multi-tenant and
https://payloadcms.com/docs/plugins/multi-tenant.

What the plugin does for us (config in `payload.config.ts`):
- Adds a `tenant` relationship field to `portfolio` and `media`.
- Adds a `tenants` array field to `users` (auto, `includeDefaultField` default).
- Shows a tenant selector in the admin and filters list views by tenant.
- `userHasAccessToAllTenants: (u) => u.isSuperAdmin` lets super-admins see all.

How our model maps to the example: the official example uses a `roles`
select (`super-admin`/`user` + tenant roles `tenant-admin`/`tenant-viewer`). We
use a simpler boolean `isSuperAdmin`. That is fine — but the example's
**access control is not optional**, and the starter we began from shipped none.

Access rules we enforce (verified with the Local API):
- **`users` collection** (`src/collections/Users.ts`): `create`/`delete` =
  super-admins only; `read`/`update` = self or super-admin.
- **`isSuperAdmin` field**: `update` allowed for super-admins only.
  > Verified: without this, a regular tenant user can promote themselves to
  > super-admin via `PATCH /api/users/:id`. With it, the field update is denied.
- **`portfolio` / `media`**: `read: () => true` so the decoupled frontend can
  read them publicly. Verified that public (no-user) reads still return tenant
  content. Writes go through the admin (authenticated).
- First user: create access returns false for anonymous requests, but Payload's
  **"create first user"** admin screen bypasses access — bootstrap there, and
  tick `isSuperAdmin` on that first account.

When adding more client-users later, consider tenant-scoped write access on
content collections (the plugin's `getTenantAccess` /
`@payloadcms/plugin-multi-tenant/utilities`) so a tenant user can't edit another
tenant's documents via the API.

## Login

- Everyone logs in at `/admin` with email + password (Payload auth on `users`).
- Super-admins see every tenant; regular users see only assigned tenants via the
  selector. There is no separate per-tenant login URL in this setup.

## Frontend architecture

Payload 3 installs **directly into a Next.js app**. Two patterns:

1. **Same app (Payload's headline feature, recommended for Next.js):** CMS and
   site in one Next.js project. Benefits: **Local API** (direct DB calls, no
   HTTP), **no CORS**, single deploy. Admin lives under a route group, isolated
   from your frontend routes.
   - https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app
2. **Decoupled (what `tatushkiii-nextjs` currently is):** separate frontend
   consuming Payload's **REST/GraphQL** APIs. Fully supported, but:
   - You must set **`CORS_ORIGINS`** on the CMS to the frontend's domain(s).
   - Deploys must be coordinated: deploy CMS (schema) **before** the frontend.

Decision: we're decoupled for now (separate repos). That's fine. If we ever want
the speed/simplicity of the Local API and no CORS, we could fold the public site
into this Payload app later.

## Sources

- Production Deployment — https://payloadcms.com/docs/production/deployment
- Database Migrations — https://payloadcms.com/docs/database/migrations
  (raw: https://github.com/payloadcms/payload/blob/main/docs/database/migrations.mdx)
- Payload 3.0 + Next.js — https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app
- The Ultimate Guide to Using Next.js with Payload — https://payloadcms.com/posts/blog/the-ultimate-guide-to-using-nextjs-with-payload
- Push → migrations (community) — https://www.buildwithmatija.com/blog/payloadcms-postgres-push-to-migrations
- Running Payload in Docker (community) — https://sliplane.io/blog/how-to-run-payload-cms-in-docker
- Installing Payload v3 on Coolify (community) — https://payloadcms.com/community-help/discord/installing-payloadcms-v3-on-coolify-with-dockerfile-guide
