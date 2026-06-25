import type { Endpoint, PayloadRequest } from 'payload'

import { importContent, mimeFromName, type ContentFile, type ImageUpload } from '../lib/importContent'

/**
 * Admin "Import content" endpoint — POST /api/import-content.
 *
 * Accepts multipart/form-data:
 *   - content : the content.json file (texts + portfolio structure)
 *   - images  : zero or more image files referenced by name in content.json
 *
 * Runs the same idempotent upsert as the CLI seeder. Super-admins may target the
 * tenant named in the file; everyone else is confined to their own tenant.
 */
export const importContentEndpoint: Endpoint = {
  path: '/import-content',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user) {
      return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    let formData: FormData
    try {
      formData = await req.formData!()
    } catch {
      return Response.json({ ok: false, error: 'Expected multipart/form-data.' }, { status: 400 })
    }

    const contentFile = formData.get('content')
    if (!(contentFile instanceof File)) {
      return Response.json({ ok: false, error: 'Missing "content" file (content.json).' }, { status: 400 })
    }
    let content: ContentFile
    try {
      content = JSON.parse(await contentFile.text())
    } catch {
      return Response.json({ ok: false, error: 'content.json is not valid JSON.' }, { status: 400 })
    }

    // Index uploaded images by filename (and basename, to tolerate "images/x").
    const images = new Map<string, ImageUpload>()
    for (const value of formData.getAll('images')) {
      if (value instanceof File) {
        // Trust the browser's type, but fall back to the extension when it's
        // missing or generic (some clients send application/octet-stream).
        const generic = !value.type || value.type === 'application/octet-stream'
        const upload: ImageUpload = {
          data: Buffer.from(await value.arrayBuffer()),
          name: value.name,
          mimetype: generic ? mimeFromName(value.name) : value.type,
          size: value.size,
        }
        images.set(value.name, upload)
        images.set(value.name.split('/').pop() as string, upload)
      }
    }

    // Tenant scoping: confine non-super-admins to their own tenant.
    const user = req.user as {
      isSuperAdmin?: boolean
      tenants?: Array<{ tenant?: number | string | { id: number | string } }>
    }
    let forceTenantId: number | string | undefined
    if (!user.isSuperAdmin) {
      const first = user.tenants?.[0]?.tenant
      const id = typeof first === 'object' && first !== null ? first.id : first
      if (id == null) {
        return Response.json({ ok: false, error: 'Your account is not linked to a tenant.' }, { status: 403 })
      }
      forceTenantId = id
    }

    try {
      const result = await importContent({
        payload: req.payload,
        content,
        forceTenantId,
        resolveImage: async (name) => {
          const img = images.get(name) ?? images.get(name.split('/').pop() as string)
          if (!img) throw new Error(`Image "${name}" referenced in content.json was not uploaded.`)
          return img
        },
        log: (m) => req.payload.logger.info(`[import-content] ${m}`),
      })
      return Response.json({ ok: true, ...result })
    } catch (err) {
      req.payload.logger.error(err)
      return Response.json({ ok: false, error: (err as Error).message }, { status: 400 })
    }
  },
}
