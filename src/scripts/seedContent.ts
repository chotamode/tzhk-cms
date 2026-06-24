import fs from 'node:fs'
import path from 'node:path'

import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Bulk-seed a tenant's content from a single folder, idempotently.
 *
 *   pnpm seed:content --dir ./content/tatushka
 *
 * Folder layout:
 *   content/tatushka/
 *     content.json        ← all texts (per locale) + portfolio list (see schema below)
 *     images/             ← image files referenced by name in content.json
 *
 * Re-running is safe: the tenant (by slug), media (by filename), the single
 * siteContent doc (by tenant) and portfolio items (by English label) are
 * matched and updated rather than duplicated.
 *
 * content.json shape (localized leaves are { en, cs, ru }; non-localized are plain):
 * {
 *   "tenant":   { "name": "Tatushkiii", "slug": "tatushka" },
 *   "siteContent": {
 *     "hero":   { "title": {"en":"","cs":"","ru":""}, "subtitle": {"en":"","cs":"","ru":""} },
 *     "about":  { "heading": {...}, "body": {...} },            // body: plain text, paragraphs split on blank lines
 *     "cta":    { "label": {...} },
 *     "contacts": { "telegram": "", "whatsapp": "", "email": "" },
 *     "socials":  [ { "platform": "instagram", "url": "" } ],
 *     "seo":    { "metaTitle": {...}, "metaDescription": {...}, "ogImage": "og.jpg" }
 *   },
 *   // Portfolio is authored at the top level for convenience but folded into the
 *   // single siteContent document as an array (display order = array order).
 *   "portfolio": [
 *     { "image": "spine.webp", "label": {...}, "category": "ornamental" }
 *   ]
 * }
 */

type Locale = 'en' | 'cs' | 'ru'
const LOCALES: Locale[] = ['en', 'cs', 'ru']

type Localized = Partial<Record<Locale, string>>

const arg = (flag: string): string | undefined => {
  const i = process.argv.indexOf(`--${flag}`)
  return i !== -1 ? process.argv[i + 1] : undefined
}

// Pick a locale value from a localized leaf, falling back to en then empty.
const L = (value: Localized | undefined, locale: Locale): string =>
  value?.[locale] ?? value?.en ?? ''

// Extract a relationship id whether it's a raw id or a populated object.
// Postgres ids are numeric and the upload field rejects a stringified ("2")
// id, so return a number (not String()).
const extractId = (v: unknown): number | undefined => {
  if (v == null) return undefined
  const raw = typeof v === 'object' ? (v as { id: string | number }).id : v
  const n = Number(raw)
  return Number.isNaN(n) ? undefined : n
}

