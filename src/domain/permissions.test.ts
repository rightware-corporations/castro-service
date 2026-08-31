import { describe, expect, it } from 'vitest'
import { createCan } from './permissions'

describe('createCan', () => {
  it('returns true only for permissions present in the separate backend-driven permission context', () => {
    const can = createCan({ permissions: new Set(['dashboard.read', 'booking.read']) })

    expect(can('dashboard.read')).toBe(true)
    expect(can('booking.read')).toBe(true)
    expect(can('settings.manage')).toBe(false)
  })

  it('denies all permissions when permission context is unavailable', () => {
    const can = createCan(null)
    expect(can('dashboard.read')).toBe(false)
  })
})
