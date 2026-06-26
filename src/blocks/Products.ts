import type { Block } from 'payload'

/**
 * Product showcase. Today it's a витрина (image + title + price), but `price` is
 * a number and `currency`/`available` are modelled so a real shop can build on
 * the same data later without a schema change.
 */
export const Products: Block = {
  slug: 'products',
  labels: { singular: 'Products', plural: 'Product sections' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Product', plural: 'Products' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'description', type: 'textarea', localized: true },
        {
          name: 'price',
          type: 'number',
          min: 0,
          admin: { description: 'Numeric price (no symbol), e.g. 1500.' },
        },
        { name: 'currency', type: 'text', defaultValue: 'RUB' },
        {
          name: 'available',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'In stock / available to order.' },
        },
      ],
    },
  ],
}
