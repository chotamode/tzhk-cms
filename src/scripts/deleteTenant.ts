import config from '@payload-config'
import { getPayload } from 'payload'
import type { CollectionSlug, Payload } from 'payload'

/**
 * Delete a tenant AND all of its tenant-scoped documents.
 *
 * Usage:
 *   pnpm payload run src/scripts/deleteTenant.ts -- --slug alfaag
 *
 * The multi-tenant plugin's own cascade is disabled (cleanupAfterTenantDelete:
 * false — it stalls), and a bare tenant delete leaves orphaned docs with a
 * null tenant. This script deletes the docs first — media deletions also
 * remove the underlying files from S3/R2 — then the tenant itself.
 *
 * Users are left untouched (they may belong to other tenants); their
 * membership rows for the deleted tenant are cleaned up by the DB FKs.
 */

const arg = (flag: string): string | undefined => {
  const i = process.argv.indexOf(`--${flag}`)
  return i !== -1 ? process.argv[i + 1] : undefined
}

const slug = arg('slug') || process.env.DELETE_TENANT_SLUG
if (!slug) throw new Error('Provide --slug <tenant-slug> (or DELETE_TENANT_SLUG).')

// Every collection registered with the multi-tenant plugin.
const TENANT_COLLECTIONS: CollectionSlug[] = ['media', 'tags', 'siteContent', 'projects', 'tools']

const deleteTenantDocs = async (
  payload: Payload,
  collection: CollectionSlug,
  tenantId: number | string,
): Promise<number> => {
  const { docs } = await payload.find({
    collection,
    where: { tenant: { equals: tenantId } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })
  // One by one (not deleteMany) so upload hooks run and S3/R2 files are removed.
  for (const doc of docs) {
    await payload.delete({ collection, id: doc.id, depth: 0, overrideAccess: true })
  }
  return docs.length
}

const run = async (): Promise<void> => {
  const payload = await getPayload({ config })

  const tenants = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  const tenant = tenants.docs[0]
  if (!tenant) throw new Error(`Tenant "${slug}" not found.`)

  payload.logger.info(`Deleting tenant "${tenant.name}" (slug=${slug}, id=${tenant.id})…`)

  for (const collection of TENANT_COLLECTIONS) {
    const n = await deleteTenantDocs(payload, collection, tenant.id)
    if (n > 0) payload.logger.info(`  ${collection}: deleted ${n} doc(s)`)
  }

  // Remove this tenant from users' membership arrays — users_tenants.tenant_id
  // is NOT NULL, so the row would otherwise block the tenant delete. The users
  // themselves are kept (they may belong to other tenants).
  const members = await payload.find({
    collection: 'users',
    where: { 'tenants.tenant': { equals: tenant.id } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })
  for (const user of members.docs) {
    const remaining = (user.tenants ?? []).filter((row) => {
      const id = typeof row.tenant === 'object' && row.tenant ? row.tenant.id : row.tenant
      return String(id) !== String(tenant.id)
    })
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { tenants: remaining },
      depth: 0,
      overrideAccess: true,
    })
    payload.logger.info(`  users: removed membership from ${user.email}`)
  }

  await payload.delete({ collection: 'tenants', id: tenant.id, overrideAccess: true })
  payload.logger.info(`Tenant "${slug}" deleted.`)
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
