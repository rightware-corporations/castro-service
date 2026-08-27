import { describe, expect, it } from 'vitest'
import { mapAvailabilitySlotDto, mapCourseDto, mapServiceDto } from './mappers'

describe('DTO to domain mappings', () => {
  it('maps service and course DTOs without changing validated fields', () => {
    expect(mapServiceDto({ slug: 'service-slug', name: 'Service name', summary: 'Summary' })).toEqual({ slug: 'service-slug', name: 'Service name', summary: 'Summary' })
    expect(mapCourseDto({ slug: 'course-slug', name: 'Course name' })).toEqual({ slug: 'course-slug', name: 'Course name', summary: undefined })
  })

  it('maps backend availability status to the frontend domain vocabulary', () => {
    expect(mapAvailabilitySlotDto({ start: '2026-08-27T09:00:00Z', end: '2026-08-27T10:00:00Z', status: 'AVAILABLE' })).toEqual({ start: '2026-08-27T09:00:00Z', end: '2026-08-27T10:00:00Z', status: 'available' })
    expect(mapAvailabilitySlotDto({ start: '2026-08-27T09:00:00Z', end: '2026-08-27T10:00:00Z', status: 'BOOKED' }).status).toBe('booked')
  })
})
