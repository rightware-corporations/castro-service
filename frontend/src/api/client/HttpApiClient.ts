import type { CsrfTokenResponse, ProblemDetailResponse } from '../contracts'
import { ApiError, parseProblemDetail } from './errors'

export type RequestOptions = { idempotencyKey?: string }
export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export function readXsrfTokenCookie(cookieHeader = typeof document === 'undefined' ? '' : document.cookie): string | undefined {
  const token = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith('XSRF-TOKEN='))?.slice('XSRF-TOKEN='.length)
  return token ? decodeURIComponent(token) : undefined
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `idempotency-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export class HttpApiClient {
  private csrfToken: string | undefined

  constructor(private readonly baseUrl: string, private readonly fetcher: FetchLike = fetch, private readonly csrfPath = '/api/v1/auth/csrf') {}

  async request<T>(path: string, init: RequestInit = {}, options: RequestOptions = {}): Promise<T> {
    const method = (init.method ?? 'GET').toUpperCase()
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    if (options.idempotencyKey) headers.set('Idempotency-Key', options.idempotencyKey)
    if (this.isStateChanging(method)) {
      const token = await this.ensureCsrfToken()
      headers.set('X-XSRF-TOKEN', token)
    }
    const response = await this.fetcher(`${this.baseUrl.replace(/\/$/, '')}${path}`, { ...init, credentials: 'include', headers })
    if (!response.ok) {
      let payload: unknown
      try { payload = (await response.json()) as ProblemDetailResponse } catch { payload = undefined }
      throw parseProblemDetail(payload, response.status)
    }
    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }

  async requestOrThrow<T>(path: string, init: RequestInit = {}, options: RequestOptions = {}): Promise<T> {
    try { return await this.request<T>(path, init, options) } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Não foi possível comunicar com o serviço.', { code: 'UNKNOWN_ERROR' })
    }
  }

  private async ensureCsrfToken(): Promise<string> {
    const cookieToken = readXsrfTokenCookie()
    if (cookieToken) { this.csrfToken = cookieToken; return cookieToken }
    if (this.csrfToken) return this.csrfToken
    const response = await this.fetcher(`${this.baseUrl.replace(/\/$/, '')}${this.csrfPath}`, { credentials: 'include', headers: { Accept: 'application/json' } })
    if (!response.ok) {
      let payload: unknown
      try { payload = (await response.json()) as ProblemDetailResponse } catch { payload = undefined }
      throw parseProblemDetail(payload, response.status)
    }
    let payload: CsrfTokenResponse | undefined
    try { payload = response.status === 204 ? undefined : await response.json() as CsrfTokenResponse } catch { payload = undefined }
    this.csrfToken = payload?.token ?? readXsrfTokenCookie()
    if (!this.csrfToken) throw new ApiError('Não foi possível obter o token CSRF.', { code: 'UNKNOWN_ERROR' })
    return this.csrfToken
  }

  private isStateChanging(method: string): boolean { return method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS' }
}
