import type { CollectionConfig } from 'payload'

import { createTenantDocument } from '../access/createTenantDocument'

/**
 * Self-hosted / built tools showcased on the portfolio, scoped per tenant.
 *
 * Consumed by the portfolio frontend (axon-portfolio) via REST: it expects
 * `name`, `description`, `url`, `free`, sorted by `order`. The portfolio hides
 * the whole Tools section until at least one real tool is published here.
 */
export const Tools: CollectionConfig = {
  slug: 'tools',
  labels: { singular: 'Tool', plural: 'Tools' },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'free', 'order'],
  },
  defaultSort: 'order',
  access: {
    // Public read: the decoupled frontends fetch tools anonymously.
    read: () => true,
    create: createTenantDocument,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'What the tool does and who it is for.' },
    },
    { name: 'url', type: 'text', admin: { description: 'Link to the tool (optional).' } },
    {
      name: 'free',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Shown with a "free" badge on the portfolio.' },
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
