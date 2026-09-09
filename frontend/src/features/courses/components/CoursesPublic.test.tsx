import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CourseCollectionView, CourseDetailView, CourseSessionsView } from './CoursesPublic'

const course = { id: 'course-1', slug: 'course-1', name: '[CONTENT TBD]', summary: '[A confirmar]', contactPhone: '878 665 180' }
const detailedCourse = { ...course, description: 'Descrição publicada.', modality: 'IN_PERSON', durationLabel: '2 dias', scheduleSummary: '09:00–16:00', investmentAmount: 12000, investmentCurrency: 'MZN', certificateIncluded: true, learningOutcomes: ['Comunicar com clareza', 'Aplicar técnicas no trabalho'] }
const emptySessions = { isLoading: false, isError: false, data: { items: [] } }

describe('public training', () => {
  it('renders catalog loading and success states through the published training list', () => {
    const { rerender } = render(<MemoryRouter><CourseCollectionView resource={{ isLoading: true, isError: false }} /></MemoryRouter>)
    expect(screen.getByRole('status')).toHaveTextContent('A carregar formação.')
    rerender(<MemoryRouter><CourseCollectionView resource={{ isLoading: false, isError: false, data: { items: [course] } }} /></MemoryRouter>)
    expect(screen.getByText('[CONTENT TBD]')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '[CONTENT TBD]' })).toHaveAttribute('href', '/formacao/course-1')
    expect(screen.getByRole('link', { name: /Ver curso e inscrição/i })).toHaveAttribute('href', '/formacao/course-1')
    expect(screen.queryByText('878 665 180')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Formação para a minha organização/i }).getAttribute('href')).toContain('CORPORATE_TRAINING')
  })

  it('lets visitors focus a training format without changing the published catalog', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><CourseCollectionView resource={{ isLoading: false, isError: false, data: { items: [course] } }} /></MemoryRouter>)
    const workshop = screen.getByRole('button', { name: /Palestras & Workshops/i })
    const personalized = screen.getByRole('button', { name: /Treinamento Personalizado/i })
    expect(workshop).toHaveAttribute('aria-pressed', 'true')
    expect(personalized).toHaveAttribute('aria-pressed', 'false')
    await user.click(personalized)
    expect(workshop).toHaveAttribute('aria-pressed', 'false')
    expect(personalized).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByRole('heading', { name: 'Treinamento Personalizado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver formação publicada/i })).toHaveAttribute('href', '#formacao-publicada')
    expect(screen.getByRole('link', { name: '[CONTENT TBD]' })).toHaveAttribute('href', '/formacao/course-1')
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

  it('renders published course facts and outcomes in the detail experience', () => {
    render(<MemoryRouter><CourseDetailView courseResource={{ isLoading: false, isError: false, data: detailedCourse }} sessionsResource={emptySessions} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: '[CONTENT TBD]' })).toBeInTheDocument()
    expect(screen.getByLabelText('Informação publicada da formação')).toHaveTextContent('In person')
    expect(screen.getByLabelText('Informação publicada da formação')).toHaveTextContent('2 dias')
    expect(screen.getByLabelText('Informação publicada da formação')).toHaveTextContent('12 000 MT')
    expect(screen.getByLabelText('Informação publicada da formação')).toHaveTextContent('Incluído')
    expect(screen.getByText('09:00–16:00')).toBeInTheDocument()
    expect(screen.getByText('Comunicar com clareza')).toBeInTheDocument()
    expect(screen.getByText('Aplicar técnicas no trabalho')).toBeInTheDocument()
    expect(screen.getByText('Certificado incluído nesta formação.')).toBeInTheDocument()
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

  it('renders session loading and error states', () => {
    const { rerender } = render(<MemoryRouter><CourseSessionsView resource={{ isLoading: true, isError: false }} course={course} /></MemoryRouter>)
    expect(screen.getByRole('status')).toHaveTextContent('A carregar sessões.')
    rerender(<MemoryRouter><CourseSessionsView resource={{ isLoading: false, isError: true }} course={course} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Não foi possível carregar as sessões.' })).toBeInTheDocument()
  })

  it('offers contextual next-date and corporate paths when there is no session', () => {
    render(<MemoryRouter><CourseSessionsView resource={emptySessions} course={course} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Não existem sessões disponíveis.' })).toBeInTheDocument()
    const nextDates = screen.getByRole('link', { name: 'Receber próximas datas' })
    const corporate = screen.getByRole('link', { name: 'Formação para a minha organização' })
    expect(nextDates.getAttribute('href')).toContain('NEXT_TRAINING_DATES')
    expect(nextDates.getAttribute('href')).toContain('entity=course-1')
    expect(corporate.getAttribute('href')).toContain('CORPORATE_TRAINING')
  })

  it('routes published sessions to the dedicated group registration flow', () => {
    render(<MemoryRouter><CourseSessionsView resource={{ isLoading: false, isError: false, data: { items: [{ id: 'session-1', startAt: '2026-10-20T09:00:00+02:00', endAt: '2026-10-20T12:00:00+02:00' }] } }} course={course} /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /Inscrever-se na sessão/i })).toHaveAttribute('href', '/formacao/course-1/sessoes/session-1/inscricao')
  })
})
