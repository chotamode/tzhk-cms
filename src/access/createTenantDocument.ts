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

  // No tenant in the payload yet. This is the access check Payload runs to gate
  // the admin "create" view (called without `data`) — and for `isGlobal`
  // tenant collections that view is reached directly, so returning false here
  // locks tenant users out entirely. Allow it for users who belong to a tenant;
  // the real create is re-checked below with the submitted `data`, so assigning
  // to a foreign tenant is still rejected at write time.
  if (requestedID == null) return true

  return allowedTenantIDs.map(String).includes(String(requestedID))
}
