import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../api/client/errors'
import { BookingConfirmation, BookingCustomer, BookingDate, BookingReview, BookingTime } from './BookingPublic'

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
            <Route path="/reservar/:bookableType/:bookableId/data" element={<BookingDate />} />
            <Route path="/reservar/:bookableType/:bookableId/horario" element={<BookingTime />} />
            <Route path="/reservar/:bookableType/:bookableId/dados" element={<BookingCustomer />} />
            <Route path="/reservar/:bookableType/:bookableId/rever" element={<BookingReview />} />
            <Route path="/reservar/confirmacao/:reference" element={<BookingConfirmation />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  }
}

describe('public booking flow', () => {
  beforeEach(() => {
    sessionStorage.clear()
    apiMocks.listAvailability.mockReset()
    apiMocks.createBooking.mockReset()
    apiMocks.getBooking.mockReset()
  })

  it('completes selection, availability, customer data, review and confirmation with the expected request', async () => {
    apiMocks.listAvailability.mockResolvedValue({
      items: [{ start: '09:00', end: '10:00', status: 'AVAILABLE' }],
      total: 1,
    })
    apiMocks.createBooking.mockResolvedValue({
      id: 'booking-1',
      reference: 'CASTRO-001',
      status: 'PENDING',
      startAt: '2026-09-15T09:00:00+02:00',
      endAt: '2026-09-15T10:00:00+02:00',
    })
    apiMocks.getBooking.mockResolvedValue({
      reference: 'CASTRO-001',
      status: 'PENDING',
      startAt: '2026-09-15T09:00:00+02:00',
      endAt: '2026-09-15T10:00:00+02:00',
    })

    const { user } = renderBooking('/reservar/SPACE/space-1/data?people=8&purpose=meeting&duration=60&date=2026-09-15')

    expect(screen.getByLabelText('Data')).toHaveValue('2026-09-15')
    expect(screen.getByLabelText(/Duração prevista/)).toHaveValue(60)

    await user.click(screen.getByRole('button', { name: /Ver horários/i }))

    await waitFor(() => expect(apiMocks.listAvailability).toHaveBeenCalledWith({
      bookableType: 'SPACE',
      bookableId: 'space-1',
      date: '2026-09-15',
      durationMinutes: 60,
    }))

    const availableSlot = await screen.findByRole('button', { name: /Disponível/i })
    await user.click(availableSlot)
    await user.click(screen.getByRole('button', { name: /Continuar/i }))

    await user.type(screen.getByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('Apelido'), 'Silva')
    await user.type(screen.getByLabelText('Email'), 'ana@example.com')
    expect(screen.getByLabelText('Participantes')).toHaveValue(8)

    await user.click(screen.getByRole('button', { name: /Rever pedido/i }))
    expect(screen.getByText('Confirme antes de enviar.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Enviar pedido de reserva/i }))

    await waitFor(() => expect(apiMocks.createBooking).toHaveBeenCalledTimes(1))
    expect(apiMocks.createBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        bookableType: 'SPACE',
        bookableId: 'space-1',
        date: '2026-09-15',
        startTime: '09:00',
        endTime: '10:00',
        participants: 8,
        customer: expect.objectContaining({
          firstName: 'Ana',
          lastName: 'Silva',
          email: 'ana@example.com',
        }),
        spaceConfiguration: { purpose: 'meeting' },
      }),
      { idempotencyKey: expect.any(String) },
    )

    await waitFor(() => expect(apiMocks.getBooking).toHaveBeenCalledWith('CASTRO-001'))
    expect(await screen.findByText('CASTRO-001')).toBeInTheDocument()
    expect(sessionStorage.getItem('castros-booking:SPACE:space-1')).toBeNull()
  })

  it('keeps the same idempotency key when a failed booking submission is retried', async () => {
    sessionStorage.setItem('castros-booking:SERVICE:service-1', JSON.stringify({
      date: '2026-09-15',
      durationMinutes: 60,
      startTime: '09:00',
      endTime: '10:00',
      firstName: 'Ana',
      email: 'ana@example.com',
    }))

    apiMocks.createBooking
      .mockRejectedValueOnce(new ApiError('Horário indisponível.', { code: 'AVAILABILITY_CONFLICT' }))
      .mockResolvedValueOnce({
        id: 'booking-2',
        reference: 'CASTRO-002',
        status: 'PENDING',
        startAt: '2026-09-15T09:00:00+02:00',
        endAt: '2026-09-15T10:00:00+02:00',
      })
    apiMocks.getBooking.mockResolvedValue({
      reference: 'CASTRO-002',
      status: 'PENDING',
      startAt: '2026-09-15T09:00:00+02:00',
      endAt: '2026-09-15T10:00:00+02:00',
    })

    const { user } = renderBooking('/reservar/SERVICE/service-1/rever')
    const submit = screen.getByRole('button', { name: /Enviar pedido de reserva/i })

    await user.click(submit)
    expect(await screen.findByRole('alert')).toHaveTextContent('Horário indisponível.')
    await waitFor(() => expect(apiMocks.createBooking).toHaveBeenCalledTimes(1))

    const firstKey = apiMocks.createBooking.mock.calls[0][1]?.idempotencyKey
    expect(firstKey).toEqual(expect.any(String))

    await user.click(screen.getByRole('button', { name: /Enviar pedido de reserva/i }))
    await waitFor(() => expect(apiMocks.createBooking).toHaveBeenCalledTimes(2))

    const secondKey = apiMocks.createBooking.mock.calls[1][1]?.idempotencyKey
    expect(secondKey).toBe(firstKey)
    expect(await screen.findByText('CASTRO-002')).toBeInTheDocument()
  })
})
