import type { OperationsBookingItemDto, OperationsCustomerItemDto, OperationsRequestItemDto } from '../contracts'
import type { Collection } from '../../domain'
import { HttpApiClient } from './HttpApiClient'

export type OperationsListQuery = { page: number; size: number; q?: string; status?: string }
type CountResponse = { total: number }

const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const client = baseUrl ? new HttpApiClient(baseUrl) : null

function queryString(query: OperationsListQuery, includeStatus = true) {
  const params = new URLSearchParams({ page: String(query.page), size: String(query.size) })
  if (query.q?.trim()) params.set('q', query.q.trim())
  if (includeStatus && query.status?.trim()) params.set('status', query.status.trim())
  return params.toString()
}

function countString(query: OperationsListQuery, includeStatus = true) {
  const params = new URLSearchParams()
  if (query.q?.trim()) params.set('q', query.q.trim())
  if (includeStatus && query.status?.trim()) params.set('status', query.status.trim())
  return params.toString()
}

async function page<T>(path: string, query: OperationsListQuery, includeStatus = true): Promise<Collection<T>> {
  if (!client) return { items: [], total: 0 }
  const listUrl = `${path}?${queryString(query, includeStatus)}`
  const countParams = countString(query, includeStatus)
  const countUrl = `${path}/count${countParams ? `?${countParams}` : ''}`
  const [items, count] = await Promise.all([
    client.requestOrThrow<T[]>(listUrl),
    client.requestOrThrow<CountResponse>(countUrl),
  ])
  return { items, total: count.total }
}

export const operationsQueryAdmin = {
  listRequests: (query: OperationsListQuery) => page<OperationsRequestItemDto>('/api/v1/operations/requests', query),
  listBookings: (query: OperationsListQuery) => page<OperationsBookingItemDto>('/api/v1/operations/bookings', query),
  listCustomers: (query: OperationsListQuery) => page<OperationsCustomerItemDto>('/api/v1/operations/customers', query, false),
}
