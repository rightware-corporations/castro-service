import type { AuthSession, BookingTarget, Collection } from '../../domain'

export type PublicConfigDto = {
  brandName?: string
  locale?: string
}

export type ServiceDto = {
  slug: string
  name: string
  summary?: string
  description?: string
  durationMinutes?: number
  bookingEnabled?: boolean
}

export type CourseDto = {
  id?: string
  slug: string
  name: string
  summary?: string
  description?: string
}

export type CourseSessionDto = {
  id: string
  courseSlug: string
  startAt: string
  endAt: string
}

export type SpaceDto = {
  slug: string
  name: string
  summary?: string
}

export type AvailabilityQueryDto = {
  bookableType: BookingTarget
  bookableId: string
  date: string
  durationMinutes: number
}

export type AvailabilitySlotDto = {
  start: string
  end: string
  status: 'AVAILABLE' | 'BOOKED'
}

export type BookingRequestDto = {
  bookableType: BookingTarget
  bookableId: string
  date: string
  start: string
  customerName?: string
  customerEmail?: string
}

export type BookingResponseDto = {
  reference: string
  status: string
}

export type RequestType = 'CONSULTATION' | 'CORPORATE_PROPOSAL' | 'TRAINING_INFO' | 'SPACE_INFO' | 'GENERAL'

export type RequestRequestDto = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  type: RequestType
  message?: string
}

export type ProblemDetailResponse = {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  code?: 'VALIDATION_FAILED' | 'BOOKING_SLOT_UNAVAILABLE' | 'DUPLICATE_RESOURCE' | 'INTERNAL_ERROR' | string
  errors?: Record<string, string[]>
}

export type ApiPort = {
  auth: {
    getSession(): Promise<AuthSession | null>
    login(email: string, password: string): Promise<AuthSession>
    logout(): Promise<void>
  }
  public: {
    getConfig(): Promise<PublicConfigDto>
    listServices(): Promise<Collection<ServiceDto>>
    getService(slug: string): Promise<ServiceDto>
    listCourses(): Promise<Collection<CourseDto>>
    getCourse(slug: string): Promise<CourseDto>
    listCourseSessions(id: string): Promise<Collection<CourseSessionDto>>
    listSpaces(): Promise<Collection<SpaceDto>>
    getSpace(slug: string): Promise<SpaceDto>
  }
  availability: {
    list(query: AvailabilityQueryDto): Promise<Collection<AvailabilitySlotDto>>
  }
  bookings: {
    create(request: BookingRequestDto): Promise<BookingResponseDto>
    getByReference(reference: string): Promise<BookingResponseDto>
  }
  requests: {
    create(request: RequestRequestDto): Promise<{ id: string }>
  }
}
