import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CourseMarketingDetailPage } from './CourseMarketingDetailPage'
import { useCourse, useCourseSessions } from './hooks'
vi.mock('./hooks', () => ({ useCourse: vi.fn(), useCourseSessions: vi.fn() }))
const sessions = [
  { id: 'first', startAt: '2026-10-20T09:00:00+02:00', endAt: '2026-10-20T12:00:00+02:00' },
  { id: 'second', startAt: '2026-11-20T09:00:00+02:00', endAt: '2026-11-20T12:00:00+02:00' },
]
beforeEach(() => {
  vi.mocked(useCourse).mockReturnValue({ isLoading: false, isError: false, data: { id: 'course-1', slug: 'course-1', name: 'Curso de teste' } } as ReturnType<typeof useCourse>)
})
function show(state: { isLoading: boolean; isError: boolean; data?: { items: typeof sessions } }) {
  vi.mocked(useCourseSessions).mockReturnValue(state as ReturnType<typeof useCourseSessions>)
  return render(<MemoryRouter><CourseMarketingDetailPage /></MemoryRouter>)
}
describe('routed course marketing detail', () => {
  it('offers each published session for registration', () => {
    show({ isLoading: false, isError: false, data: { items: sessions } })
    const links = screen.getAllByRole('link', { name: /Inscrever-se na sessão/ })
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/formacao/course-1/sessoes/first/inscricao', '/formacao/course-1/sessoes/second/inscricao',
    ])
  })
  it.each([{ isLoading: true, isError: false }, { isLoading: false, isError: true }])('suppresses stale sessions and empty-date promises during %o', (state) => {
    show({ ...state, data: { items: sessions } })
    expect(screen.queryByRole('link', { name: /Inscrever/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Receber próximas datas' })).not.toBeInTheDocument()
    if (state.isLoading) expect(screen.getByRole('status')).toHaveTextContent('A carregar sessões.')
    else expect(screen.getByRole('heading', { name: 'Não foi possível carregar as sessões.' })).toBeInTheDocument()
  })
  it('offers contextual contact when the successful session list is empty', () => {
    show({ isLoading: false, isError: false, data: { items: [] } })
    expect(screen.getByRole('heading', { name: 'Não existem sessões disponíveis.' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Receber próximas datas' })[0]).toHaveAttribute('href', expect.stringContaining('entity=course-1'))
  })
})
