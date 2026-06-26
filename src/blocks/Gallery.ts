import type { Block } from 'payload'

/**
 * Works gallery («Примеры работ» / portfolio).
 *
 * Two sources:
 *  - `curated` — the editor hand-picks media into `items` (display order = list
 *    order).
 *  - `byTags` — the gallery auto-shows every media tagged with `filterTags`,
 *    so it grows as new tagged images are uploaded (no editing the block).
 *
 * Tags themselves live on `Media` (the single source of truth), so in both
 * modes the frontend can render a tag-filter bar from the images on show.
 */
export const Gallery: Block = {
  slug: 'gallery',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'curated',
      options: [
        { label: 'Hand-picked images', value: 'curated' },
        { label: 'All images with tags', value: 'byTags' },
      ],
      admin: { description: 'Pick images by hand, or show everything matching tags.' },
    },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Work', plural: 'Works' },
      admin: {
        description: 'Shown in order; drag to reorder.',
        condition: (_, siblingData) => siblingData?.source !== 'byTags',
      },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'label', type: 'text', localized: true },
      ],
    },
    {
      name: 'filterTags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: 'Show every image tagged with any of these.',
        condition: (_, siblingData) => siblingData?.source === 'byTags',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 24,
      min: 1,
      admin: {
        description: 'Max images to show (byTags mode).',
        condition: (_, siblingData) => siblingData?.source === 'byTags',
      },
    },
  ],
}
