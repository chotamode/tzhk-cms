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
  access: {
    // Public read: the decoupled frontend resolves its tenant by slug
    // (GET /api/tenants?where[slug][equals]=...) UNAUTHENTICATED before it can
    // fetch siteContent/portfolio. Without this, Payload's default read
    // (Boolean(req.user)) returns 403 for the anonymous site request and the
    // whole content fetch silently falls back to bundled copy.
    //
    // This survives the multi-tenant plugin: withTenantAccess only adds the
    // "assigned tenants" constraint for a logged-in admin user — for an
    // anonymous request it returns this function's result (true) unchanged.
    // Tenant rows only expose name/slug/domain; if that listing must stay
    // private, drop this and give the frontend an API-key user token instead.
    read: () => true,
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
