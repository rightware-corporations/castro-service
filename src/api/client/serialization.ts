import type { AvailabilityQueryDto } from '../contracts'

export function serializeAvailabilityQuery(query: AvailabilityQueryDto): string {
  return new URLSearchParams({
    bookableType: query.bookableType,
    bookableId: query.bookableId,
    date: query.date,
    durationMinutes: String(query.durationMinutes),
  }).toString()
}
