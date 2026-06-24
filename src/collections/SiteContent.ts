import type { CollectionConfig } from 'payload'

import { createTenantDocument } from '../access/createTenantDocument'

/**
 * Editable site content (texts, contacts, SEO) for a tenant's landing page.
 *
 * Registered with the multi-tenant plugin as `isGlobal: true`, so it behaves as
 * a single per-tenant document: each client edits *their* homepage copy, the
 * frontend fetches the one row for its tenant. Text fields are localized
 * (en/cs/ru). Drafts are enabled so edits can be previewed before publishing.
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
      type: 'group',
      name: 'hero',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'subtitle', type: 'text', localized: true },
      ],
    },
    {
      type: 'group',
      name: 'about',
      fields: [
        { name: 'heading', type: 'text', localized: true },
        { name: 'body', type: 'richText', localized: true },
      ],
    },
    {
      type: 'group',
      name: 'cta',
      fields: [{ name: 'label', type: 'text', localized: true }],
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
