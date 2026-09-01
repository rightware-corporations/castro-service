import { describe, expect, it } from 'vitest'
import { bookingConfirmationRoute, bookingRoute } from './routes'

describe('booking route generation', () => {
  it('keeps bookable type and id in every refresh-safe step route', () => {
    expect(bookingRoute('COURSE_SESSION', 'session 1', 'selection')).toBe('/reservar/COURSE_SESSION/session%201/data')
    expect(bookingRoute('SPACE', 'room-a', 'time')).toBe('/reservar/SPACE/room-a/horario')
    expect(bookingRoute('SERVICE', 'consulting', 'customer-details')).toBe('/reservar/SERVICE/consulting/dados')
    expect(bookingRoute('SPACE', 'room-a', 'review')).toBe('/reservar/SPACE/room-a/rever')
  })

  it('generates a reference-based confirmation route', () => {
    expect(bookingConfirmationRoute('CS-123 456')).toBe('/reservar/confirmacao/CS-123%20456')
  })
})
