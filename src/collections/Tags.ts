import type { CollectionConfig } from 'payload'

import { createTenantDocument } from '../access/createTenantDocument'

/**
 * Reusable tag taxonomy, scoped per tenant by the multi-tenant plugin.
 *
 * Tags are normalized records (one tag = one row) rather than free-text, so they
 * can be renamed in one place, filtered on, and reused across a tenant's media.
 * `name` is localized (display label); `slug` is the stable, locale-independent
 * id used for filtering and gallery URLs. `kind` optionally namespaces a tag
 * (category / material / colour …) so one engine covers several axes.
 */
export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Tag', plural: 'Tags' },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'slug', 'kind'],
  },
  access: {
    // Public read so the decoupled frontend can build/filter galleries by tag.
    // The multi-tenant plugin still scopes the admin views to the user's tenant.
    read: () => true,
    create: createTenantDocument,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Display label, e.g. «Шапки» / «Hats».' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Stable id for filtering/URLs, e.g. "hats". Lowercase, no spaces.',
      },
    },
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'category',
      options: [
        { label: 'Category', value: 'category' },
        { label: 'Material', value: 'material' },
        { label: 'Colour', value: 'colour' },
        { label: 'Technique', value: 'technique' },
        { label: 'Other', value: 'other' },
      ],
      admin: { description: 'Optional namespace so one tag engine can cover several axes.' },
    },
    {
      // Reverse relationship: every image tagged with this tag. Read-only,
      // virtual (no DB column / migration) — handy for managing the library.
      name: 'media',
      type: 'join',
      collection: 'media',
      on: 'tags',
      admin: { description: 'All images tagged with this tag.' },
    },
  ],
}
