import { describe, expect, it } from 'vitest'
import { serializeAvailabilityQuery } from './serialization'

describe('availability query serialization', () => {
  it('serializes bookableType, bookableId, date and durationMinutes', () => {
    expect(serializeAvailabilityQuery({ bookableType: 'SPACE', bookableId: 'room-a', date: '2026-08-27', durationMinutes: 90 })).toBe('bookableType=SPACE&bookableId=room-a&date=2026-08-27&durationMinutes=90')
  })
})
