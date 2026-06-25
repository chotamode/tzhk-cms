# Bulk content seeding

Fill a tenant's content in one shot from a folder.

```
content/<tenant>/
  content.json      # page sections (blocks) + contacts/socials/SEO, per locale
  images/           # image files referenced by name in content.json
    spine.webp
    arm.webp
    og.jpg
```

`content.json` describes the page as an ordered list of **blocks** under
`siteContent.layout` (`hero`, `about`, `gallery`, `products`, `faq`, `reviews`,
`richText`), plus the cross-cutting `contacts` / `socials` / `seo`. Localized
leaves are `{ en, cs, ru }`. See `src/lib/importContent.ts` for the exact shape.

**Tags** are defined once under a top-level `tags` array (`{ slug, name, kind }`)
and referenced by `slug`: on a gallery/products item (`"tags": ["hats"]`) they
tag the item's image in the Media library; on a `source: "byTags"` gallery they
select what to show. Referenced slugs that aren't defined are auto-created.

Run (locally / in a full project with DB access — not the slim prod image):

```bash
pnpm seed:content --dir ./content/tatushka
```

What it does, idempotently (safe to re-run):
- creates the tenant (by `slug`) if missing,
- uploads each referenced image to **Media** → R2 (skips ones already uploaded, matched by filename),
- writes the single **Site content** doc for the tenant (en/cs/ru): the `layout`
  blocks in order, plus contacts/socials/SEO. Across locales and re-runs the same
  block / array-row ids are reused (matched positionally), so localized values
  update the same rows instead of duplicating.

`content/tatushka/` carries the live Tatushkiii content as blocks (hero + about +
gallery), the real per-locale texts plus the actual site images under `images/`,
so the seed reproduces the current site 1:1.

## Tenants in this folder

| Folder | Tenant slug | Site | Seed |
|--------|-------------|------|------|
| `content/tatushka/` | `tatushka` | tatushkiii-nextjs | `pnpm seed:content --dir ./content/tatushka` |
| `content/alfaag/` | `alfaag` | next-knitting-portfolio (Альфия, вязание) | `pnpm seed:content --dir ./content/alfaag` |

`content/alfaag/` carries the knitting site's current Russian copy (homepage hero
+ «Обо мне» + CTA, contacts/socials, SEO) and the «Примеры работ» gallery images,
so the seed reproduces that site's content. The knitting site is Russian-only;
`en` values are included only as the importer's fallback locale (`cs` falls back
to `en`). On a host without the Payload CLI (slim prod image), use the admin
**Import content** button instead, uploading `content.json` + the images.

> Tatushkiii's images are committed here because they're already public on the
> live site, which makes the seed turnkey. For other tenants, prefer keeping
> large binaries out of git (or in a dedicated assets store) and commit only
> `content.json`.
