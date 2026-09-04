import { describe, expect, it } from 'vitest'
import { parseAppSurface, surfaceFallbackPath } from './surface'

describe('deployment surface policy', () => {
  it('accepts only the four supported build surface modes', () => {
    expect(parseAppSurface('public')).toBe('PUBLIC')
    expect(parseAppSurface('STAFF')).toBe('STAFF')
    expect(parseAppSurface('platform')).toBe('PLATFORM')
    expect(parseAppSurface('all')).toBe('ALL')
    expect(parseAppSurface('unknown')).toBe('ALL')
  })

  it('uses explicit safe fallbacks for staff and platform deployments', () => {
    expect(surfaceFallbackPath('STAFF')).toBe('/login')
    expect(surfaceFallbackPath('PLATFORM')).toBe('/platform/login')
    expect(surfaceFallbackPath('PUBLIC')).toBe('/')
  })
})
