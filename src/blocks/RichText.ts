import type { Block } from 'payload'

/** Generic rich-text section, for any prose that doesn't fit a specific block. */
export const RichText: Block = {
  slug: 'richText',
  labels: { singular: 'Text', plural: 'Text sections' },
  fields: [{ name: 'body', type: 'richText', localized: true }],
}