// Minimal plain-text → Lexical rich-text (paragraphs split on blank lines).
const textToLexical = (text: string) => {
  const paragraphs = (text || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const children = (paragraphs.length ? paragraphs : ['']).map((p) => ({
    type: 'paragraph',
    version: 1,
    format: '' as const,
    indent: 0,
    direction: 'ltr' as const,
    children: [
      { type: 'text', text: p, version: 1, format: 0, style: '', mode: 'normal', detail: 0 },
    ],
  }))
  return { root: { type: 'root', format: '' as const, indent: 0, version: 1, direction: 'ltr' as const, children } }
}

const run = async (): Promise<void> => {
  // `--dir` can be swallowed by the pnpm → payload-run arg chain, so SEED_DIR
  // env is the robust fallback.
  const dir = arg('dir') || process.env.SEED_DIR
  if (!dir) {
    throw new Error('Provide the content folder via SEED_DIR=<folder> (or --dir <folder>).')
  }

  const root = path.resolve(dir)
  const file = path.join(root, 'content.json')
  if (!fs.existsSync(file)) throw new Error(`Not found: ${file}`)
  const content = JSON.parse(fs.readFileSync(file, 'utf8'))

  const payload = await getPayload({ config })

  // --- Tenant (by slug) ---
  const slug: string = content.tenant.slug
  const foundTenant = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  const tenant =
    foundTenant.docs[0] ??
    (await payload.create({
      collection: 'tenants',
      data: { name: content.tenant.name, slug },
      overrideAccess: true,
    }))
  const tenantId = tenant.id
  payload.logger.info(`Tenant "${tenant.name}" (slug=${slug}) id=${tenantId}`)

  // --- Media uploader (idempotent by filename within the tenant) ---
  const resolveImage = (name: string): string => {
    for (const candidate of [path.join(root, name), path.join(root, 'images', name)]) {
      if (fs.existsSync(candidate)) return candidate
    }
    throw new Error(`Image not found: ${name} (looked in ${root} and ${root}/images)`)
  }

  const mediaCache = new Map<string, number>()
  const uploadImage = async (name: string, alt: string): Promise<number> => {
    if (mediaCache.has(name)) return mediaCache.get(name) as number
    // Payload renames on filename collisions and re-encodes to webp, so the
    // stored filename is not a reliable dedup key. Cross-run idempotency is
    // handled by reusing the image already attached to an existing doc (below);
    // here we just upload once per source name within this run.
    const created = await payload.create({
      collection: 'media',
      data: { alt: alt || name, tenant: tenantId },
      filePath: resolveImage(name),
      overrideAccess: true,
    })
    const id = Number(created.id)
    payload.logger.info(`Uploaded media ${name} → ${id}`)
    mediaCache.set(name, id)
    return id
  }

  // --- Site content + portfolio (one document per tenant) ---
  if (content.siteContent) {
    const sc = content.siteContent
    const found = await payload.find({
      collection: 'siteContent',
      where: { tenant: { equals: tenantId } },
      limit: 1,
      locale: 'en',
      overrideAccess: true,
      depth: 0,
    })
    const existing = found.docs[0] as
      | {
          id: string | number
          seo?: { ogImage?: unknown }
          portfolio?: Array<{ id?: string; label?: string; image?: unknown }>
        }
      | undefined

    // Reuse the OG image already attached on re-run; upload only when new.
    const ogImageId = existing
      ? extractId(existing.seo?.ogImage)
      : sc.seo?.ogImage
        ? await uploadImage(sc.seo.ogImage, 'OG image')
        : undefined

    // Portfolio rows: upload each image once, reusing the one already attached
    // to a matching row on re-run (matched by English label).
    type Category = 'ornamental' | 'lineWork' | 'abstract' | 'whipShading' | 'freehand'
    const portfolioRows: Array<{ label: Localized; image: number; category: Category | null }> = []
    for (const item of content.portfolio ?? []) {
      const labelEn = L(item.label, 'en')
      const prior = existing?.portfolio?.find((p) => p.label === labelEn)
      const imageId = (prior ? extractId(prior.image) : undefined) ?? (await uploadImage(item.image, labelEn))
      portfolioRows.push({ label: item.label, image: imageId, category: (item.category ?? null) as Category | null })
    }

    // `rowIds[i]` reuses an existing array-row id so localized labels update in
    // place across locales/re-runs instead of duplicating rows; undefined ⇒ new.
    const build = (loc: Locale, rowIds: Array<string | undefined>) => ({
      internalTitle: 'Homepage',
      tenant: tenantId,
      hero: { title: L(sc.hero?.title, loc), subtitle: L(sc.hero?.subtitle, loc) },
      about: { heading: L(sc.about?.heading, loc), body: textToLexical(L(sc.about?.body, loc)) },
      cta: { label: L(sc.cta?.label, loc) },
      contacts: sc.contacts ?? {},
      socials: sc.socials ?? [],
      portfolio: portfolioRows.map((row, i) => ({
        ...(rowIds[i] ? { id: rowIds[i] } : {}),
        label: L(row.label, loc),
        image: row.image,
        category: row.category,
      })),
      seo: {
        metaTitle: L(sc.seo?.metaTitle, loc),
        metaDescription: L(sc.seo?.metaDescription, loc),
        ...(ogImageId ? { ogImage: ogImageId } : {}),
      },
    })

    const existingRowIds = existing?.portfolio?.map((p) => p.id) ?? []

    let id = existing?.id
    if (!id) {
      const created = await payload.create({
        collection: 'siteContent',
        data: build('en', existingRowIds),
        locale: 'en',
        overrideAccess: true,
      })
      id = created.id
    } else {
      await payload.update({ collection: 'siteContent', id, data: build('en', existingRowIds), locale: 'en', overrideAccess: true })
    }

    // Re-read to capture the array-row ids Payload assigned on create, then
    // write the cs/ru labels against those same rows (localized array fields).
    const afterEn = (await payload.findByID({
      collection: 'siteContent',
      id,
      locale: 'en',
      depth: 0,
      overrideAccess: true,
    })) as { portfolio?: Array<{ id?: string }> }
    const rowIds = (afterEn.portfolio ?? []).map((p) => p.id)
    for (const loc of ['cs', 'ru'] as Locale[]) {
      await payload.update({ collection: 'siteContent', id, data: build(loc, rowIds), locale: loc, overrideAccess: true })
    }
    payload.logger.info(`Site content + ${portfolioRows.length} portfolio item(s) seeded (en/cs/ru).`)
  }

  payload.logger.info('Done.')
  process.exit(0)
}

// Top-level await so `payload run` waits for the async work to finish (a
// self-invoking promise is not awaited and the process would exit early).
try {
  await run()
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
}
