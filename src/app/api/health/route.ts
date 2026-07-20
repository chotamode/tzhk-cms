import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Uptime Kuma should point here, not at "/" — the admin UI can render its
// shell even if Postgres is unreachable, hiding a real outage. This route
// forces an actual DB round-trip so a broken database shows up as a failed
// check instead of a silent 200. Global (not tenant-scoped): if Postgres is
// down, it's down for every tenant this CMS serves.
export const GET = async () => {
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.find({ collection: 'media', limit: 1, depth: 0 })
    return Response.json({ status: 'ok', db: 'up' }, { status: 200 })
  } catch (error) {
    return Response.json(
      { status: 'error', db: 'down', message: error instanceof Error ? error.message : 'unknown' },
      { status: 503 },
    )
  }
}
