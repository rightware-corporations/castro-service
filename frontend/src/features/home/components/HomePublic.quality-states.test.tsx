import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  beforeEach(() => {
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

  it('degrades optional configuration and space preview failures without blocking the homepage', () => {
    homeMocks.usePublicConfig.mockReturnValue({ isLoading: false, isError: true })
    homeMocks.useSpacesPreview.mockReturnValue({ isLoading: false, isError: true })

    renderHome()

    expect(screen.getByText('Experiência digital em construção.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Onde pessoas, liderança e experiência se encontram/i })).toBeInTheDocument()
    expect(screen.queryByText(/espaço\(s\) disponível\(eis\) no catálogo/i)).not.toBeInTheDocument()
  })
})
