import type { BookingTarget } from '../../domain'
import type { BookingStep } from './domain'

const stepSegments: Record<BookingStep, string> = {
  selection: 'data',
  time: 'horario',
  'customer-details': 'dados',
  review: 'rever',
  confirmation: 'confirmacao',
}

export function bookingRoute(bookableType: BookingTarget, bookableId: string, step: Exclude<BookingStep, 'confirmation'>): string {
  return `/reservar/${bookableType}/${encodeURIComponent(bookableId)}/${stepSegments[step]}`
}

export function bookingConfirmationRoute(reference: string): string {
  return `/reservar/confirmacao/${encodeURIComponent(reference)}`
}
