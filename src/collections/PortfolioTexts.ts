import type { CollectionConfig } from 'payload'

import { createTenantDocument } from '../access/createTenantDocument'

/**
 * Editable site copy for the portfolio frontend (axon-portfolio), one document
 * per tenant (isGlobal via the multi-tenant plugin).
 *
 * The frontend deep-merges these values over its bundled i18n catalog
 * (messages/*.json), so every field is optional: an empty field simply keeps
 * the built-in text. Structure mirrors the message namespaces the Cross layout
 * actually renders; UI chrome labels stay in the frontend bundle.
 */
export const PortfolioTexts: CollectionConfig = {
  slug: 'portfolioTexts',
  labels: { singular: 'Portfolio texts', plural: 'Portfolio texts' },
  admin: {
    group: 'Content',
    description: 'Site copy for the portfolio. Empty fields fall back to the built-in text.',
  },
  access: {
    // Public read: the decoupled frontend fetches copy anonymously.
    read: () => true,
    create: createTenantDocument,
  },
  fields: [
    {
      name: 'meta',
      type: 'group',
      admin: { description: 'Browser tab / search snippet / social preview.' },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          admin: { description: 'Page <title>. "{brand}" is replaced with the brand name.' },
        },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'hero',
      type: 'group',
      admin: { description: 'Home panel.' },
      fields: [
        { name: 'lead', type: 'text', localized: true, admin: { description: 'Kicker line above the headline.' } },
        { name: 'headline', type: 'text', localized: true },
        { name: 'sub', type: 'text', localized: true },
        { name: 'cta', type: 'text', localized: true, admin: { description: 'Third button label (opens contact).' } },
      ],
    },
    {
      name: 'work',
      type: 'group',
      admin: { description: 'Work panel heading (the cases themselves live in Projects).' },
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'subtitle', type: 'text', localized: true },
      ],
    },
    {
      name: 'services',
      type: 'group',
      admin: { description: 'Services panel.' },
      fields: [
        { name: 'title', type: 'text', localized: true },
        {
          name: 'items',
          type: 'array',
          localized: true,
          labels: { singular: 'Service', plural: 'Services' },
          fields: [
            { name: 't', type: 'text', required: true, label: 'Title' },
            { name: 'd', type: 'text', required: true, label: 'Description' },
          ],
        },
        { name: 'academicTitle', type: 'text', localized: true },
        { name: 'academicLead', type: 'textarea', localized: true },
        {
          name: 'academicItems',
          type: 'array',
          localized: true,
          labels: { singular: 'Item', plural: 'Items' },
          fields: [{ name: 'text', type: 'text', required: true }],
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      admin: { description: 'Contact panel heading (channels/env-driven values stay on the site).' },
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'lead', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      fields: [{ name: 'tagline', type: 'text', localized: true }],
    },
  ],
}
