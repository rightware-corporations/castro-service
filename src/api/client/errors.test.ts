import { describe, expect, it } from 'vitest'
import { ApiError, parseProblemDetail } from './errors'

describe('ProblemDetail parsing', () => {
  it.each(['VALIDATION_FAILED', 'BOOKING_SLOT_UNAVAILABLE', 'DUPLICATE_RESOURCE', 'IDEMPOTENCY_KEY_REUSED', 'INTERNAL_ERROR'] as const)('preserves backend error code %s', (code) => {
    const error = parseProblemDetail({ code, message: 'Backend message', status: 422, timestamp: '2026-08-28T10:00:00Z', details: { email: 'Invalid' } })
    expect(error).toBeInstanceOf(ApiError)
    expect(error.code).toBe(code)
    expect(error.message).toBe('Backend message')
    expect(error.fieldErrors.email).toEqual(['Invalid'])
  })

  it('does not guess a specific conflict code when the backend omitted one', () => {
    expect(parseProblemDetail({}, 409).code).toBe('UNKNOWN_ERROR')
  })

  it('classifies an unknown server failure as INTERNAL_ERROR', () => {
    expect(parseProblemDetail({}, 500).code).toBe('INTERNAL_ERROR')
  })
})
