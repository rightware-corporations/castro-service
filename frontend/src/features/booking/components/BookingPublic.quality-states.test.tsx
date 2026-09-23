import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
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
    public: { listServices: async () => ({ items: [{ id: 'service-1', bookingEnabled: true, durationMinutes: 60 }] }), listSpaces: async () => ({ items: [{ id: 'space-1', bookingEnabled: true }] }) },
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
    queryClient,
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
    apiMocks.listAvailability.mockReset().mockResolvedValue({ items: [{ start: '09:00', end: '10:00', status: 'AVAILABLE' }], total: 1 })
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
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A consultar a reserva.')
    expect(screen.queryByText('Reserva registada.')).not.toBeInTheDocument()
  })

  it('disables the final booking action while submission is pending', async () => {
    seedReviewDraft()
    apiMocks.createBooking.mockReturnValue(pendingPromise())

    const { user } = renderBooking('/reservar/SERVICE/service-1/rever')
    const submit = screen.getByRole('button', { name: /Enviar pedido de reserva/i })
    await waitFor(() => expect(submit).toBeEnabled())
    await user.click(submit)

    expect(submit).toBeDisabled()
  })
  it.each([
    ['PENDING', 'Aguardamos a confirmação da Castro’s.'],
    ['CONFIRMED', 'Reserva confirmada.'],
    ['CANCELLED', 'Reserva cancelada.'],
    ['COMPLETED', 'Reserva concluída.'],
    ['NO_SHOW', 'Não comparência registada.'],
    ['FUTURE_STATUS', 'Estado da reserva por verificar.'],
  ])('shows the verified %s status on direct entry', async (status, title) => {
    apiMocks.getBooking.mockResolvedValue({ reference: 'CASTRO-STATUS', status, startAt: '2026-09-15T09:00:00+02:00', endAt: '2026-09-15T10:00:00+02:00' })
    renderBooking('/reservar/confirmacao/CASTRO-STATUS')
    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(apiMocks.createBooking).not.toHaveBeenCalled()
    if (status !== 'CONFIRMED') expect(screen.queryByText('Reserva confirmada.')).not.toBeInTheDocument()
    expect(screen.queryByText('FUTURE_STATUS')).not.toBeInTheDocument()
  })

  it('retries a failed lookup without submitting a booking', async () => {
    apiMocks.getBooking.mockRejectedValueOnce(new Error('private transport detail')).mockResolvedValueOnce({ reference: 'CASTRO-RETRY', status: 'PENDING', startAt: '', endAt: '' })
    const { user } = renderBooking('/reservar/confirmacao/CASTRO-RETRY')
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível verificar o estado')
    expect(screen.queryByText('private transport detail')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('heading', { name: 'Aguardamos a confirmação da Castro’s.' })).toBeInTheDocument()
    expect(apiMocks.getBooking).toHaveBeenCalledTimes(2)
    expect(apiMocks.createBooking).not.toHaveBeenCalled()
  })

  it('hides a previously confirmed state when revalidation fails', async () => {
    apiMocks.getBooking.mockResolvedValueOnce({ reference: 'CASTRO-CACHED', status: 'CONFIRMED', startAt: '', endAt: '' }).mockRejectedValueOnce(new Error('offline'))
    const { queryClient } = renderBooking('/reservar/confirmacao/CASTRO-CACHED')
    await screen.findByRole('heading', { name: 'Reserva confirmada.' })
    await act(async () => { await queryClient.invalidateQueries({ queryKey: ['booking', 'CASTRO-CACHED'] }) })
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText('Reserva confirmada.')).not.toBeInTheDocument()
    expect(screen.queryByText('CASTRO-CACHED')).not.toBeInTheDocument()
  })

})
