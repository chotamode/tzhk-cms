import type { Block } from 'payload'

/**
 * Works gallery («Примеры работ» / portfolio). An ordered list of images with
 * an optional caption and a free-form `tag` — the tag replaces the old
 * tattoo-specific `category` select, so the block is neutral across sites.
 */
export const Gallery: Block = {
  slug: 'gallery',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Work', plural: 'Works' },
      admin: { description: 'Shown in order; drag to reorder.' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'label', type: 'text', localized: true },
        {
          name: 'tag',
          type: 'text',
          localized: true,
          admin: { description: 'Optional free-form label/category, e.g. «Шапки».' },
        },
      ],
    },
  ],
}
