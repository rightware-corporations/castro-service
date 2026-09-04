import type { AuthSession, BookingTarget, Collection, OrganizationExperience } from '../../domain'

export type BookableType = BookingTarget
export type BookingConfirmationMode = 'MANUAL' | 'AUTOMATIC'
export type PublicConfigDto = { businessTimezone: string; contactPhone?: string | null; whatsappNumber?: string | null; contactEmail?: string | null }
export type ServiceDto = { id: string; name: string; slug: string; description?: string | null; durationMinutes?: number | null; bookingEnabled?: boolean | null; confirmationMode?: BookingConfirmationMode | null }
export type CourseDto = { id: string; name: string; slug: string; description?: string | null }
export type CsrfTokenResponse = { token: string; headerName?: string; parameterName?: string }
export type AuthSessionDto = { email: string; authenticated: boolean; organizationId?: string; firstName?: string; lastName?: string; experienceType?: OrganizationExperience; permissions?: string[] }
export type CourseSessionDto = { id: string; startAt: string; endAt: string }
export type CourseSessionResponse = CourseSessionDto
export type SpaceDto = { id: string; name: string; slug: string; description?: string | null; location?: string | null; capacityMin?: number | null; capacityMax?: number | null; bookingEnabled?: boolean | null; confirmationMode?: BookingConfirmationMode | null }
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
export type RequestSourceType = 'GENERAL' | 'SERVICE' | 'TRAINING' | 'SPACE'
export type RequestContextDto = { sourceType: RequestSourceType; entityId?: string; cta?: string; sourcePath?: string; entryPath?: string; referrer?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string }
export type RequestInput = { firstName: string; lastName: string; email: string; phone?: string; type: RequestType; message?: string; context?: RequestContextDto }
export type RequestRequestDto = RequestInput
export type RequestResponseDto = { id: string; status: string }
export type RequestOperationalStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WAITING_CUSTOMER' | 'CONVERTED' | 'CLOSED' | 'CANCELLED'
export type BookingOperationalStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
export type OperationsTaskItemDto = { id: string; title: string; description?: string | null; status: TaskStatus; priority: TaskPriority; dueAt?: string | null; assignedUserId?: string | null; assignedUserName?: string | null; requestId?: string | null; bookingId?: string | null; customerId?: string | null; createdAt: string; updatedAt: string }
export type OperationsTaskInputDto = { title: string; description?: string; status: TaskStatus; priority: TaskPriority; dueAt?: string | null; assignedUserId?: string | null; requestId?: string | null; bookingId?: string | null; customerId?: string | null }
export type OperationsNotificationDto = { id: string; type: string; title: string; body?: string | null; resourceType?: string | null; resourceId?: string | null; readAt?: string | null; createdAt: string }
export type OperationsReportDailyDto = { date: string; requests: number; bookings: number; customers: number; tasks: number }
export type OperationsReportDto = { from: string; to: string; requestsCreated: number; bookingsCreated: number; customersCreated: number; tasksCreated: number; requestStatuses: Record<string, number>; bookingStatuses: Record<string, number>; daily: OperationsReportDailyDto[] }
export type ContentStatus = 'DRAFT' | 'PUBLISHED'
export type AdminContentItemDto = { id: string; contentKey: string; title?: string | null; body?: string | null; mediaUrl?: string | null; status: ContentStatus; publishedAt?: string | null; createdAt: string; updatedAt: string }
export type AdminContentInputDto = { contentKey: string; title?: string; body?: string; mediaUrl?: string; status: ContentStatus }
export type OperationsSummaryDto = { requests: number; bookings: number; customers: number }
export type OperationsRequestItemDto = { id: string; type: string; status: RequestOperationalStatus; message?: string | null; createdAt: string; customerId?: string | null; firstName?: string | null; lastName?: string | null; email?: string | null; phone?: string | null; sourceType?: RequestSourceType | null; sourceEntityId?: string | null; sourceEntitySlug?: string | null; sourceEntityName?: string | null; sourceCta?: string | null; sourcePath?: string | null; entryPath?: string | null; referrer?: string | null; utmSource?: string | null; utmMedium?: string | null; utmCampaign?: string | null }
export type OperationsBookingItemDto = { id: string; reference: string; status: BookingOperationalStatus; bookableType: string; bookableId: string; startAt: string; endAt: string; participants?: number | null; purpose?: string | null; createdAt: string; customerId?: string | null; firstName?: string | null; lastName?: string | null; email?: string | null; phone?: string | null }
export type OperationsCustomerItemDto = { id: string; firstName: string; lastName?: string | null; email?: string | null; phone?: string | null; company?: string | null; source?: string | null; createdAt: string; updatedAt: string }
export type AvailabilityRuleDto = { id: string; bookableType: BookableType; bookableId: string; dayOfWeek: string; opensAt: string; closesAt: string; slotIntervalMinutes: number; bufferBeforeMinutes: number; bufferAfterMinutes: number; minimumNoticeMinutes: number; maximumAdvanceDays: number; active: boolean }
export type AvailabilityRuleInputDto = Omit<AvailabilityRuleDto, 'id'>
export type AvailabilityExceptionDto = { id: string; bookableType: BookableType; bookableId: string; date: string; closed: boolean; opensAt?: string | null; closesAt?: string | null }
export type AvailabilityExceptionInputDto = Omit<AvailabilityExceptionDto, 'id'>
export type BlockedPeriodDto = { id: string; bookableType: BookableType; bookableId: string; startAt: string; endAt: string; reason?: string | null }
export type BlockedPeriodInputDto = Omit<BlockedPeriodDto, 'id'>
export type AdminServiceDto = { id: string; name: string; slug: string; shortDescription?: string | null; description?: string | null; durationMinutes?: number | null; bookingEnabled: boolean; confirmationMode: BookingConfirmationMode; active: boolean; featured: boolean; sortOrder: number; createdAt: string }
export type AdminServiceInputDto = Omit<AdminServiceDto, 'id' | 'createdAt'>
export type AdminCourseDto = { id: string; name: string; slug: string; description?: string | null; active: boolean }
export type AdminCourseInputDto = Omit<AdminCourseDto, 'id'>
export type AdminCourseSessionDto = { id: string; courseId: string; startAt: string; endAt: string; active: boolean }
export type AdminCourseSessionInputDto = Omit<AdminCourseSessionDto, 'id' | 'courseId'>
export type AdminSpaceDto = { id: string; name: string; slug: string; description?: string | null; location?: string | null; capacityMin?: number | null; capacityMax?: number | null; sizeSquareMeters?: number | null; bookingEnabled: boolean; confirmationMode: BookingConfirmationMode; active: boolean }
export type AdminSpaceInputDto = Omit<AdminSpaceDto, 'id'>
export type AdminUserDto = { id: string; email: string; firstName: string; lastName: string; active: boolean; createdAt: string; roleId?: string | null; roleName?: string | null; experienceType: OrganizationExperience }
export type CreateAdminUserDto = { email: string; password: string; firstName: string; lastName: string; active: boolean; roleId?: string | null; experienceType: OrganizationExperience }
export type UpdateAdminUserDto = Omit<CreateAdminUserDto, 'password'> & { password?: string }
export type AdminRoleDto = { id: string; name: string; permissionCodes: string[] }
export type AdminRoleInputDto = { name: string; permissionCodes: string[] }
export type AdminPermissionDto = { code: string }
export type GeneralSettingsDto = { organizationId: string; organizationName: string; organizationSlug: string; businessTimezone: string; contactPhone?: string | null; whatsappNumber?: string | null; contactEmail?: string | null }
export type GeneralSettingsInputDto = Pick<GeneralSettingsDto, 'organizationName' | 'businessTimezone' | 'contactPhone' | 'whatsappNumber' | 'contactEmail'>
export type BookingScheduleInputDto = { date: string; startTime: string; endTime: string }
export type BookingScheduleResponseDto = { id: string; reference: string; status: BookingOperationalStatus; startAt: string; endAt: string }
export type CourseRegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'
export type CourseRegistrationInputDto = { firstName: string; lastName?: string; email: string; phone?: string; participantCount: number; organizationName?: string; notes?: string }
export type CourseRegistrationResponseDto = { id: string; reference: string; status: CourseRegistrationStatus; courseSessionId: string; participantCount: number; createdAt: string }
export type OperationsCourseRegistrationDto = CourseRegistrationResponseDto & { courseId: string; courseName?: string | null; sessionStartAt: string; sessionEndAt: string; firstName: string; lastName?: string | null; email: string; phone?: string | null; organizationName?: string | null; notes?: string | null }
export type ProblemDetailResponse = { code?: string; message?: string; status?: number; timestamp?: string; details?: Record<string, unknown> }
export type IdempotencyOptions = { idempotencyKey?: string }

