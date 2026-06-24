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
- writes the single **Site content** doc for the tenant (en/cs/ru),
- creates/updates **Portfolio** items (matched by English label).

See `src/scripts/seedContent.ts` for the exact `content.json` schema. `content/tatushka/content.json` is a working template — drop real images into `content/tatushka/images/` and edit the texts.

> Images are not committed here (binaries) — only `content.json`. Keep client
> images out of git or in a dedicated assets store as you prefer.
