import type { User } from '../payload-types'

/**
 * A super-admin can access and manage every tenant. Mirrors the role check in
 * Payload's official multi-tenant example, adapted to our boolean field.
 */
export const isSuperAdmin = (user: Pick<User, 'isSuperAdmin'> | null | undefined): boolean =>
  Boolean(user?.isSuperAdmin)
