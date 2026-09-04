import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BookingTime } from './BookingPublic'

const apiMocks = vi.hoisted(() => ({ listAvailability: vi.fn() }))

vi.mock('../../../app/providers/AppProviders', () => ({
  useApi: () => ({ availability: { list: apiMocks.listAvailability } }),
}))
vi.mock('../../contact/PublicContactChannels', () => ({ PublicContactChannels: () => <div>contact-channels</div> }))

function renderTime() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/reservar/SERVICE/service-1/horario']}>
          <Routes>
            <Route path="/reservar/:bookableType/:bookableId/horario" element={<BookingTime />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  }
}

describe('public booking no-slot recovery', () => {
  beforeEach(() => {
    sessionStorage.clear()
    sessionStorage.setItem('castros-booking:SERVICE:service-1', JSON.stringify({ date: '2026-09-15', durationMinutes: 60 }))
    apiMocks.listAvailability.mockReset()
  })

  it('finds and selects the next real availability while preserving an enquiry fallback', async () => {
    apiMocks.listAvailability.mockImplementation(async ({ date }: { date: string }) => {
      if (date === '2026-09-17') return { items: [{ start: '14:00', end: '15:00', status: 'AVAILABLE' }], total: 1 }
      return { items: [], total: 0 }
    })

    const { user } = renderTime()

    expect(await screen.findByRole('heading', { name: 'Sem horários disponíveis' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pedir outro horário' }).getAttribute('href')).toContain('REQUEST_OTHER_TIME')

    await waitFor(() => expect(apiMocks.listAvailability).toHaveBeenCalledWith({
      bookableType: 'SERVICE', bookableId: 'service-1', date: '2026-09-17', durationMinutes: 60,
    }))
    expect(await screen.findByText(/17 de setembro de 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/14:00/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Escolher este horário/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /Continuar/i })).toBeEnabled())

    const stored = JSON.parse(sessionStorage.getItem('castros-booking:SERVICE:service-1') ?? '{}')
    expect(stored).toMatchObject({ date: '2026-09-17', startTime: '14:00', endTime: '15:00' })
  })

  it('reports when no availability exists in the 30-day recovery horizon', async () => {
    apiMocks.listAvailability.mockResolvedValue({ items: [], total: 0 })
    renderTime()
    expect(await screen.findByText('Não encontrámos disponibilidade nos próximos 30 dias.')).toBeInTheDocument()
    expect(apiMocks.listAvailability).toHaveBeenCalledTimes(31)
  })
})