export type ApiPort = {
  auth: { getCsrf(): Promise<CsrfTokenResponse>; getSession(): Promise<AuthSession | null>; login(email: string, password: string): Promise<AuthSession>; logout(): Promise<void> }
  public: { getConfig(): Promise<PublicConfigDto>; listServices(): Promise<Collection<ServiceDto>>; getService(slug: string): Promise<ServiceDto>; listCourses(): Promise<Collection<CourseDto>>; getCourse(slug: string): Promise<CourseDto>; listCourseSessions(id: string): Promise<Collection<CourseSessionDto>>; listSpaces(): Promise<Collection<SpaceDto>>; getSpace(slug: string): Promise<SpaceDto>; registerCourseSession(sessionId: string, input: CourseRegistrationInputDto, options?: IdempotencyOptions): Promise<CourseRegistrationResponseDto> }
  availability: { list(query: AvailabilityQueryDto): Promise<Collection<AvailabilitySlotDto>> }
  bookings: { create(request: BookingRequestDto, options?: IdempotencyOptions): Promise<BookingResponseDto>; getByReference(reference: string): Promise<PublicBookingLookupDto> }
  requests: { create(request: RequestInput, options?: IdempotencyOptions): Promise<RequestResponseDto> }
  operations: {
    getSummary(): Promise<OperationsSummaryDto>
    listRequests(): Promise<Collection<OperationsRequestItemDto>>; getRequest(id: string): Promise<OperationsRequestItemDto>; updateRequestStatus(id: string, status: RequestOperationalStatus): Promise<OperationsRequestItemDto>
    listBookings(): Promise<Collection<OperationsBookingItemDto>>; createBooking(input: BookingRequestDto, options?: IdempotencyOptions): Promise<OperationsBookingItemDto>; getBooking(id: string): Promise<OperationsBookingItemDto>; updateBookingStatus(id: string, status: BookingOperationalStatus): Promise<OperationsBookingItemDto>; rescheduleBooking(id: string, input: BookingScheduleInputDto): Promise<BookingScheduleResponseDto>; listRescheduleSlots(id: string, date: string): Promise<Collection<AvailabilitySlotDto>>
    listCustomers(): Promise<Collection<OperationsCustomerItemDto>>; getCustomer(id: string): Promise<OperationsCustomerItemDto>
    listTasks(): Promise<Collection<OperationsTaskItemDto>>; createTask(input: OperationsTaskInputDto): Promise<OperationsTaskItemDto>; updateTask(id: string, input: OperationsTaskInputDto): Promise<OperationsTaskItemDto>; updateTaskStatus(id: string, status: TaskStatus): Promise<OperationsTaskItemDto>; deleteTask(id: string): Promise<void>
    listNotifications(): Promise<Collection<OperationsNotificationDto>>; markNotificationRead(id: string): Promise<OperationsNotificationDto>; markAllNotificationsRead(): Promise<void>
    getReport(from: string, to: string): Promise<OperationsReportDto>
    listContent(): Promise<Collection<AdminContentItemDto>>; createContent(input: AdminContentInputDto): Promise<AdminContentItemDto>; updateContent(id: string, input: AdminContentInputDto): Promise<AdminContentItemDto>; deleteContent(id: string): Promise<void>
    listAvailabilityRules(): Promise<Collection<AvailabilityRuleDto>>; createAvailabilityRule(input: AvailabilityRuleInputDto): Promise<AvailabilityRuleDto>; updateAvailabilityRule(id: string, input: AvailabilityRuleInputDto): Promise<AvailabilityRuleDto>; deleteAvailabilityRule(id: string): Promise<void>
    listAvailabilityExceptions(): Promise<Collection<AvailabilityExceptionDto>>; createAvailabilityException(input: AvailabilityExceptionInputDto): Promise<AvailabilityExceptionDto>; deleteAvailabilityException(id: string): Promise<void>
    listBlockedPeriods(): Promise<Collection<BlockedPeriodDto>>; createBlockedPeriod(input: BlockedPeriodInputDto): Promise<BlockedPeriodDto>; deleteBlockedPeriod(id: string): Promise<void>
    listAdminServices(): Promise<Collection<AdminServiceDto>>; createAdminService(input: AdminServiceInputDto): Promise<AdminServiceDto>; updateAdminService(id: string, input: AdminServiceInputDto): Promise<AdminServiceDto>; deactivateAdminService(id: string): Promise<void>
    listAdminCourses(): Promise<Collection<AdminCourseDto>>; createAdminCourse(input: AdminCourseInputDto): Promise<AdminCourseDto>; updateAdminCourse(id: string, input: AdminCourseInputDto): Promise<AdminCourseDto>; deactivateAdminCourse(id: string): Promise<void>
    listAdminCourseSessions(courseId: string): Promise<Collection<AdminCourseSessionDto>>; createAdminCourseSession(courseId: string, input: AdminCourseSessionInputDto): Promise<AdminCourseSessionDto>; updateAdminCourseSession(courseId: string, id: string, input: AdminCourseSessionInputDto): Promise<AdminCourseSessionDto>; deactivateAdminCourseSession(courseId: string, id: string): Promise<void>
    listCourseRegistrations(): Promise<Collection<OperationsCourseRegistrationDto>>; updateCourseRegistrationStatus(id: string, status: CourseRegistrationStatus): Promise<OperationsCourseRegistrationDto>
    listAdminSpaces(): Promise<Collection<AdminSpaceDto>>; createAdminSpace(input: AdminSpaceInputDto): Promise<AdminSpaceDto>; updateAdminSpace(id: string, input: AdminSpaceInputDto): Promise<AdminSpaceDto>; deactivateAdminSpace(id: string): Promise<void>
    listAdminUsers(): Promise<Collection<AdminUserDto>>; createAdminUser(input: CreateAdminUserDto): Promise<AdminUserDto>; updateAdminUser(id: string, input: UpdateAdminUserDto): Promise<AdminUserDto>
    listAdminRoles(): Promise<Collection<AdminRoleDto>>; createAdminRole(input: AdminRoleInputDto): Promise<AdminRoleDto>; updateAdminRole(id: string, input: AdminRoleInputDto): Promise<AdminRoleDto>; deleteAdminRole(id: string): Promise<void>
    listAdminPermissions(): Promise<Collection<AdminPermissionDto>
    >
    getGeneralSettings(): Promise<GeneralSettingsDto>; updateGeneralSettings(input: GeneralSettingsInputDto): Promise<GeneralSettingsDto>
  }
}
