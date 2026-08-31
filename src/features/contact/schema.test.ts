import { describe, expect, it } from 'vitest'
import { contactSchema } from './schema'

describe('contact schema', () => {
  it('accepts the minimum verified RequestInput values', () => {
    const result = contactSchema.safeParse({ firstName: 'Ana', lastName: 'Silva', email: 'ana@example.com', phone: '', type: 'GENERAL', message: '' })
    expect(result.success).toBe(true)
  })
})
