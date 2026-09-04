import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check, UsersRound } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useApi } from '../../app/providers/AppProviders'
import { createIdempotencyKey } from '../../api/client/HttpApiClient'
import { ApiError } from '../../api/client/errors'
import { Alert, ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'
import { Button, Textarea, TextField } from '../../design-system/primitives'
import { PublicContactChannels } from '../contact/PublicContactChannels'
import { useCourse, useCourseSessions } from './hooks'
import './CourseRegistrationPage.css'

type RegistrationDraft = {
  firstName: string
  lastName: string
  email: string
  phone: string
  participantCount: string
  organizationName: string
  notes: string
}

const emptyDraft: RegistrationDraft = { firstName: '', lastName: '', email: '', phone: '', participantCount: '1', organizationName: '', notes: '' }

export function CourseRegistrationPage() {
  const api = useApi()
  const { slug, sessionId } = useParams()
  const course = useCourse(slug)
  const sessions = useCourseSessions(course.data?.id)
  const [draft, setDraft] = useState(emptyDraft)
  const idempotencyKey = useRef(createIdempotencyKey())
  const participantCount = Number(draft.participantCount)
  const registration = useMutation({
    mutationFn: () => api.public.registerCourseSession(sessionId!, {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim() || undefined,
      email: draft.email.trim(),
      phone: draft.phone.trim() || undefined,
      participantCount,
      organizationName: draft.organizationName.trim() || undefined,
      notes: draft.notes.trim() || undefined,
    }, { idempotencyKey: idempotencyKey.current }),
  })

  if (!slug || !sessionId) return <Navigate to="/formacao" replace />
  if (course.isLoading || sessions.isLoading) return <section className="container public-page"><LoadingState label="A carregar sessão de formação." /></section>
  if (course.isError || sessions.isError || !course.data) return <section className="container public-page"><ErrorState title="Não foi possível carregar esta formação." /></section>
  const session = sessions.data?.items.find((item) => item.id === sessionId)
  if (!session) return <section className="container public-page"><ErrorState title="Esta sessão não está disponível para inscrição." /><Link className="text-link" to={`/formacao/${slug}`}>Voltar à formação</Link></section>

  const valid = Boolean(draft.firstName.trim() && draft.email.includes('@') && Number.isInteger(participantCount) && participantCount > 0)
  if (registration.data) return <section className="course-registration course-registration--success"><div className="container course-registration__success"><span className="course-registration__success-icon"><Check size={26} /></span><span className="eyebrow">INSCRIÇÃO RECEBIDA</span><h1>A sua inscrição foi registada.</h1><p>A inscrição fica pendente até confirmação da Castro’s. Uma sessão pode receber várias inscrições; este fluxo não bloqueia o horário como uma reserva exclusiva.</p><dl><div><dt>Referência</dt><dd>{registration.data.reference}</dd></div><div><dt>Estado</dt><dd>{registration.data.status === 'PENDING' ? 'A aguardar confirmação' : registration.data.status}</dd></div><div><dt>Participantes</dt><dd>{registration.data.participantCount}</dd></div><div><dt>Sessão</dt><dd>{formatDateTime(session.startAt)} — {formatDateTime(session.endAt)}</dd></div></dl><PublicContactChannels contextMessage={`Olá. Gostaria de falar sobre a inscrição ${registration.data.reference} na formação ${course.data.name}.`} /><Link className="ds-button ds-button--primary" to={`/formacao/${slug}`}>Voltar à formação</Link></div></section>

  return <section className="course-registration"><div className="container course-registration__layout">
    <main className="course-registration__main"><Link className="text-link course-registration__back" to={`/formacao/${slug}`}><ArrowLeft size={15} /> Voltar à formação</Link><span className="eyebrow">INSCRIÇÃO · FORMAÇÃO</span><h1>{course.data.name}</h1><div className="course-registration__session"><UsersRound size={20} /><div><small>SESSÃO</small><strong>{formatDateTime(session.startAt)}</strong><span>até {formatDateTime(session.endAt)}</span></div></div><div className="course-registration__fields"><TextField id="registration-first-name" label="Nome" required value={draft.firstName} onChange={(event) => setDraft((current) => ({ ...current, firstName: event.target.value }))} /><TextField id="registration-last-name" label="Apelido" value={draft.lastName} onChange={(event) => setDraft((current) => ({ ...current, lastName: event.target.value }))} /><TextField id="registration-email" label="Email" type="email" required value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} /><TextField id="registration-phone" label="Telefone" type="tel" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} /><TextField id="registration-count" label="Número de participantes" type="number" min="1" required value={draft.participantCount} onChange={(event) => setDraft((current) => ({ ...current, participantCount: event.target.value }))} /><TextField id="registration-organization" label="Organização" value={draft.organizationName} description="Opcional." onChange={(event) => setDraft((current) => ({ ...current, organizationName: event.target.value }))} /><div className="course-registration__span"><Textarea id="registration-notes" label="Notas" rows={4} value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} /></div></div>{registration.error ? <Alert tone="danger" title="Não foi possível concluir a inscrição.">{registrationError(registration.error)}</Alert> : null}<Button disabled={!valid} loading={registration.isPending} onClick={() => registration.mutate()}>Enviar inscrição <ArrowRight size={16} /></Button></main>
    <aside className="course-registration__summary"><span className="eyebrow">RESUMO</span><h2>Inscrição em sessão</h2><dl><div><dt>Formação</dt><dd>{course.data.name}</dd></div><div><dt>Data</dt><dd>{formatDateTime(session.startAt)}</dd></div><div><dt>Participantes</dt><dd>{draft.participantCount || '—'}</dd></div>{draft.organizationName.trim() ? <div><dt>Organização</dt><dd>{draft.organizationName}</dd></div> : null}</dl><p>A Secretária recebe esta inscrição e pode confirmá-la ou cancelá-la na área interna.</p></aside>
  </div></section>
}

function formatDateTime(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium', timeStyle: 'short' }).format(date) }
function registrationError(error: unknown) { if (error instanceof ApiError && error.code === 'IDEMPOTENCY_KEY_REUSED') return 'Este envio já foi usado com dados diferentes. Recarregue a página antes de tentar novamente.'; if (error instanceof ApiError && error.code === 'VALIDATION_FAILED') return 'Verifique os dados e confirme que a sessão ainda aceita inscrições.'; if (error instanceof ApiError && error.code === 'RESOURCE_NOT_FOUND') return 'A sessão deixou de estar disponível.'; return 'Tente novamente ou contacte a Castro’s.' }
