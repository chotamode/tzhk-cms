import type { Payload } from 'payload'

/**
 * Shared content-import logic, used by BOTH the CLI seeder
 * (`src/scripts/seedContent.ts`) and the admin "Import content" button
 * (`src/endpoints/importContent.ts`). Keep the upsert in one place so the two
 * entry points can never drift.
 *
 * The site content is a per-tenant block builder (`SiteContent.layout`): a
 * content.json describes an ordered list of sections (hero, about, gallery,
 * products, faq, reviews, text) plus the cross-cutting contacts/socials/SEO.
 *
 * Idempotent: the tenant (by slug) and the single siteContent doc (by tenant)
 * are matched and updated, not duplicated. Across locales and re-runs the same
 * block / array-row ids are reused (matched positionally) so localized values
 * attach to the same rows instead of creating duplicates.
 */

export type Locale = 'en' | 'cs' | 'ru'
export const LOCALES: Locale[] = ['en', 'cs', 'ru']

export type Localized = Partial<Record<Locale, string>>

/** A decoded image ready to hand to Payload's local API `file` option. */
export type ImageUpload = { data: Buffer; name: string; mimetype: string; size: number }

// --- content.json block shapes -----------------------------------------------
// Localized leaves are { en, cs, ru }; the importer expands them per locale.
// `image` fields reference an image by filename (resolved via resolveImage).
type HeroBlock = {
  blockType: 'hero'
  title?: Localized
  subtitle?: Localized
  ctaLabel?: Localized
  ctaHref?: string
  image?: string
}
type AboutBlock = { blockType: 'about'; heading?: Localized; body?: Localized }
// Tags are referenced by slug. On a gallery/products item they tag the item's
// image (in the Media library); on a byTags gallery they select what to show.
type GalleryBlock = {
  blockType: 'gallery'
  heading?: Localized
  source?: 'curated' | 'byTags'
  items?: Array<{ image: string; label?: Localized; tags?: string[] }>
  filterTags?: string[]
  limit?: number
}
type ProductsBlock = {
  blockType: 'products'
  heading?: Localized
  items?: Array<{
    image: string
    title: Localized
    description?: Localized
    price?: number
    currency?: string
    available?: boolean
    tags?: string[]
  }>
}
type FAQBlock = {
  blockType: 'faq'
  heading?: Localized
  items?: Array<{ question: Localized; answer?: Localized }>
}
type ReviewsBlock = {
  blockType: 'reviews'
  heading?: Localized
  items?: Array<{ author?: string; text: Localized; rating?: number }>
}
type RichTextBlock = { blockType: 'richText'; body?: Localized }

export type LayoutBlock =
  | HeroBlock
  | AboutBlock
  | GalleryBlock
  | ProductsBlock
  | FAQBlock
  | ReviewsBlock
  | RichTextBlock

export type TagDef = { slug: string; name?: Localized; kind?: string }

export type ContentFile = {
  tenant: { name: string; slug: string }
  /** Tag taxonomy for this tenant (optional; referenced slugs are auto-created). */
  tags?: TagDef[]
  siteContent?: {
    contacts?: { telegram?: string; whatsapp?: string; email?: string }
    socials?: Array<{ platform: string; url: string }>
    seo?: { metaTitle?: Localized; metaDescription?: Localized; ogImage?: string }
    layout?: LayoutBlock[]
  }
}

