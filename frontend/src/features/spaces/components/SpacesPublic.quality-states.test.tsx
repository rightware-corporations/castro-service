import { SpaceExplorer } from './SpaceExplorer'
import { SpaceConfigurator } from './SpaceConfigurator'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SpaceDetail, SpacesCatalog } from './SpacesPublic'

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
  it.each([{ isLoading: true, isError: false }, { isLoading: false, isError: true }])('hides stale catalogue actions during %o', (state) => {
    hookMocks.useSpaces.mockReturnValue({ ...state, data: { items: [space] } })
    render(<MemoryRouter><SpacesCatalog /></MemoryRouter>)
    expect(screen.queryByRole('link', { name: /Conhecer espaço/ })).not.toBeInTheDocument()
  })
  it('replaces broken detail media with an honest unavailable state', async () => {
    hookMocks.useSpace.mockReturnValue({ isLoading: false, isError: false, data: space })
    experienceMocks.listScenes.mockResolvedValue([{ id: 'scene-1', title: 'Sala', panoramaUrl: '/test-scene.jpg' }])
    renderRoute('/espacos/sala-reuniao', <SpaceDetail />)
    fireEvent.error(await screen.findByRole('img', { name: 'Sala — Sala de Reunião' }))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Pré-visualização indisponível')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Configurar encontro/ })).toBeInTheDocument()
  })
  it('hides a broken explorer panorama and disables its zoom', async () => {
    hookMocks.useSpace.mockReturnValue({ isLoading: false, isError: false, data: space })
    experienceMocks.listScenes.mockResolvedValue([{ id: 'scene-1', title: 'Sala', panoramaUrl: '/test-scene.jpg' }])
    renderRoute('/espacos/sala-reuniao/explorar', <SpaceExplorer />)
    fireEvent.error(await screen.findByRole('img', { name: 'Panorama: Sala' }))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Não foi possível apresentar este panorama.' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aumentar zoom' })).toBeDisabled()
  })

  it('moves focus into information and restores it on Escape', async () => {
    hookMocks.useSpace.mockReturnValue({ isLoading: false, isError: false, data: space })
    renderRoute('/espacos/sala-reuniao/explorar', <SpaceExplorer />)
    const trigger = screen.getByRole('button', { name: 'Informação' })
    fireEvent.click(trigger)
    expect(screen.getByRole('button', { name: 'Fechar informação' })).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(trigger).toHaveFocus()
    expect(screen.queryByRole('complementary', { name: /Informação sobre/ })).not.toBeInTheDocument()
  })

  it('keeps a loaded hotspot aligned with zoom and restores its keyboard focus', async () => {
    const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000)
    const height = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600)
    try {
      hookMocks.useSpace.mockReturnValue({ isLoading: false, isError: false, data: space })
      experienceMocks.listScenes.mockResolvedValue([{ id: 'scene-1', title: 'Sala', panoramaUrl: '/test-scene.jpg' }])
      experienceMocks.listHotspots.mockResolvedValue([{ id: 'point-1', title: 'Mesa', yaw: 90, pitch: 0 }])
      renderRoute('/espacos/sala-reuniao/explorar', <SpaceExplorer />)
      const image = await screen.findByRole('img', { name: 'Panorama: Sala' })
      Object.defineProperties(image, { naturalWidth: { value: 2000 }, naturalHeight: { value: 1000 } })
      fireEvent.load(image)
      const point = await screen.findByRole('button', { name: 'Mesa. Ver informação.' })
      expect(parseFloat(point.style.left)).toBeCloseTo(800)
      fireEvent.click(screen.getByRole('button', { name: 'Aumentar zoom' }))
      expect(parseFloat(point.style.left)).toBeCloseTo(845)
      fireEvent.click(point)
      expect(point).toHaveAttribute('aria-expanded', 'true')
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(point).toHaveFocus()
      expect(point).toHaveAttribute('aria-expanded', 'false')
    } finally { width.mockRestore(); height.mockRestore() }
  })

})
