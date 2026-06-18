import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email + password added by default.
    {
      name: 'isSuperAdmin',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Super-admins can access and manage every tenant.',
      },
    },
    // The `tenants` array field is injected automatically by the
    // multi-tenant plugin (includeDefaultField defaults to true).
  ],
  versions: false,
}
