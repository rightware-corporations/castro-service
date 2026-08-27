import type { ProblemDetailResponse } from '../contracts'
import { ApiError, parseProblemDetail } from './errors'

export class HttpApiClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
      ...init,
      credentials: 'include',
      headers: { Accept: 'application/json', ...init.headers },
    })

    if (!response.ok) {
      let payload: unknown
      try {
        payload = (await response.json()) as ProblemDetailResponse
      } catch {
        payload = undefined
      }
      throw parseProblemDetail(payload, response.status)
    }

    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }

  async requestOrThrow<T>(path: string, init: RequestInit = {}): Promise<T> {
    try {
      return await this.request<T>(path, init)
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Não foi possível comunicar com o serviço.', { code: 'UNKNOWN_ERROR' })
    }
  }
}
