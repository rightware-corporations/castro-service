import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SecretaryCalendarPage } from './SecretaryCalendarPage'

const apiMocks = vi.hoisted(() => ({
  listBookings: vi.fn(), listBlockedPeriods: vi.fn(), listAdminServices: vi.fn(), listAdminSpaces: vi.fn(), getConfig: vi.fn(),
  updateBookingStatus: vi.fn(), listRescheduleSlots: vi.fn(), rescheduleBooking: vi.fn(), createBlockedPeriod: vi.fn(), deleteBlockedPeriod: vi.fn(),
}))

vi.mock('../../app/providers/AppProviders', () => ({
  useCan: () => () => true,
  useApi: () => ({
    public: { getConfig: apiMocks.getConfig },
    operations: {
      listBookings: apiMocks.listBookings,
      listBlockedPeriods: apiMocks.listBlockedPeriods,
      listAdminServices: apiMocks.listAdminServices,
      listAdminSpaces: apiMocks.listAdminSpaces,
      updateBookingStatus: apiMocks.updateBookingStatus,
      listRescheduleSlots: apiMocks.listRescheduleSlots,
      rescheduleBooking: apiMocks.rescheduleBooking,
      createBlockedPeriod: apiMocks.createBlockedPeriod,
      deleteBlockedPeriod: apiMocks.deleteBlockedPeriod,
    },
  }),
}))

function todayKey() {
  const value = new Date()
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function renderCalendar() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return { user: userEvent.setup(), ...render(<QueryClientProvider client={queryClient}><SecretaryCalendarPage /></QueryClientProvider>) }
}

describe('secretary calendar workspace', () => {
  beforeEach(() => {
    Object.values(apiMocks).forEach((mock) => mock.mockReset())
    const date = todayKey()
    apiMocks.getConfig.mockResolvedValue({ businessTimezone: 'Africa/Maputo' })
    apiMocks.listAdminServices.mockResolvedValue({ items: [{ id: 'service-1', name: 'Consultoria', active: true }], total: 1 })
    apiMocks.listAdminSpaces.mockResolvedValue({ items: [], total: 0 })
    apiMocks.listBlockedPeriods.mockResolvedValue({ items: [], total: 0 })
    apiMocks.listBookings.mockResolvedValue({ items: [{
      id: 'booking-1', reference: 'CST-001', status: 'PENDING', bookableType: 'SERVICE', bookableId: 'service-1',
      startAt: `${date}T09:00:00+02:00`, endAt: `${date}T10:00:00+02:00`, createdAt: `${date}T08:00:00+02:00`,
      customerId: 'customer-1', firstName: 'Ana', lastName: 'Silva', email: 'ana@example.com', phone: '+258840000000',
    }], total: 1 })
    apiMocks.updateBookingStatus.mockResolvedValue({})
    apiMocks.listRescheduleSlots.mockResolvedValue({ items: [{ start: '11:00', end: '12:00', status: 'AVAILABLE' }], total: 1 })
    apiMocks.rescheduleBooking.mockResolvedValue({})
    apiMocks.createBlockedPeriod.mockResolvedValue({})
    apiMocks.deleteBlockedPeriod.mockResolvedValue(undefined)
  })

  it('shows month/week views and lets the secretary confirm and reschedule a booking', async () => {
    const { user } = renderCalendar()
    expect(await screen.findByRole('heading', { name: 'Calendário operacional' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Semana' }))
    expect(screen.getByRole('button', { name: 'Semana' })).toHaveClass('is-active')
    await user.click(screen.getByRole('button', { name: 'Mês' }))
    expect(screen.getByRole('button', { name: 'Mês' })).toHaveClass('is-active')

    const bookingButtons = screen.getAllByRole('button').filter((button) => button.textContent?.includes('CST-001') && button.textContent?.includes('Ana Silva'))
    expect(bookingButtons).toHaveLength(1)
    await user.click(bookingButtons[0])

    expect(screen.getByText('+258840000000')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Confirmar/i }))
    await waitFor(() => expect(apiMocks.updateBookingStatus).toHaveBeenCalledWith('booking-1', 'CONFIRMED'))

    await user.click(screen.getByRole('button', { name: /Reagendar/i }))
    expect(await screen.findByRole('button', { name: '11:00–12:00' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '11:00–12:00' }))
    await waitFor(() => expect(apiMocks.rescheduleBooking).toHaveBeenCalledWith('booking-1', {
      date: todayKey(), startTime: '11:00', endTime: '12:00',
    }))
  })

  it('creates an external blocked period against the selected service', async () => {
    apiMocks.listBookings.mockResolvedValue({ items: [], total: 0 })
    const { user } = renderCalendar()
    expect(await screen.findByRole('heading', { name: 'Bloquear horário' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Motivo'), 'Marcação por telefone')
    await user.click(screen.getByRole('button', { name: /Bloquear horário/i }))

    await waitFor(() => expect(apiMocks.createBlockedPeriod).toHaveBeenCalledWith({
      bookableType: 'SERVICE',
      bookableId: 'service-1',
      startAt: `${todayKey()}T09:00:00+02:00`,
      endAt: `${todayKey()}T10:00:00+02:00`,
      reason: 'Marcação por telefone',
    }))
  })
})
