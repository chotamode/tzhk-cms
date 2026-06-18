import type { CollectionConfig } from 'payload'

import { createTenantDocument } from '../access/createTenantDocument'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Public read so the (decoupled) frontend can load uploaded files.
    read: () => true,
    // Tenant users can only upload into their own tenant.
    create: createTenantDocument,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
