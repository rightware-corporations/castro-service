import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BookingConfirmation, BookingReview, BookingTime } from './BookingPublic'

const apiMocks = vi.hoisted(() => ({
  listAvailability: vi.fn(),
  createBooking: vi.fn(),
  getBooking: vi.fn(),
}))

vi.mock('../../../app/providers/AppProviders', () => ({
  useApi: () => ({
    availability: { list: apiMocks.listAvailability },
    bookings: { create: apiMocks.createBooking, getByReference: apiMocks.getBooking },
  }),
}))

function pendingPromise<T>() {
  return new Promise<T>(() => undefined)
}

function renderBooking(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/reservar/:bookableType/:bookableId/horario" element={<BookingTime />} />
            <Route path="/reservar/:bookableType/:bookableId/rever" element={<BookingReview />} />
            <Route path="/reservar/confirmacao/:reference" element={<BookingConfirmation />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  }
}

function seedReviewDraft() {
  sessionStorage.setItem('castros-booking:SERVICE:service-1', JSON.stringify({
    date: '2026-09-15',
    durationMinutes: 60,
    startTime: '09:00',
    endTime: '10:00',
    firstName: 'Ana',
    email: 'ana@example.com',
  }))
}

describe('public booking loading states', () => {
  beforeEach(() => {
    sessionStorage.clear()
    apiMocks.listAvailability.mockReset()
    apiMocks.createBooking.mockReset()
    apiMocks.getBooking.mockReset()
  })

  it('renders availability loading while the time lookup is pending', () => {
    sessionStorage.setItem('castros-booking:SERVICE:service-1', JSON.stringify({
      date: '2026-09-15',
      durationMinutes: 60,
    }))
    apiMocks.listAvailability.mockReturnValue(pendingPromise())

    renderBooking('/reservar/SERVICE/service-1/horario')

    expect(screen.getByRole('status')).toHaveTextContent('A consultar disponibilidade.')
  })

  it('renders confirmation loading while the reference lookup is pending', () => {
    apiMocks.getBooking.mockReturnValue(pendingPromise())

    renderBooking('/reservar/confirmacao/CASTRO-LOADING')

    expect(screen.getByRole('status')).toHaveTextContent('A carregar confirmação.')
  })

  it('disables the final booking action while submission is pending', async () => {
    seedReviewDraft()
    apiMocks.createBooking.mockReturnValue(pendingPromise())

    const { user } = renderBooking('/reservar/SERVICE/service-1/rever')
    const submit = screen.getByRole('button', { name: /Enviar pedido de reserva/i })
    await user.click(submit)

    expect(submit).toBeDisabled()
  })
})
