import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client/errors'
import { CourseRegistrationPage } from './CourseRegistrationPage'

const apiMocks = vi.hoisted(() => ({ registerCourseSession: vi.fn() }))
const hookState = vi.hoisted(() => ({
  course: { isLoading: false, isError: false, data: { id: 'course-1', slug: 'leadership', name: 'Leadership' } },
  sessions: { isLoading: false, isError: false, data: { items: [{ id: 'session-1', startAt: '2026-10-20T09:00:00+02:00', endAt: '2026-10-20T12:00:00+02:00' }] } },
}))

vi.mock('../../app/providers/AppProviders', () => ({
  useApi: () => ({ public: { registerCourseSession: apiMocks.registerCourseSession } }),
}))
vi.mock('./hooks', () => ({
  useCourse: () => hookState.course,
  useCourseSessions: () => hookState.sessions,
}))
vi.mock('../contact/PublicContactChannels', () => ({ PublicContactChannels: () => <div>contact-channels</div> }))

function renderPage(path = '/formacao/leadership/sessoes/session-1/inscricao') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/formacao/:slug/sessoes/:sessionId/inscricao" element={<CourseRegistrationPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  }
}

describe('course session registration', () => {
  beforeEach(() => {
    apiMocks.registerCourseSession.mockReset()
    hookState.course = { isLoading: false, isError: false, data: { id: 'course-1', slug: 'leadership', name: 'Leadership' } }
    hookState.sessions = { isLoading: false, isError: false, data: { items: [{ id: 'session-1', startAt: '2026-10-20T09:00:00+02:00', endAt: '2026-10-20T12:00:00+02:00' }] } }
  })

  it('submits a group registration without using the booking slot flow', async () => {
    apiMocks.registerCourseSession.mockResolvedValue({
      id: 'registration-1', reference: 'TRN-ABC12345', status: 'PENDING', courseSessionId: 'session-1', participantCount: 3, createdAt: '2026-09-04T12:00:00Z',
    })
    const { user } = renderPage()

    const submit = screen.getByRole('button', { name: /Enviar inscrição/i })
    expect(submit).toBeEnabled()

    await user.type(screen.getByLabelText(/^Nome/), 'Ana')
    await user.type(screen.getByLabelText(/^Email/), 'ana@example.com')
    await user.clear(screen.getByLabelText(/Número de participantes/))
    await user.type(screen.getByLabelText(/Número de participantes/), '3')
    await user.type(screen.getByLabelText(/^Organização/), 'Empresa X')
    await user.type(screen.getByLabelText(/^Notas/), 'Equipa de liderança')
    await user.click(submit)

    await waitFor(() => expect(apiMocks.registerCourseSession).toHaveBeenCalledTimes(1))
    expect(apiMocks.registerCourseSession).toHaveBeenCalledWith('session-1', {
      firstName: 'Ana',
      lastName: undefined,
      email: 'ana@example.com',
      phone: undefined,
      participantCount: 3,
      organizationName: 'Empresa X',
      notes: 'Equipa de liderança',
    }, { idempotencyKey: expect.any(String) })

    expect(await screen.findByText('TRN-ABC12345')).toBeInTheDocument()
    expect(screen.getByText('A aguardar confirmação')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'A sua inscrição foi registada.' })).toHaveFocus()
  })

  it('preserves the idempotency key when a failed registration is retried', async () => {
    apiMocks.registerCourseSession
      .mockRejectedValueOnce(new ApiError('Falha temporária'))
      .mockResolvedValueOnce({ id: 'registration-2', reference: 'TRN-RETRY001', status: 'PENDING', courseSessionId: 'session-1', participantCount: 1, createdAt: '2026-09-04T12:00:00Z' })

    const { user } = renderPage()
    await user.type(screen.getByLabelText(/^Nome/), 'Ana')
    await user.type(screen.getByLabelText(/^Email/), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: /Enviar inscrição/i }))
    expect(await screen.findByText(/Tente novamente ou contacte/i)).toBeInTheDocument()

    const firstKey = apiMocks.registerCourseSession.mock.calls[0][2]?.idempotencyKey
    await user.click(screen.getByRole('button', { name: /Enviar inscrição/i }))
    await waitFor(() => expect(apiMocks.registerCourseSession).toHaveBeenCalledTimes(2))
    expect(apiMocks.registerCourseSession.mock.calls[1][2]?.idempotencyKey).toBe(firstKey)
    expect(await screen.findByText('TRN-RETRY001')).toBeInTheDocument()
  })

  it('fails safely when the requested session is not published', () => {
    hookState.sessions = { isLoading: false, isError: false, data: { items: [] } }
    renderPage()
    expect(screen.getByRole('heading', { name: 'Esta sessão não está disponível para inscrição.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar à formação' })).toHaveAttribute('href', '/formacao/leadership')
  })
  it('explains invalid values and focuses the first invalid field without sending', async () => {
    const { user } = renderPage()
    await user.click(screen.getByRole('button', { name: /Enviar inscrição/ }))
    expect(screen.getByText('Indique o seu nome.')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Nome/)).toHaveFocus()
    await user.type(screen.getByLabelText(/^Nome/), 'Ana')
    await user.type(screen.getByLabelText(/^Email/), 'ana@')
    await user.click(screen.getByRole('button', { name: /Enviar inscrição/ }))
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/^Email/)).toHaveFocus()
    await user.clear(screen.getByLabelText(/^Email/))
    await user.type(screen.getByLabelText(/^Email/), 'ana@example.com')
    await user.clear(screen.getByLabelText(/Número de participantes/))
    await user.type(screen.getByLabelText(/Número de participantes/), '1.5')
    await user.click(screen.getByRole('button', { name: /Enviar inscrição/ }))
    expect(screen.getByLabelText(/Número de participantes/)).toHaveFocus()
    expect(apiMocks.registerCourseSession).not.toHaveBeenCalled()
  })

  it('submits with Enter and locks fields while waiting for a response', async () => {
    let resolveRequest!: (value: unknown) => void
    apiMocks.registerCourseSession.mockImplementation(() => new Promise((resolve) => { resolveRequest = resolve }))
    const { user } = renderPage()
    await user.type(screen.getByLabelText(/^Nome/), 'Ana')
    await user.type(screen.getByLabelText(/^Email/), 'ana@example.com{Enter}')
    await waitFor(() => expect(apiMocks.registerCourseSession).toHaveBeenCalledTimes(1))
    expect(screen.getByLabelText(/^Nome/)).toBeDisabled()
    expect(screen.getByLabelText(/^Email/)).toBeDisabled()
    expect(screen.getByRole('button', { name: /Enviar inscrição/ })).toBeDisabled()
    resolveRequest({ reference: 'TRN-ENTER', status: 'PENDING', participantCount: 1 })
    expect(await screen.findByText('TRN-ENTER')).toBeInTheDocument()
  })

})
