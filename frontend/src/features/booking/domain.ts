import type { BookingTarget } from '../../domain'

export type BookingStep = 'selection' | 'time' | 'customer-details' | 'review' | 'confirmation'

export const bookingSteps: readonly BookingStep[] = ['selection', 'time', 'customer-details', 'review', 'confirmation']

export type BookingContext = {
  bookableType: BookingTarget
  bookableId: string
  step: BookingStep
}
