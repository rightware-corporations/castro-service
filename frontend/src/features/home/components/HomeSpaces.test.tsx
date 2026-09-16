import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HomeSpaces } from './HomeSpaces'

const mocks = vi.hoisted(() => ({ spaces: vi.fn(), scenes: vi.fn() }))
vi.mock('../../spaces/hooks', () => ({ useSpacesPreview: mocks.spaces }))
vi.mock('../../../api/client/spacePublicExperience', () => ({ spacePublicExperience: { listScenes: mocks.scenes } }))

function renderSpaces() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><MemoryRouter><HomeSpaces /></MemoryRouter></QueryClientProvider>)
}

describe('Home spaces integrity', () => {
  beforeEach(() => {
    mocks.spaces.mockReturnValue({ isLoading: false, isError: false, data: { items: [
      { id: 'one', slug: 'sala-um', name: 'Sala Um', location: 'Maputo', capacityMax: 12 },
      { id: 'two', slug: 'sala-dois', name: 'Sala Dois' },
    ] } })
    mocks.scenes.mockImplementation(async (id: string) => [{ id, panoramaUrl: `/scene-${id}.jpg`, title: `Vista ${id}` }])
  })

  it('keeps media, selection, real metadata and detail links together', async () => {
    renderSpaces()
    expect(await screen.findByRole('img', { name: 'Vista one — Sala Um' })).toHaveAttribute('src', '/scene-one.jpg')
    expect(screen.getByText('12 pessoas')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Sala Dois/ }))
    expect(screen.getByRole('button', { name: /Sala Dois/ })).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByRole('img', { name: 'Vista two — Sala Dois' })).toHaveAttribute('src', '/scene-two.jpg')
    expect(screen.getByRole('link', { name: 'Conhecer Sala Dois' })).toHaveAttribute('href', '/espacos/sala-dois')
    expect(screen.getByRole('link', { name: 'Explorar o espaço' })).toHaveAttribute('href', '/espacos/sala-dois/explorar')
    expect(screen.queryByText('12 pessoas')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /reservar/i })).not.toBeInTheDocument()
  })

  it('reports a broken image without substituting a generated venue', async () => {
    renderSpaces()
    fireEvent.error(await screen.findByRole('img', { name: 'Vista one — Sala Um' }))
    expect(screen.getByText('Pré-visualização indisponível')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Conhecer Sala Um' })).toBeInTheDocument()
  })

  it('does not retain stale space data when the catalog fails', () => {
    mocks.spaces.mockReturnValue({ isLoading: false, isError: true, data: { items: [{ id: 'one', slug: 'sala-um', name: 'Sala Um' }] } })
    renderSpaces()
    expect(screen.getByRole('heading', { name: 'Não foi possível carregar os espaços.' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Conhecer Sala Um' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todos os espaços' })).toHaveAttribute('href', '/espacos')
  })
})
