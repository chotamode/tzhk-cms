import type { Access } from 'payload'

import { getUserTenantIDs } from '@payloadcms/plugin-multi-tenant/utilities'

import { isSuperAdmin } from './isSuperAdmin'

/**
 * Create-access for tenant-scoped content collections.
 *
 * The multi-tenant plugin already scopes read/update/delete with a `where`
 * filter on the user's tenants — but `create` cannot be expressed as a filter,
 * so by default a tenant user can create a document and assign it to *another*
 * tenant (verified). This validates that the requested `tenant` is one the user
 * actually belongs to. Super-admins may create in any tenant.
 */
export const createTenantDocument: Access = ({ data, req }) => {
  const { user } = req
  if (!user) return false
  if (isSuperAdmin(user)) return true

  const allowedTenantIDs = getUserTenantIDs(user)
  if (allowedTenantIDs.length === 0) return false

  // `tenant` may arrive as an ID or as a populated relationship object.
  const requested = data?.tenant
  const requestedID =
    requested && typeof requested === 'object' ? (requested as { id: unknown }).id : requested
  if (requestedID == null) return false

  return allowedTenantIDs.map(String).includes(String(requestedID))
}
