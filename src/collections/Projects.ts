import type { CollectionConfig } from 'payload'

import { createTenantDocument } from '../access/createTenantDocument'

/**
 * Portfolio case studies, scoped per tenant by the multi-tenant plugin.
 *
 * Consumed by the portfolio frontend (axon-portfolio) via REST: it expects
 * `title`, `description`, `category`, `year`, `stack`, `image`, `url`,
 * `features`, sorted by `order`. Text the visitor reads is localized;
 * `year`/`stack`/`url` are locale-independent facts.
 */
export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project', plural: 'Projects' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'category', 'year', 'order'],
  },
  defaultSort: 'order',
  access: {
    // Public read: the decoupled frontends fetch projects anonymously.
    read: () => true,
    create: createTenantDocument,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Card heading, e.g. «Tatushki · doomp.ink».' },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'A short paragraph about the project.' },
    },
    {
      // Bullet list of concrete capabilities shown under the description.
      name: 'features',
      type: 'array',
      localized: true,
      labels: { singular: 'Feature', plural: 'Features' },
      fields: [{ name: 'text', type: 'text', required: true }],
      admin: { description: 'Business/tech feature bullets, e.g. «Booking form → PostgreSQL + email».' },
    },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'client',
      options: [
        { label: 'Client', value: 'client' },
        { label: 'University', value: 'university' },
      ],
    },
    { name: 'year', type: 'text', admin: { description: 'e.g. "2025".' } },
    {
      name: 'stack',
      type: 'text',
      admin: { description: 'Tech stack line, e.g. "Next.js · Payload CMS · PostgreSQL".' },
    },
    { name: 'url', type: 'text', admin: { description: 'Live site URL (optional).' } },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Preview screenshot (4:3 works best).' },
    },
    {
      name: 'order',
      type: 'number',
      index: true,
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
  ],
}
