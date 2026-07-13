import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import type { Plugin } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tenants } from './collections/Tenants'
import { Tags } from './collections/Tags'
import { Projects } from './collections/Projects'
import { Tools } from './collections/Tools'
import { PortfolioTexts } from './collections/PortfolioTexts'
import { SiteContent } from './collections/SiteContent'
import { importContentEndpoint } from './endpoints/importContent'
import { migrations } from './migrations'
import type { User } from './payload-types'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Public URL of this CMS (e.g. https://cms.tzhk.dev). Set via env so nothing
// is hardcoded; Coolify injects it from SERVICE_FQDN. Optional locally.
const serverURL = process.env.PAYLOAD_PUBLIC_SERVER_URL || ''

// Comma-separated list of frontend origins allowed to call the API
// (e.g. "https://tzhk.dev,https://www.tzhk.dev"). Defaults to the CMS origin.
const allowedOrigins = (process.env.CORS_ORIGINS || serverURL)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

// --- Media storage -------------------------------------------------------
// When S3/R2 credentials are present, store uploads in object storage so they
// survive container redeploys (the container filesystem is ephemeral). Without
// them we fall back to local disk, which is fine for local development only.
// Works with any S3-compatible provider; for Cloudflare R2 set S3_ENDPOINT to
// https://<account-id>.r2.cloudflarestorage.com and S3_REGION=auto.
//
// The plugin is ALWAYS registered (toggled via `enabled`) rather than
// conditionally pushed. This keeps its admin client component present in the
// importMap regardless of whether S3_* env is set when `generate:importmap`
// runs — otherwise a generation without S3_BUCKET silently drops the
// S3ClientUploadHandler and the production server warns it can't be found.
const storagePlugins: Plugin[] = [
  s3Storage({
    enabled: Boolean(process.env.S3_BUCKET),
    collections: { media: true },
    bucket: process.env.S3_BUCKET || '',
    config: {
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT,
      // Required for R2 / most non-AWS S3-compatible providers.
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
    },
  }),
]

// --- Email ---------------------------------------------------------------
// When SMTP settings are present, send real email (password resets, invites)
// through any SMTP server (managed or self-hosted). Without them Payload just
// logs emails to the console (fine for local dev).
const email = process.env.SMTP_HOST
  ? await nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM || 'no-reply@tzhk.dev',
      defaultFromName: process.env.EMAIL_FROM_NAME || 'TZHK',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        // true for port 465 (implicit TLS), false for 587/25 (STARTTLS).
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        auth:
          process.env.SMTP_USER || process.env.SMTP_PASS
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
      },
    })
  : undefined

export default buildConfig({
  ...(email ? { email } : {}),
  ...(serverURL ? { serverURL } : {}),
  cors: allowedOrigins.length ? allowedOrigins : undefined,
  csrf: allowedOrigins.length ? allowedOrigins : undefined,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      // "Import content" uploader shown on the admin dashboard.
      beforeDashboard: ['/components/ImportContent#default'],
    },
  },
  collections: [Users, Tenants, SiteContent, Media, Tags, Projects, Tools, PortfolioTexts],
  endpoints: [importContentEndpoint],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Run pending migrations automatically on boot in production. This is the
    // reliable way to create/upgrade the schema in the standalone Docker build:
    // `push` (dev schema sync) does NOT run in the production server, so without
    // this the tables are never created and /admin fails with "relation does
    // not exist". Generate new migrations with `pnpm payload migrate:create`.
    prodMigrations: migrations,
    // `push` only applies in dev (NODE_ENV !== production). Toggle off if you
    // prefer running `pnpm payload migrate` manually during local development.
    push: process.env.PAYLOAD_DB_PUSH !== 'false',
  }),
  sharp,
  localization: {
    locales: ['en', 'cs', 'ru'],
    fallback: true,
    defaultLocale: 'en',
  },
  plugins: [
    multiTenantPlugin<User>({
      // Collections whose documents belong to a single tenant.
      collections: {
        media: {},
        // Reusable per-tenant tag taxonomy (media tagging + gallery filtering).
        tags: {},
        // Portfolio case studies and showcased tools (axon-portfolio).
        projects: {},
        tools: {},
        // Portfolio site copy — one editable document per tenant.
        portfolioTexts: { isGlobal: true },
        // One editable document per tenant (landing-page content/texts/SEO +
        // the page sections, kept as a block builder on this single document).
        siteContent: { isGlobal: true },
      },
      // Super-admins can switch between and manage every tenant.
      userHasAccessToAllTenants: (user) => Boolean(user?.isSuperAdmin),
      // Don't run the plugin's afterDelete cascade when a tenant is removed.
      // That cleanup deletes every tenant-scoped doc (media/tags/siteContent)
      // + each media's storage file as nested ops, which stalls the delete
      // request indefinitely (it never returns, so nothing is logged). With
      // this off, deleting a tenant is instant; its docs are left with a null
      // tenant (the FK is ON DELETE SET NULL) and can be cleaned up separately.
      cleanupAfterTenantDelete: false,
    }),
    ...storagePlugins,
  ],
})
