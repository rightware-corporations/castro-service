import type { ApiPort, AvailabilityQueryDto, AvailabilitySlotDto, BookingRequestDto, BookingResponseDto, CourseDto, CourseSessionDto, CsrfTokenResponse, IdempotencyOptions, PublicConfigDto, RequestInput, ServiceDto, SpaceDto } from '../contracts'
import type { AuthSession, Collection } from '../../domain'
import { HttpApiClient, createIdempotencyKey } from './HttpApiClient'
import { apiRoutes } from './routes'
import { serializeAvailabilityQuery } from './serialization'

export interface ApiAdapter extends ApiPort { readonly kind: 'mock' | 'http' }
const emptyCollection = <T>(): Collection<T> => ({ items: [], total: 0 })

export class MockApiAdapter implements ApiAdapter {
  readonly kind = 'mock' as const
  async getCsrf(): Promise<CsrfTokenResponse> { return { token: 'mock-csrf-token' } }
  async getSession(): Promise<AuthSession | null> { return null }
  async login(email: string, password: string): Promise<AuthSession> { void email; void password; return { authenticated: true } }
  async logout(): Promise<void> { return undefined }
  async getConfig(): Promise<PublicConfigDto> { return {} }
  async listServices(): Promise<Collection<ServiceDto>> { return emptyCollection() }
  async getService(slug: string): Promise<ServiceDto> { return { slug, name: '[CONTENT TBD]' } }
  async listCourses(): Promise<Collection<CourseDto>> { return emptyCollection() }
  async getCourse(slug: string): Promise<CourseDto> { return { slug, name: '[CONTENT TBD]' } }
  async listCourseSessions(id: string): Promise<Collection<CourseSessionDto>> { void id; return emptyCollection() }
  async listSpaces(): Promise<Collection<SpaceDto>> { return emptyCollection() }
  async getSpace(slug: string): Promise<SpaceDto> { return { slug, name: '[CONTENT TBD]' } }
  async listAvailability(query: AvailabilityQueryDto): Promise<Collection<AvailabilitySlotDto>> { void query; return emptyCollection() }
  async createBooking(request: BookingRequestDto, options?: IdempotencyOptions): Promise<BookingResponseDto> { void request; void options; return { reference: 'REFERENCE TBD', status: 'not-configured' } }
  async getBooking(reference: string): Promise<BookingResponseDto> { return { reference, status: 'not-configured' } }
  async createRequest(request: RequestInput, options?: IdempotencyOptions): Promise<{ id: string }> { void request; void options; return { id: 'REQUEST TBD' } }
  get auth(): ApiPort['auth'] { return { getCsrf: () => this.getCsrf(), getSession: () => this.getSession(), login: (email, password) => this.login(email, password), logout: () => this.logout() } }
  get public(): ApiPort['public'] { return { getConfig: () => this.getConfig(), listServices: () => this.listServices(), getService: (slug) => this.getService(slug), listCourses: () => this.listCourses(), getCourse: (slug) => this.getCourse(slug), listCourseSessions: (id) => this.listCourseSessions(id), listSpaces: () => this.listSpaces(), getSpace: (slug) => this.getSpace(slug) } }
  get availability(): ApiPort['availability'] { return { list: (query) => this.listAvailability(query) } }
  get bookings(): ApiPort['bookings'] { return { create: (request, options) => this.createBooking(request, options), getByReference: (reference) => this.getBooking(reference) } }
  get requests(): ApiPort['requests'] { return { create: (request, options) => this.createRequest(request, options) } }
}

export class HttpApiAdapter implements ApiAdapter {
  readonly kind = 'http' as const
  constructor(private readonly client: HttpApiClient) {}
  get auth(): ApiPort['auth'] {
    return {
      getCsrf: () => this.client.requestOrThrow<CsrfTokenResponse>(apiRoutes.csrf),
      getSession: () => this.client.requestOrThrow<AuthSession | null>(apiRoutes.me),
      login: (email, password) => this.client.requestOrThrow<AuthSession>(apiRoutes.login, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }),
      logout: () => this.client.requestOrThrow<void>(apiRoutes.logout, { method: 'POST' }),
    }
  }
  get public(): ApiPort['public'] {
    return {
      getConfig: () => this.client.requestOrThrow<PublicConfigDto>(apiRoutes.publicConfig),
      listServices: () => this.client.requestOrThrow<Collection<ServiceDto>>(apiRoutes.services),
      getService: (slug) => this.client.requestOrThrow<ServiceDto>(apiRoutes.service(slug)),
      listCourses: () => this.client.requestOrThrow<Collection<CourseDto>>(apiRoutes.courses),
      getCourse: (slug) => this.client.requestOrThrow<CourseDto>(apiRoutes.course(slug)),
      listCourseSessions: (id) => this.client.requestOrThrow<Collection<CourseSessionDto>>(apiRoutes.courseSessions(id)),
      listSpaces: () => this.client.requestOrThrow<Collection<SpaceDto>>(apiRoutes.spaces),
      getSpace: (slug) => this.client.requestOrThrow<SpaceDto>(apiRoutes.space(slug)),
    }
  }
  get availability(): ApiPort['availability'] { return { list: (query) => this.client.requestOrThrow<Collection<AvailabilitySlotDto>>(`${apiRoutes.availability}?${serializeAvailabilityQuery(query)}`) } }
  get bookings(): ApiPort['bookings'] {
    return {
      create: (request, options) => this.client.requestOrThrow<BookingResponseDto>(apiRoutes.bookings, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) }, { idempotencyKey: options?.idempotencyKey ?? createIdempotencyKey() }),
      getByReference: (reference) => this.client.requestOrThrow<BookingResponseDto>(apiRoutes.booking(reference)),
    }
  }
  get requests(): ApiPort['requests'] {
    return { create: (request, options) => this.client.requestOrThrow<{ id: string }>(apiRoutes.requests, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) }, { idempotencyKey: options?.idempotencyKey ?? createIdempotencyKey() }) }
  }
}

export function createApiAdapter(): ApiAdapter {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  return baseUrl ? new HttpApiAdapter(new HttpApiClient(baseUrl)) : new MockApiAdapter()
}
