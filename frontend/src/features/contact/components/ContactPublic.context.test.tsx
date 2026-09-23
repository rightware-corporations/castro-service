import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ContactPublic } from './ContactPublic'

const api = vi.hoisted(() => ({ public: { listServices: vi.fn() }, requests: { create: vi.fn() } }))
vi.mock('../../../app/providers/AppProviders', () => ({ useApi: () => api }))

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/contacto?source=SERVICE&entity=service-1&type=CONSULTATION']}><ContactPublic /></MemoryRouter></QueryClientProvider>)
}

describe('verified contact origin', () => {
  it('shows the name returned by the API and submits its validated identity', async () => {
    api.public.listServices.mockResolvedValue({ items: [{ id: 'service-1', name: 'Serviço publicado', slug: 'publicado' }] })
    api.requests.create.mockResolvedValue({ id: 'request-1', status: 'NEW' })
    setup()
    expect(await screen.findByText(/Serviço selecionado: Serviço publicado/)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/Nome/), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/Apelido/), { target: { value: 'Silva' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'ana@example.com' } })
    fireEvent.submit(screen.getAllByRole('button', { name: /Enviar pedido/ })[0].closest('form')!)
    await waitFor(() => expect(api.requests.create).toHaveBeenCalledWith(expect.objectContaining({ context: expect.objectContaining({ sourceType: 'SERVICE', entityId: 'service-1' }) }), expect.objectContaining({ idempotencyKey: expect.any(String) })))
  })

  it('distinguishes an unavailable origin from a failed lookup', async () => {
    api.public.listServices.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce({ items: [] })
    setup()
    expect(await screen.findByText(/Não foi possível verificar a origem/)).toBeInTheDocument()
    expect(screen.queryByText(/já não está disponível/)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Nome/)).toBeEnabled()
    expect(screen.getAllByRole('button', { name: /Enviar pedido/ })[0]).toBeDisabled()
    fireEvent.change(screen.getByLabelText(/Nome/), { target: { value: 'Ana' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByText(/A origem já não está disponível/)).toBeInTheDocument()
    expect(screen.queryByText(/contexto preservado/)).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Enviar pedido/ })[0]).toBeEnabled()
    expect(screen.getByLabelText(/Nome/)).toHaveValue('Ana')
  })
})
