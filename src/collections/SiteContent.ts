import type { CollectionConfig } from 'payload'

import { layoutBlocks } from '../blocks'
import { createTenantDocument } from '../access/createTenantDocument'

/**
 * Editable site content for a tenant.
 *
 * Registered with the multi-tenant plugin as `isGlobal: true`, so it behaves as
 * a single per-tenant document: each client edits *their* site, the frontend
 * fetches the one row for its tenant. Drafts are enabled so edits can be
 * previewed before publishing.
 *
 * The page itself is a **block builder** (`layout`): each tenant composes its
 * page from a shared palette of sections (Hero, About, Gallery, Products, FAQ,
 * Reviews, Text) instead of a fixed set of fields. This keeps one schema across
 * structurally different sites without site-specific fields leaking between
 * tenants. The cross-cutting site settings (contacts, socials, SEO) stay as
 * fixed fields because they belong to the site as a whole, not to a section.
 */
export const SiteContent: CollectionConfig = {
  slug: 'siteContent',
  labels: {
    singular: 'Site content',
    plural: 'Site content',
  },
  admin: {
    useAsTitle: 'internalTitle',
    group: 'Content',
  },
  access: {
    // Public read so the decoupled frontend can fetch it.
    read: () => true,
    // Tenant users may only create within their own tenant.
    create: createTenantDocument,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'internalTitle',
      type: 'text',
      defaultValue: 'Homepage',
      admin: {
        description: 'Internal label only (not shown on the site).',
        position: 'sidebar',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      labels: { singular: 'Section', plural: 'Page sections' },
      blocks: layoutBlocks,
      admin: {
        description: 'Build the page from sections, in display order. Add only what this site needs.',
      },
    },
    {
      type: 'group',
      name: 'contacts',
      fields: [
        { name: 'telegram', type: 'text' },
        { name: 'whatsapp', type: 'text' },
        { name: 'email', type: 'email' },
      ],
    },
    {
      name: 'socials',
      type: 'array',
      labels: { singular: 'Social link', plural: 'Social links' },
      fields: [
        { name: 'platform', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      type: 'group',
      name: 'seo',
      fields: [
        { name: 'metaTitle', type: 'text', localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
