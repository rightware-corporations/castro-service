import { describe, expect, it } from 'vitest'
import { HttpApiAdapter, MockApiAdapter } from './adapters'
import { HttpApiClient } from './HttpApiClient'

describe('availability integration boundary', () => {
  it('treats zero slots from HTTP as a valid response', async () => {
    const client = new HttpApiClient('http://localhost:8080', async () => new Response(JSON.stringify({ items: [], total: 0 }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    const adapter = new HttpApiAdapter(client)
    const result = await adapter.availability.list({ bookableType: 'SERVICE', bookableId: 'service-id', date: '2026-08-27', durationMinutes: 60 })
    expect(result).toEqual({ items: [], total: 0 })
  })

  it('keeps zero slots valid in mock mode', async () => {
    const result = await new MockApiAdapter().availability.list({ bookableType: 'SPACE', bookableId: 'space-id', date: '2026-08-27', durationMinutes: 60 })
    expect(result.items).toHaveLength(0)
    expect(result.total).toBe(0)
  })
})
