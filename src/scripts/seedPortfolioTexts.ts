import { readFileSync } from 'fs'

import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Seed (idempotently) the portfolio tenant's PortfolioTexts document from the
 * frontend's bundled i18n catalog, so the CMS starts out matching the site.
 *
 * Usage:
 *   pnpm payload run src/scripts/seedPortfolioTexts.ts -- --messages /path/to/axon-portfolio/messages
 *
 * `--messages` (or SEED_MESSAGES_DIR) points at the directory with
 * en.json / ru.json / cz.json. Site locale "cz" maps to CMS locale "cs".
 * Re-running overwrites the document with the catalog values.
 */

const arg = (flag: string): string | undefined => {
  const i = process.argv.indexOf(`--${flag}`)
  return i !== -1 ? process.argv[i + 1] : undefined
}

const messagesDir = arg('messages') || process.env.SEED_MESSAGES_DIR
if (!messagesDir) throw new Error('Provide --messages <dir> (or SEED_MESSAGES_DIR).')

// site locale file -> CMS locale
const LOCALES: { file: string; cms: 'en' | 'ru' | 'cs' }[] = [
  { file: 'en', cms: 'en' },
  { file: 'ru', cms: 'ru' },
  { file: 'cz', cms: 'cs' },
]

type Catalog = {
  meta: { title: string; description: string }
  hero: { lead: string; headline: string; sub: string; cta: string }
  work: { title: string; subtitle: string }
  services: {
    title: string
    items: { t: string; d: string }[]
    academicTitle: string
    academicLead: string
    academicItems: string[]
  }
  contact: { title: string[]; lead: string }
  footer: { tagline: string }
}

const toTexts = (m: Catalog) => ({
  meta: { title: m.meta.title, description: m.meta.description },
  hero: {
    lead: m.hero.lead,
    headline: m.hero.headline,
    sub: m.hero.sub,
    cta: m.hero.cta,
  },
  work: { title: m.work.title, subtitle: m.work.subtitle },
  services: {
    title: m.services.title,
    items: m.services.items,
    academicTitle: m.services.academicTitle,
    academicLead: m.services.academicLead,
    academicItems: m.services.academicItems.map((text) => ({ text })),
  },
  contact: { title: m.contact.title[0] ?? '', lead: m.contact.lead },
  footer: { tagline: m.footer.tagline },
})

const run = async (): Promise<void> => {
  const payload = await getPayload({ config })

  const tenants = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: 'portfolio' } },
    limit: 1,
    overrideAccess: true,
  })
  const tenant = tenants.docs[0]
  if (!tenant) throw new Error('Tenant "portfolio" not found — create it first.')

  const found = await payload.find({
    collection: 'portfolioTexts',
    where: { tenant: { equals: tenant.id } },
    limit: 1,
    overrideAccess: true,
  })
  let id = found.docs[0]?.id

  for (const { file, cms } of LOCALES) {
    const catalog = JSON.parse(
      readFileSync(`${messagesDir.replace(/\/+$/, '')}/${file}.json`, 'utf8'),
    ) as Catalog
    const data = toTexts(catalog)

    if (id == null) {
      const created = await payload.create({
        collection: 'portfolioTexts',
        locale: cms,
        data: { ...data, tenant: tenant.id },
        overrideAccess: true,
      })
      id = created.id
      payload.logger.info(`Created portfolioTexts (id=${id}, locale=${cms})`)
    } else {
      await payload.update({
        collection: 'portfolioTexts',
        id,
        locale: cms,
        data,
        overrideAccess: true,
      })
      payload.logger.info(`Updated portfolioTexts locale=${cms}`)
    }
  }
}

// Top-level await: the payload CLI exits after module evaluation, so a
// floating run().catch(...) would be cut short silently.
try {
  await run()
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
}
