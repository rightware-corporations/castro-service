import { describe, expect, it } from 'vitest'
import { mapAvailabilitySlotDto, mapCourseDto, mapServiceDto, mapSpaceDto } from './mappers'

describe('DTO to domain mappings', () => {
  it('maps public catalog DTOs without inventing fields', () => {
    expect(mapServiceDto({ id: 'service-id', slug: 'service-slug', name: 'Service name', description: 'Description', durationMinutes: 60, bookingEnabled: true })).toEqual({
      id: 'service-id',
      slug: 'service-slug',
      name: 'Service name',
      summary: 'Description',
      description: 'Description',
      durationMinutes: 60,
      bookingEnabled: true,
    })
    expect(mapCourseDto({ id: 'course-id', slug: 'course-slug', name: 'Course name', description: 'Course description' })).toEqual({
      id: 'course-id',
      slug: 'course-slug',
      name: 'Course name',
      summary: 'Course description',
      description: 'Course description',
    })
    expect(mapSpaceDto({ id: 'space-id', slug: 'space-slug', name: 'Space name', description: 'Space description', location: 'Maputo', capacityMin: 10, capacityMax: 12 })).toEqual({
      id: 'space-id',
      slug: 'space-slug',
      name: 'Space name',
      summary: 'Space description',
      description: 'Space description',
      location: 'Maputo',
      capacityMin: 10,
      capacityMax: 12,
    })
  })

  it('maps backend availability status to the frontend domain vocabulary', () => {
    expect(mapAvailabilitySlotDto({ start: '09:00', end: '10:00', status: 'AVAILABLE' })).toEqual({ start: '09:00', end: '10:00', status: 'available' })
    expect(mapAvailabilitySlotDto({ start: '09:00', end: '10:00', status: 'BOOKED' }).status).toBe('booked')
  })
})
