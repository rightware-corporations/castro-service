import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HomePublic } from './HomePublic'

const homeMocks = vi.hoisted(() => ({
  usePublicConfig: vi.fn(),
  useServices: vi.fn(),
  useCourses: vi.fn(),
  useSpacesPreview: vi.fn(),
}))

vi.mock('../hooks', () => ({ usePublicConfig: homeMocks.usePublicConfig }))
vi.mock('../../services/hooks', () => ({ useServices: homeMocks.useServices }))
vi.mock('../../courses/hooks', () => ({ useCourses: homeMocks.useCourses }))
vi.mock('../../spaces/hooks', () => ({ useSpacesPreview: homeMocks.useSpacesPreview }))

function renderHome() {
  return render(<MemoryRouter><HomePublic /></MemoryRouter>)
}

describe('homepage public quality states', () => {
  afterEach(() => vi.unstubAllGlobals())
  beforeEach(() => {
    sessionStorage.setItem('castros.home.entry.v1', 'seen')
    vi.stubGlobal('matchMedia', () => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    homeMocks.usePublicConfig.mockReset()
    homeMocks.useServices.mockReset()
    homeMocks.useCourses.mockReset()
    homeMocks.useSpacesPreview.mockReset()

    homeMocks.usePublicConfig.mockReturnValue({ isLoading: false, isError: false, data: { businessTimezone: 'Africa/Maputo' } })
    homeMocks.useServices.mockReturnValue({ isLoading: false, isError: false, data: { items: [] } })
    homeMocks.useCourses.mockReturnValue({ isLoading: false, isError: false, data: { items: [] } })
    homeMocks.useSpacesPreview.mockReturnValue({ isLoading: false, isError: false, data: { items: [] } })
  })

  it('renders loading states for live service and training previews', () => {
    homeMocks.useServices.mockReturnValue({ isLoading: true, isError: false })
    homeMocks.useCourses.mockReturnValue({ isLoading: true, isError: false })

    renderHome()

    const statuses = screen.getAllByRole('status')
    expect(statuses).toHaveLength(2)
    statuses.forEach((status) => expect(status).toHaveTextContent('A carregar conteúdo.'))
  })

  it('renders safe error states for live service and training previews', () => {
    homeMocks.useServices.mockReturnValue({ isLoading: false, isError: true })
    homeMocks.useCourses.mockReturnValue({ isLoading: false, isError: true })

    renderHome()

    expect(screen.getAllByRole('heading', { name: 'Não foi possível carregar esta área.' })).toHaveLength(2)
  })

  it('renders truthful empty states when published catalogs have no items', () => {
    renderHome()

    expect(screen.getAllByRole('heading', { name: 'Catálogo em preparação' })).toHaveLength(2)
  })

  it('uses published services in Consulting with real detail destinations and no unverified booking', () => {
    homeMocks.useServices.mockReturnValue({ isLoading: false, isError: false, data: { items: [
      { id: 'real-1', slug: 'lideranca', name: 'Liderança organizacional', bookingEnabled: false },
      { id: 'real-2', slug: 'atendimento', name: 'Atendimento ao cliente', bookingEnabled: true },
    ] } })
    renderHome()
    expect(screen.getByRole('link', { name: /Liderança organizacional/ })).toHaveAttribute('href', '/servicos/lideranca')
    expect(screen.getByRole('link', { name: /Atendimento ao cliente/ })).toHaveAttribute('href', '/servicos/atendimento')
    expect(screen.getByRole('list', { name: 'Serviços publicados' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /agendar|reservar/i })).not.toBeInTheDocument()
  })

  it('shows only course metadata supplied by the API without inventing a session', () => {
    homeMocks.useCourses.mockReturnValue({ isLoading: false, isError: false, data: { items: [
      { id: 'course-1', slug: 'comunicacao', name: 'Comunicação', modality: 'Presencial', durationLabel: '8 horas' },
      { id: 'course-2', slug: 'lideranca', name: 'Liderança' },
    ] } })
    renderHome()
    expect(screen.getByRole('link', { name: /Comunicação/ })).toHaveAttribute('href', '/formacao/comunicacao')
    expect(screen.getByText('Presencial · 8 horas')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Liderança/ })).toHaveAttribute('href', '/formacao/lideranca')
    expect(screen.queryByText(/próxima sessão|lugares disponíveis/i)).not.toBeInTheDocument()
  })

  it('degrades optional configuration and space preview failures without blocking the homepage', () => {
    homeMocks.usePublicConfig.mockReturnValue({ isLoading: false, isError: true })
    homeMocks.useSpacesPreview.mockReturnValue({ isLoading: false, isError: true })

    renderHome()

    expect(screen.getByRole('img', { name: 'Elizabeth Castro, fundadora da Castro’s' })).toHaveAttribute('src', '/IMG_3376.JPG.jpeg')
    expect(screen.getByRole('heading', { name: /Onde pessoas, liderança e experiência se encontram/i })).toBeInTheDocument()
    expect(screen.queryByText(/espaço\(s\) disponível\(eis\) no catálogo/i)).not.toBeInTheDocument()
  })
})
