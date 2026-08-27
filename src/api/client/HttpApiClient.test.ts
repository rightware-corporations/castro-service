import { describe, expect, it } from 'vitest'
import { HttpApiClient, readXsrfTokenCookie } from './HttpApiClient'

describe('HttpApiClient CSRF and idempotency', () => {
  it('extracts an encoded XSRF-TOKEN cookie', () => {
    expect(readXsrfTokenCookie('foo=bar; XSRF-TOKEN=csrf%2Dvalue; other=value')).toBe('csrf-value')
  })

  it('gets CSRF before state-changing requests and injects the X-XSRF-TOKEN header', async () => {
    const calls: { input: RequestInfo | URL; init?: RequestInit }[] = []
    const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ input, init })
      if (calls.length === 1) return new Response(JSON.stringify({ token: 'csrf-from-response' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      return new Response(JSON.stringify({ id: 'request' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    const client = new HttpApiClient('http://localhost:8080', fetcher)
    await client.request('/api/v1/requests', { method: 'POST', body: '{}' }, { idempotencyKey: 'request-key' })
    const requestInit = calls[1].init
    expect(requestInit?.credentials).toBe('include')
    expect(new Headers(requestInit?.headers).get('X-XSRF-TOKEN')).toBe('csrf-from-response')
    expect(new Headers(requestInit?.headers).get('Idempotency-Key')).toBe('request-key')
  })

  it('reuses the supplied idempotency key for a retry of the same logical request', async () => {
    const postHeaders: Headers[] = []
    let calls = 0
    const fetcher = async (_input: RequestInfo | URL, init?: RequestInit) => {
      calls += 1
      if (calls === 1) return new Response(JSON.stringify({ token: 'csrf-token' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      postHeaders.push(new Headers(init?.headers))
      return new Response(JSON.stringify({ id: 'request' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    const client = new HttpApiClient('http://localhost:8080', fetcher)
    const init = { method: 'POST', body: '{}' }
    await client.request('/api/v1/requests', init, { idempotencyKey: 'same-key' })
    await client.request('/api/v1/requests', init, { idempotencyKey: 'same-key' })
    expect(postHeaders).toHaveLength(2)
    expect(postHeaders[0].get('Idempotency-Key')).toBe('same-key')
    expect(postHeaders[1].get('Idempotency-Key')).toBe('same-key')
  })
})
