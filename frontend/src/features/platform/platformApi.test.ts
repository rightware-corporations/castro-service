import { describe, expect, it } from 'vitest'
import { mapPlatformSession } from './platformApi'

describe('platform session mapping', () => {
  it('keeps the platform identity outside tenant membership', () => {
    const session = mapPlatformSession({
      email: 'admin@rightware.test',
      authenticated: true,
      organizationId: null,
      firstName: 'RIGHTWARE',
      lastName: 'Admin',
      experienceType: null,
      permissions: ['platform.admin'],
    })

    expect(session.authenticated).toBe(true)
    expect(session.identityKind).toBe('PLATFORM')
    expect(session.organizationId).toBeUndefined()
    expect(session.experienceType).toBeUndefined()
    expect(session.permissions).toEqual(['platform.admin'])
    expect(session.displayName).toBe('RIGHTWARE Admin')
  })
})
