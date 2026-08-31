import type {
  AdminServiceDto, AdminServiceInputDto, ApiPort, AuthSessionDto, AvailabilityExceptionDto, AvailabilityExceptionInputDto, AvailabilityQueryDto, AvailabilityResultDto, AvailabilityRuleDto,
  AvailabilityRuleInputDto, AvailabilitySlotDto, BlockedPeriodDto, BlockedPeriodInputDto, BookingOperationalStatus, BookingRequestDto, BookingResponseDto,
  CourseDto, CourseSessionDto, CsrfTokenResponse, IdempotencyOptions, OperationsBookingItemDto, OperationsCustomerItemDto,
  OperationsRequestItemDto, OperationsSummaryDto, PublicBookingLookupDto, PublicConfigDto, RequestInput, RequestOperationalStatus, RequestResponseDto, ServiceDto, SpaceDto,
} from '../contracts'
import type { AuthSession, Collection } from '../../domain'
import { HttpApiClient, createIdempotencyKey } from './HttpApiClient'
import { apiRoutes } from './routes'
import { serializeAvailabilityQuery } from './serialization'

export interface ApiAdapter extends ApiPort { readonly kind: 'mock' | 'http' }
const emptyCollection = <T>(): Collection<T> => ({ items: [], total: 0 })
const toCollection = <T>(items: T[]): Collection<T> => ({ items, total: items.length })
const mapSession = (dto: AuthSessionDto): AuthSession => ({
  authenticated: dto.authenticated,
  username: dto.email,
  subject: dto.email,
  displayName: [dto.firstName, dto.lastName].filter(Boolean).join(' ') || dto.email,
  organizationId: dto.organizationId,
  permissions: dto.permissions ?? [],
})

const confirmedMockServices: ServiceDto[] = [
  { id: '10000000-0000-0000-0000-000000000001', slug: 'atendimento-ao-cliente', name: 'Atendimento ao Cliente', bookingEnabled: false },
  { id: '10000000-0000-0000-0000-000000000002', slug: 'etica-lideranca-organizacional', name: 'Consultoria em Ética e Liderança Organizacional', bookingEnabled: false },
  { id: '10000000-0000-0000-0000-000000000003', slug: 'palestras-workshops-formacao', name: 'Palestras, Workshops e Formação', bookingEnabled: false },
  { id: '10000000-0000-0000-0000-000000000004', slug: 'treinamento-corporativo-personalizado', name: 'Treinamento Corporativo Personalizado', bookingEnabled: false },
]

const confirmedMockSpaces: SpaceDto[] = [{ id: '20000000-0000-0000-0000-000000000001', slug: 'espaco-castros', name: 'Espaço Castro’s', description: 'Espaço físico preparado para reuniões, formação e workshops. Conteúdo visual real ainda pendente de assets aprovados.' }]

