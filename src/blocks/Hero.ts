import type { Block } from 'payload'

/**
 * Hero section — the large headline + call-to-action at the top of a page.
 * `image` is an optional background. Localized text varies per locale; the
 * block's presence/order is shared across locales.
 */
export const Hero: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Hero sections' },
  fields: [
    { name: 'title', type: 'text', localized: true },
    { name: 'subtitle', type: 'textarea', localized: true },
    { name: 'ctaLabel', type: 'text', localized: true },
    {
      name: 'ctaHref',
      type: 'text',
      admin: { description: 'Where the button links, e.g. /examples or a full URL.' },
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
