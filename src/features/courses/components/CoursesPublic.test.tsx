import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CourseCollectionView, CourseSessionsView } from './CoursesPublic'

const course = { id: 'course-1', slug: 'course-1', name: '[CONTENT TBD]', summary: '[A confirmar]' }

describe('public training', () => {
  it('renders loading and success states', () => {
    const { rerender } = render(<MemoryRouter><CourseCollectionView resource={{ isLoading: true, isError: false }} /></MemoryRouter>)
    expect(screen.getByRole('status')).toHaveTextContent('A carregar formação.')
    rerender(<MemoryRouter><CourseCollectionView resource={{ isLoading: false, isError: false, data: { items: [course] } }} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: '[CONTENT TBD]' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver formação/ })).toHaveAttribute('href', '/formacao/course-1')
  })

  it('renders empty catalog and empty sessions states', () => {
    render(<MemoryRouter><><CourseCollectionView resource={{ isLoading: false, isError: false, data: { items: [] } }} /><CourseSessionsView resource={{ isLoading: false, isError: false, data: { items: [] } }} /></></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Ainda não existem cursos publicados.' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Não existem sessões disponíveis.' })).toBeInTheDocument()
  })
})
