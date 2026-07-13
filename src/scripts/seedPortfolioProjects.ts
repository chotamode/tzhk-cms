import config from '@payload-config'
import { getPayload } from 'payload'
import type { Payload } from 'payload'

/**
 * Seed (idempotently) the portfolio tenant's Projects with the three live
 * client sites, including localized copy (en/ru/cs) and preview screenshots.
 *
 * Usage:
 *   pnpm payload run src/scripts/seedPortfolioProjects.ts -- --images /path/to/webp/dir
 *
 * `--images` (or SEED_IMAGES_DIR) points at a directory containing
 * doomp.webp / vese.webp / alfaag.webp (the axon-portfolio public/work dir).
 * Re-running is safe: projects are matched by url, media by filename.
 * Needs DB (+S3) access — run against the target database like seedTenant.ts.
 */

const arg = (flag: string): string | undefined => {
  const i = process.argv.indexOf(`--${flag}`)
  return i !== -1 ? process.argv[i + 1] : undefined
}

const imagesDir = arg('images') || process.env.SEED_IMAGES_DIR || ''

type LocalizedText = { en: string; ru: string; cs: string }

type ProjectSeed = {
  url: string
  year: string
  stack: string
  category: 'client' | 'university'
  order: number
  imageFile: string
  imageAlt: string
  title: LocalizedText
  description: LocalizedText
  features: { en: string[]; ru: string[]; cs: string[] }
}

const PROJECTS: ProjectSeed[] = [
  {
    url: 'https://doomp.ink',
    year: '2025',
    stack: 'Next.js 15 · Payload CMS (headless) · OpnForm · EN/CS/RU',
    category: 'client',
    order: 1,
    imageFile: 'doomp.webp',
    imageAlt: 'doomp.ink — tattoo artist site, landing page',
    title: {
      en: 'Tatushki · doomp.ink',
      ru: 'Tatushki · doomp.ink',
      cs: 'Tatushki · doomp.ink',
    },
    description: {
      en: 'Site for a Prague tattoo artist. Not a website builder, not a template: content lives in a headless CMS — the artist publishes new work herself and the site picks it up automatically, no developer involved.',
      ru: 'Сайт тату-мастера в Праге. Не конструктор и не шаблон: контент живёт в headless CMS — художница публикует новые работы сама, сайт подхватывает их автоматически, без участия разработчика.',
      cs: 'Web pro tatérku z Prahy. Žádná šablona ani website builder: obsah žije v headless CMS — nové práce publikuje sama a web si je automaticky převezme, bez vývojáře.',
    },
    features: {
      en: [
        'Portfolio with style filters — every piece and copy block comes from Payload CMS',
        'Instant publishing: a CMS webhook rebuilds pages on change (ISR + revalidate)',
        'Session booking via a self-hosted OpnForm with a messenger fallback',
        'Three languages (EN / CS / RU) for local and visiting clients',
        'SEO built in: SSR, sitemap, Schema.org, Open Graph',
      ],
      ru: [
        'Портфолио с фильтрами по стилям — все работы и тексты приходят из Payload CMS',
        'Мгновенная публикация: вебхук из CMS пересобирает страницы (ISR + revalidate)',
        'Запись на сеанс через self-hosted форму OpnForm с запасным каналом в мессенджер',
        'Три языка (EN / CS / RU) — под локальных и приезжих клиентов',
        'SEO как основа: SSR, sitemap, Schema.org, Open Graph',
      ],
      cs: [
        'Portfolio s filtry podle stylů — práce i texty přicházejí z Payload CMS',
        'Okamžitá publikace: webhook z CMS přegeneruje stránky (ISR + revalidate)',
        'Rezervace přes self-hosted formulář OpnForm se záložním kanálem v messengeru',
        'Tři jazyky (EN / CS / RU) pro místní i zahraniční klienty',
        'SEO v základu: SSR, sitemap, Schema.org, Open Graph',
      ],
    },
  },
  {
    url: 'https://vese.love',
    year: '2025',
    stack: 'Next.js · Payload CMS · PostgreSQL',
    category: 'client',
    order: 2,
    imageFile: 'vese.webp',
    imageAlt: 'vese.love — tattoo artist portfolio, landing page',
    title: {
      en: 'Vesé · vese.love',
      ru: 'Vesé · vese.love',
      cs: 'Vesé · vese.love',
    },
    description: {
      en: 'Tattoo artist portfolio with its own admin panel: Payload CMS runs inside the site itself. Copy, gallery, and client requests all live in one dashboard — no third-party services.',
      ru: 'Портфолио тату-мастера со встроенной админкой: Payload CMS живёт внутри самого сайта. Тексты, галерея и заявки клиентов — всё в одной панели, без сторонних сервисов.',
      cs: 'Portfolio tatérky s vlastní administrací: Payload CMS běží přímo uvnitř webu. Texty, galerie i poptávky klientů — vše v jednom panelu, bez služeb třetích stran.',
    },
    features: {
      en: [
        'Booking form: requests are stored in PostgreSQL and forwarded to email',
        'Mini-CRM in the admin: request statuses — new / read / done',
        'The client edits copy and gallery herself — no developer needed',
        'Built, deployed, and hosted end to end on a dedicated server',
      ],
      ru: [
        'Форма записи: заявки сохраняются в PostgreSQL и приходят на почту',
        'Мини-CRM в админке: статусы заявок «новая / прочитана / готово»',
        'Клиент сам редактирует тексты и работы — разработчик не нужен',
        'Сборка, деплой и хостинг под ключ на собственном сервере',
      ],
      cs: [
        'Rezervační formulář: poptávky se ukládají do PostgreSQL a chodí na e-mail',
        'Mini-CRM v administraci: stavy poptávek — nová / přečtená / hotovo',
        'Klientka si texty a galerii upravuje sama — vývojář není potřeba',
        'Postaveno, nasazeno a hostováno na vlastním serveru',
      ],
    },
  },
  {
    url: 'https://alfaag.com',
    year: '2025',
    stack: 'Next.js · Payload CMS · PostgreSQL · sharp',
    category: 'client',
    order: 3,
    imageFile: 'alfaag.webp',
    imageAlt: 'alfaag.com — knitting showcase, landing page',
    title: {
      en: 'Alfaag · alfaag.com',
      ru: 'Alfaag · alfaag.com',
      cs: 'Alfaag · alfaag.com',
    },
    description: {
      en: 'Storefront for a family knitting business on a block-based builder: the page is assembled from ready sections — hero, products, gallery, reviews, FAQ — right in the admin panel.',
      ru: 'Витрина семейного вязального бизнеса на блочном конструкторе: страница собирается из готовых секций — герой, товары, галерея, отзывы, FAQ — прямо в админке.',
      cs: 'Vitrína rodinného pletařského podnikání na blokovém builderu: stránka se skládá z hotových sekcí — hero, produkty, galerie, recenze, FAQ — přímo v administraci.',
    },
    features: {
      en: [
        'Block-based page editor in Payload CMS — the client rearranges the page herself',
        'Media library with automatic photo optimization (sharp → WebP)',
        'Form submissions land in the database and mirror to email — nothing gets lost',
        'Fast and indexable: SSR on Next.js + PostgreSQL',
      ],
      ru: [
        'Блочный редактор страниц в Payload CMS — клиент меняет структуру сам',
        'Медиатека с автоматической оптимизацией фото (sharp → WebP)',
        'Заявки с формы падают в базу и дублируются на email — ничего не теряется',
        'Быстрый и индексируемый: SSR на Next.js + PostgreSQL',
      ],
      cs: [
        'Blokový editor stránek v Payload CMS — klient si strukturu mění sám',
        'Knihovna médií s automatickou optimalizací fotek (sharp → WebP)',
        'Poptávky z formuláře padají do databáze a kopírují se na e-mail — nic se neztratí',
        'Rychlý a indexovatelný: SSR na Next.js + PostgreSQL',
      ],
    },
  },
]

