import type { Access, CollectionConfig } from 'payload'

import { isSuperAdmin } from '../access/isSuperAdmin'

// Only super-admins. Returns false for unauthenticated requests; the very first
// user is still creatable through the admin panel, which bypasses access.
const adminsOnly: Access = ({ req }) => isSuperAdmin(req.user)

// Super-admins can read/update everyone; everybody else is scoped to their own
// document (a tenant user can manage their own profile but not other users).
const selfOrSuperAdmin: Access = ({ req }) => {
  const { user } = req
  if (!user) return false
  if (isSuperAdmin(user)) return true
  return { id: { equals: user.id } }
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  // Without explicit access control any authenticated user could touch the
  // users collection. Lock it down following Payload's official multi-tenant
  // example.
  access: {
    create: adminsOnly,
    read: selfOrSuperAdmin,
    update: selfOrSuperAdmin,
    delete: adminsOnly,
  },
  fields: [
    // Email + password added by default.
    {
      name: 'isSuperAdmin',
      type: 'checkbox',
      defaultValue: false,
      access: {
        // CRITICAL: only a super-admin may grant/revoke super-admin. Without
        // this a regular user can promote themselves via the API (verified).
        // Field-level create is unrestricted, but only super-admins can create
        // users at all, so that path is already closed.
        update: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        description: 'Super-admins can access and manage every tenant.',
      },
    },
    // The `tenants` array field is injected automatically by the
    // multi-tenant plugin (includeDefaultField defaults to true).
  ],
  versions: false,
}
