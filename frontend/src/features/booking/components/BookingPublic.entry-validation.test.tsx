import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import { BookingCustomer, BookingReview } from './BookingPublic'

const api = vi.hoisted(() => ({ public: { listServices: vi.fn() }, availability: { list: vi.fn() }, bookings: { create: vi.fn() } }))
vi.mock('../../../app/providers/AppProviders', () => ({ useApi: () => api }))

beforeEach(() => {
  vi.resetAllMocks()
  sessionStorage.clear()
  sessionStorage.setItem('castros-booking:SERVICE:service-1', JSON.stringify({ date: '2026-10-12', durationMinutes: 60, startTime: '09:00', endTime: '10:00', firstName: 'Ana', email: 'ana@example.com' }))
  api.public.listServices.mockResolvedValue({ items: [{ id: 'service-1', bookingEnabled: true, durationMinutes: 60 }] })
  api.availability.list.mockResolvedValue({ items: [{ start: '09:00', end: '10:00', status: 'AVAILABLE' }] })
})

function enter(step: 'dados' | 'rever') {
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter initialEntries={['/reservar/SERVICE/service-1/' + step]}><Routes><Route path="/reservar/:bookableType/:bookableId/dados" element={<BookingCustomer />} /><Route path="/reservar/:bookableType/:bookableId/rever" element={<BookingReview />} /></Routes></MemoryRouter></QueryClientProvider>)
  return screen.getByRole('button', { name: step === 'dados' ? /Rever pedido/ : /Enviar pedido/ })
}

it.each(['dados', 'rever'] as const)('blocks direct %s entry until both lookups resolve', async (step) => {
  const action = enter(step)
  expect(action).toBeDisabled()
  await waitFor(() => expect(action).toBeEnabled())
  expect(api.public.listServices).toHaveBeenCalledTimes(1)
  expect(api.availability.list).toHaveBeenCalledWith({ bookableType: 'SERVICE', bookableId: 'service-1', date: '2026-10-12', durationMinutes: 60 })
  expect(api.bookings.create).not.toHaveBeenCalled()
})

it.each([
  { items: [] },
  { items: [{ id: 'service-1', bookingEnabled: false, durationMinutes: 60 }] },
  { items: [{ id: 'service-1', bookingEnabled: true, durationMinutes: 90 }] },
])('blocks a removed, disabled or changed resource', async (catalogue) => {
  api.public.listServices.mockResolvedValue(catalogue)
  const action = enter('rever')
  await waitFor(() => expect(screen.queryByText('A verificar o recurso da reserva.')).not.toBeInTheDocument())
  expect(action).toBeDisabled()
  expect(api.availability.list).not.toHaveBeenCalled()
  expect(api.bookings.create).not.toHaveBeenCalled()
})

it('keeps customer values after a resource failure and recovers by retry', async () => {
  api.public.listServices.mockRejectedValueOnce(new Error('offline'))
  const action = enter('dados')
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível verificar o recurso.')
  expect(screen.getByLabelText(/^Nome/)).toHaveValue('Ana')
  expect(action).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Verificar novamente' }))
  await waitFor(() => expect(action).toBeEnabled())
})

it.each(['BOOKED', 'ERROR'])('blocks review when slot revalidation returns %s', async (state) => {
  if (state === 'ERROR') api.availability.list.mockRejectedValue(new Error('offline'))
  else api.availability.list.mockResolvedValue({ items: [{ start: '09:00', end: '10:00', status: state }] })
  const action = enter('rever')
  await screen.findByRole('alert')
  expect(action).toBeDisabled()
  await userEvent.click(action)
  expect(api.bookings.create).not.toHaveBeenCalled()
})
