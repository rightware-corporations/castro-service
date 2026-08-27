import type { AvailabilitySlotDto, CourseDto, CourseSessionDto, PublicConfigDto, ServiceDto, SpaceDto } from './index'
import type { AvailabilitySlot, Course, CourseSession, PublicConfig, Service, Space } from '../../domain/models'

export const mapPublicConfigDto = (dto: PublicConfigDto): PublicConfig => ({ brandName: dto.brandName, locale: dto.locale })
export const mapServiceDto = (dto: ServiceDto): Service => ({ slug: dto.slug, name: dto.name, summary: dto.summary })
export const mapCourseDto = (dto: CourseDto): Course => ({ slug: dto.slug, name: dto.name, summary: dto.summary })
export const mapCourseSessionDto = (dto: CourseSessionDto): CourseSession => ({ id: dto.id, courseSlug: dto.courseSlug, startsAt: dto.startsAt, endsAt: dto.endsAt })
export const mapSpaceDto = (dto: SpaceDto): Space => ({ slug: dto.slug, name: dto.name, summary: dto.summary })

export function mapAvailabilitySlotDto(dto: AvailabilitySlotDto): AvailabilitySlot {
  return { start: dto.start, end: dto.end, status: dto.status === 'AVAILABLE' ? 'available' : 'booked' }
}
