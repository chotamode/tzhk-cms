import type { Payload } from 'payload'

/**
 * Shared content-import logic, used by BOTH the CLI seeder
 * (`src/scripts/seedContent.ts`) and the admin "Import content" button
 * (`src/endpoints/importContent.ts`). Keep the upsert in one place so the two
 * entry points can never drift.
 *
 * Idempotent: the tenant (by slug), the single siteContent doc (by tenant) and
 * its portfolio rows (by English label) are matched and updated, not duplicated.
 */

export type Locale = 'en' | 'cs' | 'ru'
export const LOCALES: Locale[] = ['en', 'cs', 'ru']

export type Localized = Partial<Record<Locale, string>>
export type Category = 'ornamental' | 'lineWork' | 'abstract' | 'whipShading' | 'freehand'

/** A decoded image ready to hand to Payload's local API `file` option. */
export type ImageUpload = { data: Buffer; name: string; mimetype: string; size: number }

export type ContentFile = {
  tenant: { name: string; slug: string }
  siteContent?: {
    hero?: { title?: Localized; subtitle?: Localized }
    about?: { heading?: Localized; body?: Localized }
    cta?: { label?: Localized }
    contacts?: { telegram?: string; whatsapp?: string; email?: string }
    socials?: Array<{ platform: string; url: string }>
    seo?: { metaTitle?: Localized; metaDescription?: Localized; ogImage?: string }
  }
  portfolio?: Array<{ image: string; label: Localized; category?: Category | null }>
}

export type ImportResult = {
  tenantId: number | string
  tenant: string
  portfolioCount: number
  imagesUploaded: number
}

export type ImportOptions = {
  payload: Payload
  content: ContentFile
  /** Resolve an image referenced by name in content.json to its bytes. */
  resolveImage: (name: string) => Promise<ImageUpload>
  /**
   * Force a tenant id (skip tenant create-by-slug). Used by the admin endpoint
   * to confine non-super-admins to their own tenant.
   */
  forceTenantId?: number | string
  log?: (msg: string) => void
}

// Pick a locale value from a localized leaf, falling back to en then empty.
const L = (value: Localized | undefined, locale: Locale): string =>
  value?.[locale] ?? value?.en ?? ''

// Extract a relationship id whether it's a raw id or a populated object.
// Postgres ids are numeric and the upload field rejects a stringified ("2") id.
const extractId = (v: unknown): number | undefined => {
  if (v == null) return undefined
  const raw = typeof v === 'object' ? (v as { id: string | number }).id : v
  const n = Number(raw)
  return Number.isNaN(n) ? undefined : n
}

// Minimal plain-text → Lexical rich-text (paragraphs split on blank lines).
export const textToLexical = (text: string) => {
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

/** Guess an image mimetype from its filename extension. */
export const mimeFromName = (name: string): string => {
  const ext = name.toLowerCase().split('.').pop() ?? ''
  const map: Record<string, string> = {
    webp: 'image/webp',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    avif: 'image/avif',
    gif: 'image/gif',
    svg: 'image/svg+xml',
  }
  return map[ext] ?? 'application/octet-stream'
}

export async function importContent(opts: ImportOptions): Promise<ImportResult> {
  const { payload, content, resolveImage, forceTenantId } = opts
  const log = opts.log ?? (() => {})

  // --- Tenant (forced, or by slug) ---
  let tenantId: number | string
  let tenantName: string
  if (forceTenantId != null) {
    const t = await payload.findByID({ collection: 'tenants', id: forceTenantId, overrideAccess: true })
    tenantId = t.id
    tenantName = (t as { name?: string }).name ?? String(t.id)
  } else {
    const slug = content.tenant.slug
    const found = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })
    const tenant =
      found.docs[0] ??
      (await payload.create({
        collection: 'tenants',
        data: { name: content.tenant.name, slug },
        overrideAccess: true,
      }))
    tenantId = tenant.id
    tenantName = (tenant as { name?: string }).name ?? slug
  }
  log(`Tenant "${tenantName}" id=${tenantId}`)

  // --- Media uploader (one upload per source name within this run) ---
  let imagesUploaded = 0
  const mediaCache = new Map<string, number>()
  const uploadImage = async (name: string, alt: string): Promise<number> => {
    if (mediaCache.has(name)) return mediaCache.get(name) as number
    const img = await resolveImage(name)
    const created = await payload.create({
      collection: 'media',
      data: { alt: alt || name, tenant: tenantId },
      file: { data: img.data, mimetype: img.mimetype, name: img.name, size: img.size },
      overrideAccess: true,
    })
    const id = Number(created.id)
    imagesUploaded += 1
    log(`Uploaded media ${name} → ${id}`)
    mediaCache.set(name, id)
    return id
  }

  let portfolioCount = 0

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
    const portfolioRows: Array<{ label: Localized; image: number; category: Category | null }> = []
    for (const item of content.portfolio ?? []) {
      const labelEn = L(item.label, 'en')
      const prior = existing?.portfolio?.find((p) => p.label === labelEn)
      const imageId = (prior ? extractId(prior.image) : undefined) ?? (await uploadImage(item.image, labelEn))
      portfolioRows.push({ label: item.label, image: imageId, category: item.category ?? null })
    }
    portfolioCount = portfolioRows.length

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
    log(`Site content + ${portfolioCount} portfolio item(s) imported (en/cs/ru).`)
  }

  return { tenantId, tenant: tenantName, portfolioCount, imagesUploaded }
}
