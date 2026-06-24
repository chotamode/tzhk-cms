# Bulk content seeding

Fill a tenant's content in one shot from a folder.

```
content/<tenant>/
  content.json      # all texts (per locale) + portfolio list
  images/           # image files referenced by name in content.json
    spine.webp
    arm.webp
    og.jpg
```

Run (locally / in a full project with DB access — not the slim prod image):

```bash
pnpm seed:content --dir ./content/tatushka
```

What it does, idempotently (safe to re-run):
- creates the tenant (by `slug`) if missing,
- uploads each referenced image to **Media** → R2 (skips ones already uploaded, matched by filename),
- writes the single **Site content** doc for the tenant (en/cs/ru), including the
  **portfolio** gallery as an array on that document (display order = array
  order; rows matched by English label on re-run, so labels update in place).

See `src/scripts/seedContent.ts` for the exact `content.json` schema. `content/tatushka/` carries the live Tatushkiii content: the real per-locale texts plus the actual site images under `images/`, so the seed reproduces the current site 1:1.

> Tatushkiii's images are committed here because they're already public on the
> live site, which makes the seed turnkey. For other tenants, prefer keeping
> large binaries out of git (or in a dedicated assets store) and commit only
> `content.json`.
