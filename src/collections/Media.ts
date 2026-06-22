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
  upload: {
    // Accept images only.
    mimeTypes: ['image/*'],
    // Generate optimized, web-sized variants with sharp on upload. Keeps storage
    // small (we don't serve giant originals) and the frontend fast. The original
    // is still stored; the frontend should request a named size.
    imageSizes: [
      { name: 'thumbnail', width: 400, height: undefined, position: 'centre' },
      { name: 'card', width: 1024, height: undefined, position: 'centre' },
      { name: 'full', width: 2048, height: undefined, position: 'centre' },
    ],
    // Re-encode to modern formats to shrink files further.
    formatOptions: {
      format: 'webp',
      options: { quality: 80 },
    },
  },
}
