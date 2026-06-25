import type { Block } from 'payload'

/** Free-form "about me" section: a heading + rich-text body. */
export const About: Block = {
  slug: 'about',
  labels: { singular: 'About', plural: 'About sections' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'body', type: 'richText', localized: true },
  ],
}
