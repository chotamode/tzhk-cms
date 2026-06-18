# tzhk-cms

Multi-tenant [Payload](https://payloadcms.com) CMS (MIT) — one instance manages
N isolated projects/clients. Built on Payload 3 + Next.js + PostgreSQL.

## What's configured

- **Postgres** database adapter.
- **Localization**: `en`, `cs`, `ru` (per-field translations).
- **Multi-tenancy** via `@payloadcms/plugin-multi-tenant`:
  - `Tenants` collection — one row per project/client.
  - `Users.isSuperAdmin` — super-admins manage every tenant; regular users
    only see the tenants assigned to them (`tenants` array, added by the plugin).
  - Tenant-scoped collections: `portfolio`, `media`.
- Production `Dockerfile` (Next.js standalone output) — deploys on Coolify.

## Local development

```bash
cp .env.example .env          # set PAYLOAD_SECRET, DATABASE_URI
docker compose up             # Postgres + the app on http://localhost:3000
```

Open `http://localhost:3000/admin` and create the first admin user. Tick
**isSuperAdmin** on it so you can see all tenants, then create a Tenant.

## Useful scripts

```bash
pnpm dev                 # local dev server
pnpm build               # production build (what the Dockerfile runs)
pnpm generate:types      # regenerate src/payload-types.ts after schema changes
pnpm generate:importmap  # regenerate the admin import map after adding plugins/components
```

> After changing collections or plugins, run `generate:types` **and**
> `generate:importmap`, otherwise the admin build can fail.

## Deploy on Coolify

1. **New Resource → Application → (your repo)**, Build Pack: **Dockerfile**, Port **3000**.
2. **New Resource → Database → PostgreSQL** (or reuse one).
3. App env vars:
   ```
   PAYLOAD_SECRET=<openssl rand -hex 32>
   DATABASE_URI=postgres://<user>:<pass>@<db-host>:5432/<db>
   ```
4. Attach a domain (e.g. `cms.tzhk.dev`), enable SSL.
   Open port **80** in the Hetzner firewall so Let's Encrypt can issue the cert.
5. Deploy. Payload auto-creates its tables on first boot.

## Adding a new project (tenant)

1. Admin → **Tenants** → create (name + slug).
2. Add content under the tenant-scoped collections (use the tenant selector).
3. Point that project's frontend at this CMS, filtering by the tenant slug.
