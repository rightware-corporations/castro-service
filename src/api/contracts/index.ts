import type { AuthSession, BookingTarget, Collection } from '../../domain'

export type BookableType = BookingTarget

export type PublicConfigDto = { businessTimezone: string }
export type ServiceDto = { id: string; name: string; slug: string; description?: string | null; durationMinutes?: number | null; bookingEnabled?: boolean | null }
export type CourseDto = { id: string; name: string; slug: string; description?: string | null }
export type CsrfTokenResponse = { token: string; headerName?: string; parameterName?: string }

export type AuthSessionDto = {
  email: string
  authenticated: boolean
  organizationId?: string
  firstName?: string
  lastName?: string
  permissions?: string[]
}

export type CourseSessionDto = { id: string; startAt: string; endAt: string }
export type CourseSessionResponse = CourseSessionDto
export type SpaceDto = { id: string; name: string; slug: string; description?: string | null; location?: string | null; capacityMin?: number | null; capacityMax?: number | null }
export type AvailabilityQueryDto = { bookableType: BookableType; bookableId: string; date: string; durationMinutes: number }
export type AvailabilitySlotDto = { start: string; end: string; status: 'AVAILABLE' | 'BOOKED' }
export type AvailabilityResultDto = { date: string; timezone: string; slots: AvailabilitySlotDto[] }
export type BookingCustomerInputDto = { firstName: string; lastName?: string; email?: string; phone?: string }
export type SpaceConfigurationDto = { layoutId?: string; purpose?: string; amenityIds?: string[] }
export type BookingRequestDto = { bookableType: BookableType; bookableId: string; date: string; startTime: string; endTime: string; participants?: number; customer: BookingCustomerInputDto; spaceConfiguration?: SpaceConfigurationDto; notes?: string }
export type BookingRequest = BookingRequestDto
export type BookingResponseDto = { id: string; reference: string; status: string; startAt: string; endAt: string }
export type PublicBookingLookupDto = { reference: string; status: string; startAt: string; endAt: string }
export type BookingResponse = BookingResponseDto
export type RequestType = 'CONSULTATION' | 'CORPORATE_PROPOSAL' | 'TRAINING_INFO' | 'SPACE_INFO' | 'GENERAL'
export type RequestInput = { firstName: string; lastName: string; email: string; phone?: string; type: RequestType; message?: string }
export type RequestRequestDto = RequestInput
export type RequestResponseDto = { id: string; status: string }

export type RequestOperationalStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WAITING_CUSTOMER' | 'CONVERTED' | 'CLOSED' | 'CANCELLED'
export type BookingOperationalStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
export type OperationsSummaryDto = { requests: number; bookings: number; customers: number }
export type OperationsRequestItemDto = {
  id: string; type: string; status: RequestOperationalStatus; message?: string | null; createdAt: string
  customerId?: string | null; firstName?: string | null; lastName?: string | null; email?: string | null; phone?: string | null
}
export type OperationsBookingItemDto = {
  id: string; reference: string; status: BookingOperationalStatus; bookableType: string; bookableId: string; startAt: string; endAt: string
  participants?: number | null; purpose?: string | null; createdAt: string; customerId?: string | null; firstName?: string | null
  lastName?: string | null; email?: string | null; phone?: string | null
}
export type OperationsCustomerItemDto = {
  id: string; firstName: string; lastName?: string | null; email?: string | null; phone?: string | null; company?: string | null
  source?: string | null; createdAt: string; updatedAt: string
}

export type ProblemDetailResponse = { code?: string; message?: string; status?: number; timestamp?: string; details?: Record<string, unknown> }
export type IdempotencyOptions = { idempotencyKey?: string }

export type ApiPort = {
  auth: {
    getCsrf(): Promise<CsrfTokenResponse>
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
  availability: { list(query: AvailabilityQueryDto): Promise<Collection<AvailabilitySlotDto>> }
  bookings: { create(request: BookingRequestDto, options?: IdempotencyOptions): Promise<BookingResponseDto>; getByReference(reference: string): Promise<PublicBookingLookupDto> }
  requests: { create(request: RequestInput, options?: IdempotencyOptions): Promise<RequestResponseDto> }
  operations: {
    getSummary(): Promise<OperationsSummaryDto>
    listRequests(): Promise<Collection<OperationsRequestItemDto>>
    getRequest(id: string): Promise<OperationsRequestItemDto>
    updateRequestStatus(id: string, status: RequestOperationalStatus): Promise<OperationsRequestItemDto>
    listBookings(): Promise<Collection<OperationsBookingItemDto>>
    getBooking(id: string): Promise<OperationsBookingItemDto>
    updateBookingStatus(id: string, status: BookingOperationalStatus): Promise<OperationsBookingItemDto>
    listCustomers(): Promise<Collection<OperationsCustomerItemDto>>
    getCustomer(id: string): Promise<OperationsCustomerItemDto>
  }
}
