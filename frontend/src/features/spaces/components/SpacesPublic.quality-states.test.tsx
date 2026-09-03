import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SpaceConfigurator, SpaceDetail, SpaceExplorer, SpacesCatalog } from './SpacesPublic'

const hookMocks = vi.hoisted(() => ({
  useSpaces: vi.fn(),
  useSpace: vi.fn(),
}))

const experienceMocks = vi.hoisted(() => ({
  listScenes: vi.fn(),
  listHotspots: vi.fn(),
}))

vi.mock('../hooks', () => ({
  useSpaces: hookMocks.useSpaces,
  useSpace: hookMocks.useSpace,
}))

vi.mock('../../../api/client/spacePublicExperience', () => ({
  spacePublicExperience: {
    listScenes: experienceMocks.listScenes,
    listHotspots: experienceMocks.listHotspots,
  },
}))

const space = {
  id: 'space-1',
  slug: 'sala-reuniao',
  name: 'Sala de Reunião',
  description: 'Espaço publicado para reuniões.',
  location: 'Maputo',
  capacityMin: 2,
  capacityMax: 10,
}

function renderRoute(path: string, element: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/espacos/:slug" element={element} />
          <Route path="/espacos/:slug/explorar" element={element} />
          <Route path="/espacos/:slug/configurar" element={element} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('public spaces quality states', () => {
  beforeEach(() => {
    hookMocks.useSpaces.mockReset()
    hookMocks.useSpace.mockReset()
    experienceMocks.listScenes.mockReset()
    experienceMocks.listHotspots.mockReset()
    experienceMocks.listScenes.mockResolvedValue([])
    experienceMocks.listHotspots.mockResolvedValue([])
  })

  it('renders catalog loading, error and empty states', () => {
    hookMocks.useSpaces.mockReturnValue({ isLoading: true, isError: false })
    const { rerender } = render(<MemoryRouter><SpacesCatalog /></MemoryRouter>)
    expect(screen.getByRole('status')).toHaveTextContent('A carregar espaços.')

    hookMocks.useSpaces.mockReturnValue({ isLoading: false, isError: true })
    rerender(<MemoryRouter><SpacesCatalog /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Não foi possível carregar os espaços.' })).toBeInTheDocument()

    hookMocks.useSpaces.mockReturnValue({ isLoading: false, isError: false, data: { items: [] } })
    rerender(<MemoryRouter><SpacesCatalog /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Catálogo em preparação' })).toBeInTheDocument()
  })

  it('renders detail loading, error and not-found states', () => {
    hookMocks.useSpace.mockReturnValue({ isLoading: true, isError: false })
    const { unmount } = renderRoute('/espacos/sala-reuniao', <SpaceDetail />)
    expect(screen.getByRole('status')).toHaveTextContent('A carregar espaço.')
    unmount()

    hookMocks.useSpace.mockReturnValue({ isLoading: false, isError: true })
    const errorView = renderRoute('/espacos/sala-reuniao', <SpaceDetail />)
    expect(screen.getByRole('heading', { name: 'Não foi possível carregar este espaço.' })).toBeInTheDocument()
    errorView.unmount()

    hookMocks.useSpace.mockReturnValue({ isLoading: false, isError: false })
    renderRoute('/espacos/sala-reuniao', <SpaceDetail />)
    expect(screen.getByRole('heading', { name: 'Espaço não encontrado.' })).toBeInTheDocument()
  })

  it('renders explorer loading and parent-space error states', () => {
    hookMocks.useSpace.mockReturnValue({ isLoading: true, isError: false })
    const { unmount } = renderRoute('/espacos/sala-reuniao/explorar', <SpaceExplorer />)
    expect(screen.getByRole('status')).toHaveTextContent('A preparar o explorador.')
    unmount()

    hookMocks.useSpace.mockReturnValue({ isLoading: false, isError: true })
    renderRoute('/espacos/sala-reuniao/explorar', <SpaceExplorer />)
    expect(screen.getByRole('heading', { name: 'Não foi possível abrir este espaço.' })).toBeInTheDocument()
  })

  it('renders explorer empty state when no real panorama is published', async () => {
    hookMocks.useSpace.mockReturnValue({ isLoading: false, isError: false, data: space })
    experienceMocks.listScenes.mockResolvedValue([])

    renderRoute('/espacos/sala-reuniao/explorar', <SpaceExplorer />)

    expect(await screen.findByText('Panorama ainda não publicado.')).toBeInTheDocument()
    expect(screen.getByText('Sem panorama publicado.')).toBeInTheDocument()
  })

  it('renders explorer scene API error without inventing fallback media', async () => {
    hookMocks.useSpace.mockReturnValue({ isLoading: false, isError: false, data: space })
    experienceMocks.listScenes.mockRejectedValue(new Error('scene backend unavailable'))

    renderRoute('/espacos/sala-reuniao/explorar', <SpaceExplorer />)

    expect(await screen.findByRole('heading', { name: 'Não foi possível carregar as cenas deste espaço.' })).toBeInTheDocument()
    expect(screen.queryByText('scene backend unavailable')).not.toBeInTheDocument()
  })

  it('renders configurator loading and parent-space error states', () => {
    hookMocks.useSpace.mockReturnValue({ isLoading: true, isError: false })
    const { unmount } = renderRoute('/espacos/sala-reuniao/configurar', <SpaceConfigurator />)
    expect(screen.getByRole('status')).toHaveTextContent('A preparar configuração.')
    unmount()

    hookMocks.useSpace.mockReturnValue({ isLoading: false, isError: true })
    renderRoute('/espacos/sala-reuniao/configurar', <SpaceConfigurator />)
    expect(screen.getByRole('heading', { name: 'Não foi possível configurar este espaço.' })).toBeInTheDocument()
  })
})
