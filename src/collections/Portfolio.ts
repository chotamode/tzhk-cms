import type { CollectionConfig } from 'payload'

/**
 * Example tenant-scoped content collection. The multi-tenant plugin adds a
 * `tenant` relationship field automatically (see payload.config.ts), so every
 * row belongs to exactly one project. Text fields are localized (en/cs/ru).
 */
export const Portfolio: CollectionConfig = {
  slug: 'portfolio',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'category', 'tenant'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      options: ['ornamental', 'lineWork', 'abstract', 'whipShading', 'freehand'],
    },
    {
      name: 'sort',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
