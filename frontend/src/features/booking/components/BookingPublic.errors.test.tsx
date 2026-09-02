import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, type ApiErrorCode } from '../../../api/client/errors'
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

function seedServiceReviewDraft() {
  sessionStorage.setItem('castros-booking:SERVICE:service-1', JSON.stringify({
    date: '2026-09-15',
    durationMinutes: 60,
    startTime: '09:00',
    endTime: '10:00',
    firstName: 'Ana',
    email: 'ana@example.com',
  }))
}

type SubmissionErrorCase = {
  code?: ApiErrorCode
  expected: string
}

const submissionErrorCases: SubmissionErrorCase[] = [
  {
    code: 'BOOKING_SLOT_UNAVAILABLE',
    expected: 'Este horário deixou de estar disponível. Volte ao passo de horário e escolha outro.',
  },
  {
    code: 'IDEMPOTENCY_KEY_REUSED',
    expected: 'Este envio já foi processado com dados diferentes. Volte ao passo anterior, reveja os dados e tente novamente.',
  },
  {
    code: 'BOOKABLE_INACTIVE',
    expected: 'Este item deixou de estar disponível para reserva.',
  },
  {
    code: 'VALIDATION_FAILED',
    expected: 'Alguns dados da reserva precisam de ser revistos.',
  },
  {
    code: 'RESOURCE_NOT_FOUND',
    expected: 'Não foi possível enviar o pedido de reserva. Tente novamente.',
  },
  {
    code: 'INTERNAL_ERROR',
    expected: 'Não foi possível enviar o pedido de reserva. Tente novamente.',
  },
]

describe('public booking error states', () => {
  beforeEach(() => {
    sessionStorage.clear()
    apiMocks.listAvailability.mockReset()
    apiMocks.createBooking.mockReset()
    apiMocks.getBooking.mockReset()
  })

  it('shows a safe availability error when the lookup fails', async () => {
    sessionStorage.setItem('castros-booking:SERVICE:service-1', JSON.stringify({
      date: '2026-09-15',
      durationMinutes: 60,
    }))
    apiMocks.listAvailability.mockRejectedValue(new ApiError('Database timeout', { code: 'INTERNAL_ERROR' }))

    renderBooking('/reservar/SERVICE/service-1/horario')

    expect(await screen.findByText('Não foi possível consultar a disponibilidade.')).toBeInTheDocument()
    expect(screen.queryByText('Database timeout')).not.toBeInTheDocument()
  })

  it('renders the no-slots state when availability succeeds with an empty result', async () => {
    sessionStorage.setItem('castros-booking:SERVICE:service-1', JSON.stringify({
      date: '2026-09-15',
      durationMinutes: 60,
    }))
    apiMocks.listAvailability.mockResolvedValue({ items: [], total: 0 })

    renderBooking('/reservar/SERVICE/service-1/horario')

    expect(await screen.findByText('Sem horários disponíveis')).toBeInTheDocument()
    expect(screen.getByText('Não existem horários disponíveis para esta combinação de data e duração.')).toBeInTheDocument()
  })

  it.each(submissionErrorCases)('maps $code booking submission failures to the intended public message', async ({ code, expected }) => {
    seedServiceReviewDraft()
    apiMocks.createBooking.mockRejectedValue(new ApiError('Sensitive backend detail', { code }))

    const { user } = renderBooking('/reservar/SERVICE/service-1/rever')
    await user.click(screen.getByRole('button', { name: /Enviar pedido de reserva/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(expected)
    expect(screen.queryByText('Sensitive backend detail')).not.toBeInTheDocument()
    expect(sessionStorage.getItem('castros-booking:SERVICE:service-1')).not.toBeNull()
  })

  it('uses the generic public submission message for an unexpected non-API failure', async () => {
    seedServiceReviewDraft()
    apiMocks.createBooking.mockRejectedValue(new Error('network socket details'))

    const { user } = renderBooking('/reservar/SERVICE/service-1/rever')
    await user.click(screen.getByRole('button', { name: /Enviar pedido de reserva/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível enviar o pedido de reserva. Tente novamente.')
    expect(screen.queryByText('network socket details')).not.toBeInTheDocument()
  })

  it('explains that submission succeeded when confirmation details cannot be loaded', async () => {
    apiMocks.getBooking.mockRejectedValue(new ApiError('Reference lookup failed', { code: 'RESOURCE_NOT_FOUND' }))

    renderBooking('/reservar/confirmacao/CASTRO-404')

    expect(screen.getByText('Reserva registada.')).toBeInTheDocument()
    expect(await screen.findByText('A reserva foi enviada, mas não foi possível carregar os detalhes da confirmação.')).toBeInTheDocument()
    expect(screen.queryByText('Reference lookup failed')).not.toBeInTheDocument()
  })
})
