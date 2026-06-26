import type { Block } from 'payload'

/** Customer reviews: author, text, and an optional 1–5 rating. */
export const Reviews: Block = {
  slug: 'reviews',
  labels: { singular: 'Reviews', plural: 'Review sections' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Review', plural: 'Reviews' },
      fields: [
        { name: 'author', type: 'text' },
        { name: 'text', type: 'textarea', localized: true, required: true },
        { name: 'rating', type: 'number', min: 1, max: 5 },
      ],
    },
  ],
}
