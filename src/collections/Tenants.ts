import type { CollectionConfig } from 'payload'

/**
 * Each Tenant is a separate project/client. Content collections are scoped to a
 * tenant by the multi-tenant plugin, so one Payload instance serves N isolated
 * projects. Super-admins (Users.isSuperAdmin) see every tenant; regular users
 * only see the tenants they are assigned to.
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable identifier used by the frontend, e.g. "tatushka".',
      },
    },
    {
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Optional custom domain for this tenant (e.g. tzhk.dev).',
      },
    },
  ],
}
