import { postgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tenants } from './collections/Tenants'
import { Portfolio } from './collections/Portfolio'
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

export default buildConfig({
  ...(serverURL ? { serverURL } : {}),
  cors: allowedOrigins.length ? allowedOrigins : undefined,
  csrf: allowedOrigins.length ? allowedOrigins : undefined,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Tenants, Portfolio, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
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
        portfolio: {},
        media: {},
      },
      // Super-admins can switch between and manage every tenant.
      userHasAccessToAllTenants: (user) => Boolean(user?.isSuperAdmin),
    }),
  ],
})
