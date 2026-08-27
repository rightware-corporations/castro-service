import type { BookingTarget } from './index'

export type PublicConfig = {
  brandName?: string
  locale?: string
}

export type Service = {
  slug: string
  name: string
  summary?: string
}

export type Course = {
  slug: string
  name: string
  summary?: string
}

export type CourseSession = {
  id: string
  courseSlug: string
  startsAt: string
  endsAt: string
}

export type Space = {
  slug: string
  name: string
  summary?: string
}

export type AvailabilityStatus = 'available' | 'booked'

export type AvailabilitySlot = {
  start: string
  end: string
  status: AvailabilityStatus
}

export type AvailabilityQuery = {
  bookableType: BookingTarget
  bookableId: string
  date: string
  durationMinutes: number
}

export type BookingDraft = {
  bookableType: BookingTarget
  bookableId: string
  date: string
  start: string
  customerName?: string
  customerEmail?: string
}

export type BookingConfirmation = {
  reference: string
  status: string
}
