import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Seed (idempotently) a tenant + a tenant-scoped admin user.
 *
 * Usage:
 *   pnpm seed:tenant --name "Tatushkiii" --slug tatushka \
 *     --email artist@example.com --password 'secret'
 *
 * Flags fall back to SEED_* env vars, then to sane defaults for name/slug.
 * Re-running is safe: an existing tenant (by slug) or user (by email) is
 * reused, never duplicated.
 *
 * Note: needs DB access + the Payload CLI, so run it locally (or in a dev
 * container) with DATABASE_URI pointing at the target database. The slim
 * production image has no Payload CLI — for a one-off there, just use the
 * admin UI (Tenants → Create, then Users → Create assigned to that tenant).
 */

const arg = (flag: string): string | undefined => {
  const i = process.argv.indexOf(`--${flag}`)
  return i !== -1 ? process.argv[i + 1] : undefined
}

const name = arg('name') || process.env.SEED_TENANT_NAME || 'Tatushkiii'
const slug = arg('slug') || process.env.SEED_TENANT_SLUG || 'tatushka'
const email = arg('email') || process.env.SEED_USER_EMAIL
const password = arg('password') || process.env.SEED_USER_PASSWORD

const run = async (): Promise<void> => {
  if (!email || !password) {
    throw new Error(
      'Provide --email and --password (or SEED_USER_EMAIL / SEED_USER_PASSWORD).',
    )
  }

  const payload = await getPayload({ config })

  // --- Tenant (matched by its unique slug) ---
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
      data: { name, slug },
      overrideAccess: true,
    }))

  payload.logger.info(`Tenant "${tenant.name}" (slug=${slug}) id=${tenant.id}`)

  // --- User (matched by email) ---
  const foundUser = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })

  if (foundUser.docs[0]) {
    payload.logger.info(
      `User ${email} already exists (id=${foundUser.docs[0].id}); left unchanged.`,
    )
  } else {
    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        isSuperAdmin: false,
        tenants: [{ tenant: tenant.id }],
      },
      overrideAccess: true,
    })
    payload.logger.info(`Created tenant-admin ${email} (id=${user.id}) → tenant "${slug}"`)
  }

  process.exit(0)
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
