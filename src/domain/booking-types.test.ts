import { describe, expect, it } from 'vitest'
import { isPublicBookableType, publicBookableTypes } from './index'

describe('public bookable types', () => {
  it('exposes only SERVICE, SPACE and COURSE_SESSION', () => {
    expect(publicBookableTypes).toEqual(['SERVICE', 'SPACE', 'COURSE_SESSION'])
    expect(isPublicBookableType('SERVICE')).toBe(true)
    expect(isPublicBookableType('SPACE')).toBe(true)
    expect(isPublicBookableType('COURSE_SESSION')).toBe(true)
    expect(isPublicBookableType('CONSULTATION')).toBe(false)
  })
})
