import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CourseCollectionView, CourseDetailView, CourseSessionsView } from './CoursesPublic'

const course = { id: 'course-1', slug: 'course-1', name: '[CONTENT TBD]', summary: '[A confirmar]' }
const emptySessions = { isLoading: false, isError: false, data: { items: [] } }

describe('public training', () => {
  it('renders catalog loading and success states', () => {
    const { rerender } = render(<MemoryRouter><CourseCollectionView resource={{ isLoading: true, isError: false }} /></MemoryRouter>)
    expect(screen.getByRole('status')).toHaveTextContent('A carregar formação.')
    rerender(<MemoryRouter><CourseCollectionView resource={{ isLoading: false, isError: false, data: { items: [course] } }} /></MemoryRouter>)
    expect(screen.getByText('[CONTENT TBD]')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /CONTENT TBD/i })).toHaveAttribute('href', '/formacao/course-1')
  })

  it('renders catalog empty and API error states', () => {
    const { rerender } = render(<MemoryRouter><CourseCollectionView resource={{ isLoading: false, isError: false, data: { items: [] } }} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Catálogo em preparação' })).toBeInTheDocument()
    rerender(<MemoryRouter><CourseCollectionView resource={{ isLoading: false, isError: true }} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Não foi possível carregar a formação.' })).toBeInTheDocument()
  })

  it('renders detail loading state', () => {
    render(<MemoryRouter><CourseDetailView courseResource={{ isLoading: true, isError: false }} sessionsResource={emptySessions} /></MemoryRouter>)
    expect(screen.getByRole('status')).toHaveTextContent('A carregar formação.')
  })

  it('renders detail API error with a safe return path', () => {
    render(<MemoryRouter><CourseDetailView courseResource={{ isLoading: false, isError: true }} sessionsResource={emptySessions} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Não foi possível carregar esta formação.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar à formação' })).toHaveAttribute('href', '/formacao')
  })

  it('renders detail not-found state with a safe return path', () => {
    render(<MemoryRouter><CourseDetailView courseResource={{ isLoading: false, isError: false }} sessionsResource={emptySessions} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Formação não encontrada.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar à formação' })).toHaveAttribute('href', '/formacao')
  })

  it('renders session loading, error and empty states', () => {
    const { rerender } = render(<MemoryRouter><CourseSessionsView resource={{ isLoading: true, isError: false }} /></MemoryRouter>)
    expect(screen.getByRole('status')).toHaveTextContent('A carregar sessões.')

    rerender(<MemoryRouter><CourseSessionsView resource={{ isLoading: false, isError: true }} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Não foi possível carregar as sessões.' })).toBeInTheDocument()

    rerender(<MemoryRouter><CourseSessionsView resource={{ isLoading: false, isError: false, data: { items: [] } }} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Não existem sessões disponíveis.' })).toBeInTheDocument()
  })
})