export class MockApiAdapter implements ApiAdapter {
  readonly kind = 'mock' as const
  async getCsrf(): Promise<CsrfTokenResponse> { return { token: 'mock-csrf-token' } }
  async getSession(): Promise<AuthSession | null> { return null }
  async login(email: string, password: string): Promise<AuthSession> { void password; return { authenticated: true, username: email, subject: email, displayName: email, permissions: [] } }
  async logout(): Promise<void> { return undefined }
  async getConfig(): Promise<PublicConfigDto> { return { businessTimezone: 'Africa/Maputo' } }
  async listServices(): Promise<Collection<ServiceDto>> { return toCollection(confirmedMockServices) }
  async getService(slug: string): Promise<ServiceDto> { return confirmedMockServices.find((item) => item.slug === slug) ?? { id: '00000000-0000-0000-0000-000000000000', slug, name: '[CONTENT TBD]' } }
  async listCourses(): Promise<Collection<CourseDto>> { return emptyCollection() }
  async getCourse(slug: string): Promise<CourseDto> { return { id: '00000000-0000-0000-0000-000000000000', slug, name: '[CONTENT TBD]' } }
  async listCourseSessions(id: string): Promise<Collection<CourseSessionDto>> { void id; return emptyCollection() }
  async listSpaces(): Promise<Collection<SpaceDto>> { return toCollection(confirmedMockSpaces) }
  async getSpace(slug: string): Promise<SpaceDto> { return confirmedMockSpaces.find((item) => item.slug === slug) ?? { id: '00000000-0000-0000-0000-000000000000', slug, name: '[CONTENT TBD]' } }
  async listAvailability(query: AvailabilityQueryDto): Promise<Collection<AvailabilitySlotDto>> { void query; return emptyCollection() }
  async createBooking(request: BookingRequestDto, options?: IdempotencyOptions): Promise<BookingResponseDto> { void request; void options; return { id: '00000000-0000-0000-0000-000000000000', reference: 'REFERENCE TBD', status: 'not-configured', startAt: '', endAt: '' } }
  async getBooking(reference: string): Promise<PublicBookingLookupDto> { return { reference, status: 'not-configured', startAt: '', endAt: '' } }
  async createRequest(request: RequestInput, options?: IdempotencyOptions): Promise<RequestResponseDto> { void request; void options; return { id: 'REQUEST TBD', status: 'NEW' } }
  get auth(): ApiPort['auth'] { return { getCsrf: () => this.getCsrf(), getSession: () => this.getSession(), login: (email, password) => this.login(email, password), logout: () => this.logout() } }
  get public(): ApiPort['public'] { return { getConfig: () => this.getConfig(), listServices: () => this.listServices(), getService: (slug) => this.getService(slug), listCourses: () => this.listCourses(), getCourse: (slug) => this.getCourse(slug), listCourseSessions: (id) => this.listCourseSessions(id), listSpaces: () => this.listSpaces(), getSpace: (slug) => this.getSpace(slug) } }
  get availability(): ApiPort['availability'] { return { list: (query) => this.listAvailability(query) } }
  get bookings(): ApiPort['bookings'] { return { create: (request, options) => this.createBooking(request, options), getByReference: (reference) => this.getBooking(reference) } }
  get requests(): ApiPort['requests'] { return { create: (request, options) => this.createRequest(request, options) } }
  get operations(): ApiPort['operations'] {
    const unavailable = async () => { throw new Error('Operational mock detail is not configured.') }
    return {
      getSummary: async () => ({ requests: 0, bookings: 0, customers: 0 }),
      listRequests: async () => emptyCollection<OperationsRequestItemDto>(),
      getRequest: unavailable,
      updateRequestStatus: async (id: string, status: RequestOperationalStatus) => { void id; void status; return unavailable() },
      listBookings: async () => emptyCollection<OperationsBookingItemDto>(),
      getBooking: unavailable,
      updateBookingStatus: async (id: string, status: BookingOperationalStatus) => { void id; void status; return unavailable() },
      listCustomers: async () => emptyCollection<OperationsCustomerItemDto>(),
      getCustomer: unavailable,
      listAvailabilityRules: async () => emptyCollection<AvailabilityRuleDto>(),
      createAvailabilityRule: async (input: AvailabilityRuleInputDto) => { void input; return unavailable() },
      updateAvailabilityRule: async (id: string, input: AvailabilityRuleInputDto) => { void id; void input; return unavailable() },
      deleteAvailabilityRule: async (id: string) => { void id },
      listAvailabilityExceptions: async () => emptyCollection<AvailabilityExceptionDto>(),
      createAvailabilityException: async (input: AvailabilityExceptionInputDto) => { void input; return unavailable() },
      deleteAvailabilityException: async (id: string) => { void id },
      listBlockedPeriods: async () => emptyCollection<BlockedPeriodDto>(),
      createBlockedPeriod: async (input: BlockedPeriodInputDto) => { void input; return unavailable() },
      deleteBlockedPeriod: async (id: string) => { void id },
      listAdminServices: async () => emptyCollection<AdminServiceDto>(),
      createAdminService: async (input: AdminServiceInputDto) => { void input; return unavailable() },
      updateAdminService: async (id: string, input: AdminServiceInputDto) => { void id; void input; return unavailable() },
      deactivateAdminService: async (id: string) => { void id },
    }
  }
}