const toFeatureRows = (items: string[]): { text: string }[] => items.map((text) => ({ text }))

const upsertImage = async (
  payload: Payload,
  tenantId: number,
  seed: ProjectSeed,
): Promise<number | null> => {
  if (!imagesDir) return null
  const existing = await payload.find({
    collection: 'media',
    where: {
      and: [{ filename: { equals: seed.imageFile } }, { tenant: { equals: tenantId } }],
    },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) return existing.docs[0].id

  const created = await payload.create({
    collection: 'media',
    data: { alt: seed.imageAlt, tenant: tenantId },
    filePath: `${imagesDir.replace(/\/+$/, '')}/${seed.imageFile}`,
    overrideAccess: true,
  })
  payload.logger.info(`Uploaded media ${seed.imageFile} (id=${created.id})`)
  return created.id
}

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

  for (const seed of PROJECTS) {
    const imageId = await upsertImage(payload, tenant.id, seed)

    const base = {
      tenant: tenant.id,
      category: seed.category,
      year: seed.year,
      stack: seed.stack,
      url: seed.url,
      order: seed.order,
      ...(imageId ? { image: imageId } : {}),
    }

    const found = await payload.find({
      collection: 'projects',
      where: { and: [{ url: { equals: seed.url } }, { tenant: { equals: tenant.id } }] },
      limit: 1,
      overrideAccess: true,
    })

    let id = found.docs[0]?.id
    if (id) {
      await payload.update({
        collection: 'projects',
        id,
        locale: 'en',
        data: {
          ...base,
          title: seed.title.en,
          description: seed.description.en,
          features: toFeatureRows(seed.features.en),
        },
        overrideAccess: true,
      })
      payload.logger.info(`Updated project ${seed.url} (id=${id})`)
    } else {
      const created = await payload.create({
        collection: 'projects',
        locale: 'en',
        data: {
          ...base,
          title: seed.title.en,
          description: seed.description.en,
          features: toFeatureRows(seed.features.en),
        },
        overrideAccess: true,
      })
      id = created.id
      payload.logger.info(`Created project ${seed.url} (id=${id})`)
    }

    for (const locale of ['ru', 'cs'] as const) {
      await payload.update({
        collection: 'projects',
        id,
        locale,
        data: {
          title: seed.title[locale],
          description: seed.description[locale],
          features: toFeatureRows(seed.features[locale]),
        },
        overrideAccess: true,
      })
    }
    payload.logger.info(`Localized ${seed.url} (ru, cs)`)
  }

  process.exit(0)
}

// Top-level await: the payload CLI exits as soon as module evaluation
// finishes, so a floating run().catch(...) would be cut short silently.
try {
  await run()
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
}
