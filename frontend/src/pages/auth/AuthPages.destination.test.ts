import { describe, expect, it } from 'vitest'
import { authenticatedDestination } from './AuthPages'
import type { AuthSession } from '../../domain'

const session = (experienceType: AuthSession['experienceType']): AuthSession => ({ authenticated: true, experienceType })

describe('authenticatedDestination', () => {
  it('routes the CEO/Owner into the executive experience', () => {
    expect(authenticatedDestination(session('OWNER'))).toBe('/owner')
    expect(authenticatedDestination(session('OWNER'), '/owner/agenda?week=next')).toBe('/owner/agenda?week=next')
  })

  it('does not preserve an operations route for an owner', () => {
    expect(authenticatedDestination(session('OWNER'), '/app/reservas')).toBe('/owner')
  })

  it('routes operations users into the secretary workspace', () => {
    expect(authenticatedDestination(session('OPERATIONS'))).toBe('/app/dashboard')
    expect(authenticatedDestination(session('OPERATIONS'), '/app/reservas/123')).toBe('/app/reservas/123')
  })

  it('does not preserve an owner route for an operations user', () => {
    expect(authenticatedDestination(session('OPERATIONS'), '/owner/clientes')).toBe('/app/dashboard')
  })

  it('routes the RIGHTWARE platform administrator to the isolated control plane', () => {
    const platform: AuthSession = { authenticated: true, permissions: ['platform.admin'] }
    expect(authenticatedDestination(platform)).toBe('/platform')
    expect(authenticatedDestination(platform, '/app/dashboard')).toBe('/platform')
    expect(authenticatedDestination(platform, '/owner')).toBe('/platform')
  })
})