export class HttpApiAdapter implements ApiAdapter {
  readonly kind = 'http' as const
  constructor(private readonly client: HttpApiClient) {}
  get auth(): ApiPort['auth'] { return { getCsrf: () => this.client.requestOrThrow<CsrfTokenResponse>(apiRoutes.csrf), getSession: async () => mapSession(await this.client.requestOrThrow<AuthSessionDto>(apiRoutes.me)), login: async (email, password) => mapSession(await this.client.requestOrThrow<AuthSessionDto>(apiRoutes.login, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })), logout: () => this.client.requestOrThrow<void>(apiRoutes.logout, { method: 'POST' }) } }
  get public(): ApiPort['public'] { return { getConfig: () => this.client.requestOrThrow<PublicConfigDto>(apiRoutes.publicConfig), listServices: async () => toCollection(await this.client.requestOrThrow<ServiceDto[]>(apiRoutes.services)), getService: (slug) => this.client.requestOrThrow<ServiceDto>(apiRoutes.service(slug)), listCourses: async () => toCollection(await this.client.requestOrThrow<CourseDto[]>(apiRoutes.courses)), getCourse: (slug) => this.client.requestOrThrow<CourseDto>(apiRoutes.course(slug)), listCourseSessions: async (id) => toCollection(await this.client.requestOrThrow<CourseSessionDto[]>(apiRoutes.courseSessions(id))), listSpaces: async () => toCollection(await this.client.requestOrThrow<SpaceDto[]>(apiRoutes.spaces)), getSpace: (slug) => this.client.requestOrThrow<SpaceDto>(apiRoutes.space(slug)) } }
  get availability(): ApiPort['availability'] { return { list: async (query) => { const result = await this.client.requestOrThrow<AvailabilityResultDto>(`${apiRoutes.availability}?${serializeAvailabilityQuery(query)}`); return toCollection(result.slots) } } }
  get bookings(): ApiPort['bookings'] { return { create: (request, options) => this.client.requestOrThrow<BookingResponseDto>(apiRoutes.bookings, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) }, { idempotencyKey: options?.idempotencyKey ?? createIdempotencyKey() }), getByReference: (reference) => this.client.requestOrThrow<PublicBookingLookupDto>(apiRoutes.booking(reference)) } }
  get requests(): ApiPort['requests'] { return { create: (request, options) => this.client.requestOrThrow<RequestResponseDto>(apiRoutes.requests, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) }, { idempotencyKey: options?.idempotencyKey ?? createIdempotencyKey() }) } }
  get operations(): ApiPort['operations'] {
    const json = { 'Content-Type': 'application/json' }
    return {
      getSummary: () => this.client.requestOrThrow<OperationsSummaryDto>(apiRoutes.operationsSummary),
      listRequests: async () => toCollection(await this.client.requestOrThrow<OperationsRequestItemDto[]>(apiRoutes.operationsRequests)),
      getRequest: (id) => this.client.requestOrThrow<OperationsRequestItemDto>(apiRoutes.operationsRequest(id)),
      updateRequestStatus: (id, status) => this.client.requestOrThrow<OperationsRequestItemDto>(apiRoutes.operationsRequestStatus(id), { method: 'PATCH', headers: json, body: JSON.stringify({ status }) }),
      listBookings: async () => toCollection(await this.client.requestOrThrow<OperationsBookingItemDto[]>(apiRoutes.operationsBookings)),
      getBooking: (id) => this.client.requestOrThrow<OperationsBookingItemDto>(apiRoutes.operationsBooking(id)),
      updateBookingStatus: (id, status) => this.client.requestOrThrow<OperationsBookingItemDto>(apiRoutes.operationsBookingStatus(id), { method: 'PATCH', headers: json, body: JSON.stringify({ status }) }),
      listCustomers: async () => toCollection(await this.client.requestOrThrow<OperationsCustomerItemDto[]>(apiRoutes.operationsCustomers)),
      getCustomer: (id) => this.client.requestOrThrow<OperationsCustomerItemDto>(apiRoutes.operationsCustomer(id)),
      listAvailabilityRules: async () => toCollection(await this.client.requestOrThrow<AvailabilityRuleDto[]>(apiRoutes.operationsAvailabilityRules)),
      createAvailabilityRule: (input) => this.client.requestOrThrow<AvailabilityRuleDto>(apiRoutes.operationsAvailabilityRules, { method: 'POST', headers: json, body: JSON.stringify(input) }),
      updateAvailabilityRule: (id, input) => this.client.requestOrThrow<AvailabilityRuleDto>(apiRoutes.operationsAvailabilityRule(id), { method: 'PUT', headers: json, body: JSON.stringify(input) }),
      deleteAvailabilityRule: (id) => this.client.requestOrThrow<void>(apiRoutes.operationsAvailabilityRule(id), { method: 'DELETE' }),
      listAvailabilityExceptions: async () => toCollection(await this.client.requestOrThrow<AvailabilityExceptionDto[]>(apiRoutes.operationsAvailabilityExceptions)),
      createAvailabilityException: (input) => this.client.requestOrThrow<AvailabilityExceptionDto>(apiRoutes.operationsAvailabilityExceptions, { method: 'POST', headers: json, body: JSON.stringify(input) }),
      deleteAvailabilityException: (id) => this.client.requestOrThrow<void>(apiRoutes.operationsAvailabilityException(id), { method: 'DELETE' }),
      listBlockedPeriods: async () => toCollection(await this.client.requestOrThrow<BlockedPeriodDto[]>(apiRoutes.operationsBlockedPeriods)),
      createBlockedPeriod: (input) => this.client.requestOrThrow<BlockedPeriodDto>(apiRoutes.operationsBlockedPeriods, { method: 'POST', headers: json, body: JSON.stringify(input) }),
      deleteBlockedPeriod: (id) => this.client.requestOrThrow<void>(apiRoutes.operationsBlockedPeriod(id), { method: 'DELETE' }),
      listAdminServices: async () => toCollection(await this.client.requestOrThrow<AdminServiceDto[]>(apiRoutes.operationsAdminServices)),
      createAdminService: (input) => this.client.requestOrThrow<AdminServiceDto>(apiRoutes.operationsAdminServices, { method: 'POST', headers: json, body: JSON.stringify(input) }),
      updateAdminService: (id, input) => this.client.requestOrThrow<AdminServiceDto>(apiRoutes.operationsAdminService(id), { method: 'PUT', headers: json, body: JSON.stringify(input) }),
      deactivateAdminService: (id) => this.client.requestOrThrow<void>(apiRoutes.operationsAdminService(id), { method: 'DELETE' }),
    }
  }
}

export function createApiAdapter(): ApiAdapter { const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim(); return baseUrl ? new HttpApiAdapter(new HttpApiClient(baseUrl)) : new MockApiAdapter() }