export type ImportResult = {
  tenantId: number | string
  tenant: string
  sectionsCount: number
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

// Per-block / per-item ids captured from an existing doc, reused across locales.
type CapturedIds = { blockIds: Array<string | undefined>; itemIds: Array<Array<string | undefined>> }
type LoadedBlock = { id?: string; items?: Array<{ id?: string }> }

const captureIds = (layout: LoadedBlock[] | undefined): CapturedIds => ({
  blockIds: (layout ?? []).map((b) => b.id),
  itemIds: (layout ?? []).map((b) => (b.items ?? []).map((it) => it.id)),
})

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
  const uploadImage = async (name: string, alt: string, tagIds?: number[]): Promise<number> => {
    if (mediaCache.has(name)) return mediaCache.get(name) as number
    // Reuse an existing upload with the same source filename so re-seeding
    // doesn't pile up duplicate media. Matched by base name (the stored file is
    // re-encoded to .webp, so the extension differs); tags refreshed on reuse.
    const base = name.replace(/\.[^./]+$/, '')
    const existing = await payload.find({
      collection: 'media',
      where: { and: [{ tenant: { equals: tenantId } }, { filename: { like: base } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const reused = existing.docs[0]?.id
    if (reused != null) {
      const id = Number(reused)
      if (tagIds?.length) {
        await payload.update({ collection: 'media', id, data: { tags: tagIds }, overrideAccess: true })
      }
      log(`Reused media ${name} → ${id}`)
      mediaCache.set(name, id)
      return id
    }
    const img = await resolveImage(name)
    const created = await payload.create({
      collection: 'media',
      data: { alt: alt || name, tenant: tenantId, ...(tagIds?.length ? { tags: tagIds } : {}) },
      file: { data: img.data, mimetype: img.mimetype, name: img.name, size: img.size },
      overrideAccess: true,
    })
    const id = Number(created.id)
    imagesUploaded += 1
    log(`Uploaded media ${name} → ${id}`)
    mediaCache.set(name, id)
    return id
  }
  const imageId = (name: string): number | null => mediaCache.get(name) ?? null

  const sc = content.siteContent
  const layout = sc?.layout ?? []
  let sectionsCount = 0

  // --- Tags (taxonomy) ---------------------------------------------------------
  // Upsert defined tags + any slug referenced by an item/gallery, by (tenant,
  // slug). Returns slug → id so media can be tagged and byTags galleries
  // resolved. Tag `name` is localized; `slug`/`kind` are not.
  const tagId = new Map<string, number>()
  const resolveTags = async (): Promise<void> => {
    const defined = new Map((content.tags ?? []).map((t) => [t.slug, t]))
    const referenced = new Set<string>()
    for (const block of layout) {
      if (block.blockType === 'gallery') {
        // Collect both: filterTags (byTags rendering) and item tags (used to
        // tag the seeded media — items seed the library even for byTags blocks).
        ;(block.filterTags ?? []).forEach((s) => referenced.add(s))
        for (const it of block.items ?? []) (it.tags ?? []).forEach((s) => referenced.add(s))
      } else if (block.blockType === 'products') {
        for (const it of block.items ?? []) (it.tags ?? []).forEach((s) => referenced.add(s))
      }
    }
    for (const slug of new Set<string>([...defined.keys(), ...referenced])) {
      const def = defined.get(slug)
      const kind = def?.kind ?? 'category'
      const nameEn = (def?.name ? L(def.name, 'en') : '') || slug
      const found = await payload.find({
        collection: 'tags',
        where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }] },
        limit: 1,
        locale: 'en',
        depth: 0,
        overrideAccess: true,
      })
      let id = found.docs[0]?.id as number | undefined
      if (id == null) {
        const created = await payload.create({
          collection: 'tags',
          data: { slug, name: nameEn, kind, tenant: tenantId } as never,
          locale: 'en',
          overrideAccess: true,
        })
        id = created.id as number
      } else {
        await payload.update({
          collection: 'tags',
          id,
          data: { name: nameEn, kind } as never,
          locale: 'en',
          overrideAccess: true,
        })
      }
      if (def?.name) {
        for (const loc of ['cs', 'ru'] as Locale[]) {
          await payload.update({
            collection: 'tags',
            id,
            data: { name: L(def.name, loc) } as never,
            locale: loc,
            overrideAccess: true,
          })
        }
      }
      tagId.set(slug, id)
    }
  }
  await resolveTags()
  const tagIdsFor = (slugs?: string[]): number[] =>
    (slugs ?? []).map((s) => tagId.get(s)).filter((n): n is number => n != null)

  // --- Site content (one document per tenant) ---
  if (sc) {
    const found = await payload.find({
      collection: 'siteContent',
      where: { tenant: { equals: tenantId } },
      limit: 1,
      locale: 'en',
      overrideAccess: true,
      depth: 0,
    })
    const existing = found.docs[0] as
      | { id: string | number; seo?: { ogImage?: unknown }; layout?: LoadedBlock[] }
      | undefined

    // Reuse the OG image already attached on re-run; upload only when new.
    const ogImageId = existing
      ? extractId(existing.seo?.ogImage)
      : sc.seo?.ogImage
        ? await uploadImage(sc.seo.ogImage, 'OG image')
        : undefined

    // Upload every image referenced anywhere in the layout, once. After this
    // `imageId(name)` resolves synchronously inside the per-locale builder.
    for (const block of layout) {
      if (block.blockType === 'hero' && block.image) {
        await uploadImage(block.image, L(block.title, 'en') || 'Hero')
      } else if (block.blockType === 'gallery') {
        // Upload + tag items even for byTags galleries: the items seed the media
        // library; byTags then renders by querying media for those tags.
        for (const it of block.items ?? [])
          await uploadImage(it.image, L(it.label, 'en'), tagIdsFor(it.tags))
      } else if (block.blockType === 'products') {
        for (const it of block.items ?? [])
          await uploadImage(it.image, L(it.title, 'en'), tagIdsFor(it.tags))
      }
    }
    sectionsCount = layout.length

    // Build the `layout` array for one locale, optionally reusing block /
    // item ids so localized values update the same rows across locales.
    const buildLayout = (loc: Locale, ids: CapturedIds) =>
      layout.map((block, bi) => {
        const withId = ids.blockIds[bi] ? { id: ids.blockIds[bi] } : {}
        const itemId = (ii: number) => (ids.itemIds[bi]?.[ii] ? { id: ids.itemIds[bi][ii] } : {})
        switch (block.blockType) {
          case 'hero':
            return {
              ...withId,
              blockType: 'hero' as const,
              title: L(block.title, loc),
              subtitle: L(block.subtitle, loc),
              ctaLabel: L(block.ctaLabel, loc),
              ctaHref: block.ctaHref ?? null,
              image: block.image ? imageId(block.image) : null,
            }
          case 'about':
            return {
              ...withId,
              blockType: 'about' as const,
              heading: L(block.heading, loc),
              body: textToLexical(L(block.body, loc)),
            }
          case 'gallery': {
            const byTags = block.source === 'byTags'
            return {
              ...withId,
              blockType: 'gallery' as const,
              heading: L(block.heading, loc),
              source: byTags ? 'byTags' : 'curated',
              items: byTags
                ? []
                : (block.items ?? []).map((it, ii) => ({
                    ...itemId(ii),
                    image: imageId(it.image),
                    label: L(it.label, loc),
                  })),
              filterTags: byTags ? tagIdsFor(block.filterTags) : [],
              limit: byTags ? (block.limit ?? 24) : undefined,
            }
          }
          case 'products':
            return {
              ...withId,
              blockType: 'products' as const,
              heading: L(block.heading, loc),
              items: (block.items ?? []).map((it, ii) => ({
                ...itemId(ii),
                image: imageId(it.image),
                title: L(it.title, loc),
                description: L(it.description, loc),
                price: it.price ?? null,
                currency: it.currency ?? 'RUB',
                available: it.available ?? true,
              })),
            }
          case 'faq':
            return {
              ...withId,
              blockType: 'faq' as const,
              heading: L(block.heading, loc),
              items: (block.items ?? []).map((it, ii) => ({
                ...itemId(ii),
                question: L(it.question, loc),
                answer: textToLexical(L(it.answer, loc)),
              })),
            }
          case 'reviews':
            return {
              ...withId,
              blockType: 'reviews' as const,
              heading: L(block.heading, loc),
              items: (block.items ?? []).map((it, ii) => ({
                ...itemId(ii),
                author: it.author ?? null,
                text: L(it.text, loc),
                rating: it.rating ?? null,
              })),
            }
          case 'richText':
            return { ...withId, blockType: 'richText' as const, body: textToLexical(L(block.body, loc)) }
        }
      })

    const buildDoc = (loc: Locale, ids: CapturedIds) => ({
      internalTitle: 'Homepage',
      tenant: tenantId,
      layout: buildLayout(loc, ids),
      contacts: sc.contacts ?? {},
      socials: sc.socials ?? [],
      seo: {
        metaTitle: L(sc.seo?.metaTitle, loc),
        metaDescription: L(sc.seo?.metaDescription, loc),
        ...(ogImageId ? { ogImage: ogImageId } : {}),
      },
    })

    // First write (en): reuse existing ids on re-run so rows update in place.
    let id = existing?.id
    const initialIds = captureIds(existing?.layout)
    if (!id) {
      const created = await payload.create({
        collection: 'siteContent',
        data: buildDoc('en', initialIds) as never,
        locale: 'en',
        overrideAccess: true,
      })
      id = created.id
    } else {
      await payload.update({
        collection: 'siteContent',
        id,
        data: buildDoc('en', initialIds) as never,
        locale: 'en',
        overrideAccess: true,
      })
    }

    // Re-read to capture the ids Payload assigned, then write cs/ru against the
    // same blocks/rows (localized fields), so locales don't duplicate rows.
    const afterEn = (await payload.findByID({
      collection: 'siteContent',
      id,
      locale: 'en',
      depth: 0,
      overrideAccess: true,
    })) as { layout?: LoadedBlock[] }
    const ids = captureIds(afterEn.layout)
    for (const loc of ['cs', 'ru'] as Locale[]) {
      await payload.update({
        collection: 'siteContent',
        id,
        data: buildDoc(loc, ids) as never,
        locale: loc,
        overrideAccess: true,
      })
    }
    log(`Site content imported: ${sectionsCount} section(s) (en/cs/ru).`)
  }

  return { tenantId, tenant: tenantName, sectionsCount, imagesUploaded }
}
