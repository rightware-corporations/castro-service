import type { AvailabilitySlotDto, CourseDto, CourseSessionDto, PublicConfigDto, ServiceDto, SpaceDto } from './index'
import type { AvailabilitySlot, Course, CourseSession, PublicConfig, Service, Space } from '../../domain/models'

export const mapPublicConfigDto = (dto: PublicConfigDto): PublicConfig => ({ businessTimezone: dto.businessTimezone })

export const mapServiceDto = (dto: ServiceDto): Service => ({
  id: dto.id,
  slug: dto.slug,
  name: dto.name,
  summary: dto.description ?? undefined,
  description: dto.description ?? undefined,
  durationMinutes: dto.durationMinutes ?? undefined,
  bookingEnabled: dto.bookingEnabled ?? undefined,
})

export const mapCourseDto = (dto: CourseDto): Course => ({
  id: dto.id,
  slug: dto.slug,
  name: dto.name,
  summary: dto.description ?? undefined,
  description: dto.description ?? undefined,
})

export const mapCourseSessionDto = (dto: CourseSessionDto): CourseSession => ({
  id: dto.id,
  startAt: dto.startAt,
  endAt: dto.endAt,
})

export const mapSpaceDto = (dto: SpaceDto): Space => ({
  id: dto.id,
  slug: dto.slug,
  name: dto.name,
  summary: dto.description ?? undefined,
  description: dto.description ?? undefined,
  location: dto.location ?? undefined,
  capacityMin: dto.capacityMin ?? undefined,
  capacityMax: dto.capacityMax ?? undefined,
})

export function mapAvailabilitySlotDto(dto: AvailabilitySlotDto): AvailabilitySlot {
  return { start: dto.start, end: dto.end, status: dto.status === 'AVAILABLE' ? 'available' : 'booked' }
}
