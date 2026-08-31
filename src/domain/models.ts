import type { BookingTarget } from './index'

export type PublicConfig = {
  businessTimezone: string
}

export type Service = {
  id: string
  slug: string
  name: string
  summary?: string
  description?: string
  durationMinutes?: number
  bookingEnabled?: boolean
}

export type Course = {
  id: string
  slug: string
  name: string
  summary?: string
  description?: string
}

export type CourseSession = {
  id: string
  startAt: string
  endAt: string
}

export type Space = {
  id: string
  slug: string
  name: string
  summary?: string
  description?: string
  location?: string
  capacityMin?: number
  capacityMax?: number
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

export type BookingCustomer = {
  firstName: string
  lastName?: string
  email?: string
  phone?: string
}

export type SpaceBookingConfiguration = {
  layoutId?: string
  purpose?: string
  amenityIds?: string[]
}

export type BookingDraft = {
  bookableType: BookingTarget
  bookableId: string
  date: string
  startTime: string
  endTime: string
  participants?: number
  customer: BookingCustomer
  spaceConfiguration?: SpaceBookingConfiguration
  notes?: string
}

export type BookingConfirmation = {
  id?: string
  reference: string
  status: string
  startAt: string
  endAt: string
}
