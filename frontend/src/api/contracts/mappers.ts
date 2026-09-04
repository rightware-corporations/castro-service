import type { AvailabilitySlotDto, CourseDto, CourseSessionDto, PublicConfigDto, ServiceDto, SpaceDto } from './index'
import type { AvailabilitySlot, BookingConfirmationMode, Course, CourseSession, PublicConfig, Service, Space } from '../../domain/models'

type ExtendedPublicConfigDto = PublicConfigDto & { contactPhone?: string | null; whatsappNumber?: string | null; contactEmail?: string | null }
type ExtendedServiceDto = ServiceDto & { confirmationMode?: BookingConfirmationMode | null }
type ExtendedSpaceDto = SpaceDto & { bookingEnabled?: boolean | null; confirmationMode?: BookingConfirmationMode | null }

export const mapPublicConfigDto = (dto: PublicConfigDto): PublicConfig => {
  const value = dto as ExtendedPublicConfigDto
  return {
    businessTimezone: dto.businessTimezone,
    contactPhone: value.contactPhone ?? undefined,
    whatsappNumber: value.whatsappNumber ?? undefined,
    contactEmail: value.contactEmail ?? undefined,
  }
}

export const mapServiceDto = (dto: ServiceDto): Service => {
  const value = dto as ExtendedServiceDto
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    summary: dto.description ?? undefined,
    description: dto.description ?? undefined,
    durationMinutes: dto.durationMinutes ?? undefined,
    bookingEnabled: dto.bookingEnabled ?? undefined,
    confirmationMode: value.confirmationMode ?? undefined,
  }
}

export const mapCourseDto = (dto: CourseDto): Course => {
  const course: Course = {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    summary: dto.shortDescription ?? dto.description ?? undefined,
    description: dto.description ?? undefined,
  }
  if (dto.modality != null) course.modality = dto.modality
  if (dto.durationLabel != null) course.durationLabel = dto.durationLabel
  if (dto.scheduleSummary != null) course.scheduleSummary = dto.scheduleSummary
  if (dto.investmentAmount != null) course.investmentAmount = dto.investmentAmount
  if (dto.investmentCurrency != null) course.investmentCurrency = dto.investmentCurrency
  if (dto.certificateIncluded != null) course.certificateIncluded = dto.certificateIncluded
  if (dto.contactPhone != null) course.contactPhone = dto.contactPhone
  if (dto.learningOutcomes != null) course.learningOutcomes = dto.learningOutcomes
  if (dto.featured != null) course.featured = dto.featured
  return course
}

export const mapCourseSessionDto = (dto: CourseSessionDto): CourseSession => {
  const session: CourseSession = { id: dto.id, startAt: dto.startAt, endAt: dto.endAt }
  if (dto.label != null) session.label = dto.label
  return session
}

export const mapSpaceDto = (dto: SpaceDto): Space => {
  const value = dto as ExtendedSpaceDto
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    summary: dto.description ?? undefined,
    description: dto.description ?? undefined,
    location: dto.location ?? undefined,
    capacityMin: dto.capacityMin ?? undefined,
    capacityMax: dto.capacityMax ?? undefined,
    bookingEnabled: value.bookingEnabled ?? undefined,
    confirmationMode: value.confirmationMode ?? undefined,
  }
}

export function mapAvailabilitySlotDto(dto: AvailabilitySlotDto): AvailabilitySlot {
  return { start: dto.start, end: dto.end, status: dto.status === 'AVAILABLE' ? 'available' : 'booked' }
}
