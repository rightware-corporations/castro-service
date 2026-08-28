import type { ProblemDetailResponse } from '../contracts'

export type ApiErrorCode =
  | 'VALIDATION_FAILED'
  | 'BOOKING_SLOT_UNAVAILABLE'
  | 'DUPLICATE_RESOURCE'
  | 'IDEMPOTENCY_KEY_REUSED'
  | 'INTERNAL_ERROR'
  | 'UNKNOWN_ERROR'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status?: number
  readonly fieldErrors: Record<string, string[]>
  readonly problem?: ProblemDetailResponse

  constructor(message: string, options: { code?: ApiErrorCode; status?: number; fieldErrors?: Record<string, string[]>; problem?: ProblemDetailResponse } = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = options.code ?? 'UNKNOWN_ERROR'
    this.status = options.status
    this.fieldErrors = options.fieldErrors ?? {}
    this.problem = options.problem
  }
}

export function parseProblemDetail(payload: unknown, status?: number): ApiError {
  const problem = isProblemDetail(payload) ? payload : undefined
  const code = normalizeErrorCode(problem?.code, status)
  return new ApiError(problem?.message ?? 'Não foi possível concluir o pedido.', {
    code,
    status: problem?.status ?? status,
    fieldErrors: normalizeFieldErrors(problem?.details),
    problem,
  })
}

function isProblemDetail(value: unknown): value is ProblemDetailResponse {
  return typeof value === 'object' && value !== null
}

function normalizeFieldErrors(details: Record<string, unknown> | undefined): Record<string, string[]> {
  if (!details) return {}
  return Object.fromEntries(Object.entries(details).flatMap(([field, value]) => {
    if (typeof value === 'string') return [[field, [value]]]
    if (Array.isArray(value) && value.every((entry) => typeof entry === 'string')) return [[field, value as string[]]]
    return []
  }))
}

function normalizeErrorCode(code: ProblemDetailResponse['code'], status?: number): ApiErrorCode {
  if (code === 'VALIDATION_FAILED' || code === 'BOOKING_SLOT_UNAVAILABLE' || code === 'DUPLICATE_RESOURCE' || code === 'IDEMPOTENCY_KEY_REUSED' || code === 'INTERNAL_ERROR') return code
  if (status && status >= 500) return 'INTERNAL_ERROR'
  return 'UNKNOWN_ERROR'
}
