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
 *   "portfolio": [
 *     { "image": "spine.webp", "label": {...}, "category": "ornamental", "sort": 1 }
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
const extractId = (v: unknown): string | undefined => {
  if (v == null) return undefined
  if (typeof v === 'object') return String((v as { id: unknown }).id)
  return String(v)
}

// Minimal plain-text → Lexical rich-text (paragraphs split on blank lines).
const textToLexical = (text: string) => {
  const paragraphs = (text || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const children = (paragraphs.length ? paragraphs : ['']).map((p) => ({
    type: 'paragraph',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    children: [
      { type: 'text', text: p, version: 1, format: 0, style: '', mode: 'normal', detail: 0 },
    ],
  }))
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } }
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

  const mediaCache = new Map<string, string>()
  const uploadImage = async (name: string, alt: string): Promise<string> => {
    if (mediaCache.has(name)) return mediaCache.get(name) as string
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
    const id = created.id as string
    payload.logger.info(`Uploaded media ${name} → ${id}`)
    mediaCache.set(name, id)
    return id
  }

  // --- Site content (one per tenant) ---
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
    const existing = found.docs[0] as { id: string | number; seo?: { ogImage?: unknown } } | undefined

    // Reuse the OG image already attached on re-run; upload only when new.
    const ogImageId = existing
      ? extractId(existing.seo?.ogImage)
      : sc.seo?.ogImage
        ? await uploadImage(sc.seo.ogImage, 'OG image')
        : undefined

    const build = (loc: Locale) => ({
      internalTitle: 'Homepage',
      tenant: tenantId,
      hero: { title: L(sc.hero?.title, loc), subtitle: L(sc.hero?.subtitle, loc) },
      about: { heading: L(sc.about?.heading, loc), body: textToLexical(L(sc.about?.body, loc)) },
      cta: { label: L(sc.cta?.label, loc) },
      contacts: sc.contacts ?? {},
      socials: sc.socials ?? [],
      seo: {
        metaTitle: L(sc.seo?.metaTitle, loc),
        metaDescription: L(sc.seo?.metaDescription, loc),
        ...(ogImageId ? { ogImage: ogImageId } : {}),
      },
    })

    let id = existing?.id
    if (!id) {
      const created = await payload.create({
        collection: 'siteContent',
        data: build('en'),
        locale: 'en',
        overrideAccess: true,
      })
      id = created.id
    } else {
      await payload.update({ collection: 'siteContent', id, data: build('en'), locale: 'en', overrideAccess: true })
    }
    for (const loc of ['cs', 'ru'] as Locale[]) {
      await payload.update({ collection: 'siteContent', id, data: build(loc), locale: loc, overrideAccess: true })
    }
    payload.logger.info('Site content seeded (en/cs/ru).')
  }

  // --- Portfolio items (by English label within the tenant) ---
  for (const item of content.portfolio ?? []) {
    const labelEn = L(item.label, 'en')
    const found = await payload.find({
      collection: 'portfolio',
      where: { and: [{ tenant: { equals: tenantId } }, { label: { equals: labelEn } }] },
      limit: 1,
      locale: 'en',
      overrideAccess: true,
      depth: 0,
    })
    const existing = found.docs[0] as { id: string | number; image?: unknown } | undefined

    // Reuse the existing item's image on re-run; upload only when creating.
    const imageId =
      (existing ? extractId(existing.image) : undefined) ?? (await uploadImage(item.image, labelEn))

    const build = (loc: Locale) => ({
      tenant: tenantId,
      image: imageId,
      category: item.category ?? null,
      sort: item.sort ?? 0,
      label: L(item.label, loc),
    })

    let id = existing?.id
    if (!id) {
      const created = await payload.create({ collection: 'portfolio', data: build('en'), locale: 'en', overrideAccess: true })
      id = created.id
    } else {
      await payload.update({ collection: 'portfolio', id, data: build('en'), locale: 'en', overrideAccess: true })
    }
    for (const loc of ['cs', 'ru'] as Locale[]) {
      await payload.update({ collection: 'portfolio', id, data: build(loc), locale: loc, overrideAccess: true })
    }
    payload.logger.info(`Portfolio item "${labelEn}" seeded.`)
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
