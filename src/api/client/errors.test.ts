import { describe, expect, it } from 'vitest'
import { ApiError, parseProblemDetail } from './errors'

describe('ProblemDetail parsing', () => {
  it.each(['VALIDATION_FAILED', 'BOOKING_SLOT_UNAVAILABLE', 'DUPLICATE_RESOURCE', 'IDEMPOTENCY_KEY_REUSED', 'INTERNAL_ERROR'] as const)('preserves backend error code %s', (code) => {
    const error = parseProblemDetail({ code, detail: 'Backend detail', status: 422, errors: { email: ['Invalid'] } })
    expect(error).toBeInstanceOf(ApiError)
    expect(error.code).toBe(code)
    expect(error.message).toBe('Backend detail')
  })

  it('classifies a 409 without a code as IDEMPOTENCY_KEY_REUSED', () => {
    expect(parseProblemDetail({}, 409).code).toBe('IDEMPOTENCY_KEY_REUSED')
  })

  it('classifies an unknown server failure as INTERNAL_ERROR', () => {
    expect(parseProblemDetail({}, 500).code).toBe('INTERNAL_ERROR')
  })
})
