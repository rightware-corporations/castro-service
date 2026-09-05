import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3 } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useApi } from '../../../app/providers/AppProviders'
import type { BookingRequestDto, BookableType } from '../../../api/contracts'
import { ApiError } from '../../../api/client/errors'
import { createIdempotencyKey } from '../../../api/client/HttpApiClient'
import { EmptyState, ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'
import { Button, TextField, Textarea } from '../../../design-system/primitives'
import { motionSprings } from '../../../design-system/motion/motionPresets'
import { PublicContactChannels } from '../../contact/PublicContactChannels'
import { contactHref } from '../../contact/intent'
import { bookingConfirmationRoute, bookingRoute } from '../routes'
import './BookingPublic.enhancements.css'

type BookingDraft = {
  date?: string
  durationMinutes?: number
  startTime?: string
  endTime?: string
  participants?: number
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  notes?: string
  purpose?: string
  idempotencyKey?: string
}

const bookingTypes: BookableType[] = ['SPACE', 'SERVICE']
function isBookingType(value: string | undefined): value is BookableType { return bookingTypes.includes(value as BookableType) }
function storageKey(type: BookableType, id: string) { return `castros-booking:${type}:${id}` }
function readDraft(type: BookableType, id: string): BookingDraft { if (typeof window === 'undefined') return {}; try { return JSON.parse(sessionStorage.getItem(storageKey(type, id)) ?? '{}') as BookingDraft } catch { return {} } }
function writeDraft(type: BookableType, id: string, draft: BookingDraft) { if (typeof window !== 'undefined') sessionStorage.setItem(storageKey(type, id), JSON.stringify(draft)) }
function clearDraft(type: BookableType, id: string) { if (typeof window !== 'undefined') sessionStorage.removeItem(storageKey(type, id)) }
function useTarget() { const { bookableType, bookableId } = useParams(); if (!isBookingType(bookableType) || !bookableId) return null; return { type: bookableType, id: bookableId } }

function Shell({ step, children }: { step: number; children: React.ReactNode }) {
  const labels = ['Data', 'Horário', 'Dados', 'Rever']
  return <div className="booking-v2-page"><section className="container booking-v2-shell"><header className="booking-v2-header"><div><span className="eyebrow">CASTRO’S · RESERVA</span><h1>Prepare a sua <em>reserva.</em></h1></div><p>Escolha apenas opções que o sistema confirma como disponíveis. O pedido só é enviado depois da revisão final.</p></header><div className="booking-v2-steps-wrap"><motion.div className="booking-v2-progress" initial={false} animate={{ scaleX: step / labels.length }} transition={motionSprings.layout} aria-hidden="true" /><ol className="booking-v2-steps" aria-label="Progresso da reserva">{labels.map((label, index) => <li key={label} className={index + 1 === step ? 'is-current' : index + 1 < step ? 'is-complete' : ''} aria-current={index + 1 === step ? 'step' : undefined}><span>{index + 1 < step ? <Check size={14} /> : String(index + 1).padStart(2, '0')}</span><strong>{label}</strong></li>)}</ol></div>{children}</section></div>
}

export function BookingDate() {
  const target = useTarget(); const navigate = useNavigate(); const [searchParams] = useSearchParams()
  const [draft, setDraft] = useState<BookingDraft>(() => {
    if (!target) return {}
    const stored = readDraft(target.type, target.id)
    const people = parsePositiveInteger(searchParams.get('people'))
    const duration = parsePositiveInteger(searchParams.get('duration'))
    const date = parseDate(searchParams.get('date'))
    const purpose = searchParams.get('purpose')?.trim() || undefined
    const next = { ...stored, date: stored.date ?? date, durationMinutes: stored.durationMinutes ?? duration, participants: stored.participants ?? people, purpose: stored.purpose ?? (target.type === 'SPACE' ? purpose : undefined) }
    writeDraft(target.type, target.id, next); return next
  })
  if (!target) return <Navigate to="/reservar" replace />
  const canContinue = Boolean(draft.date && draft.durationMinutes && draft.durationMinutes > 0)
  const update = (patch: Partial<BookingDraft>) => { const next = { ...draft, ...patch, startTime: undefined, endTime: undefined, idempotencyKey: undefined }; setDraft(next); writeDraft(target.type, target.id, next) }
  return <Shell step={1}><div className="booking-v2-grid"><main className="booking-v2-card"><div className="booking-v2-title"><CalendarDays size={21} /><div><span>01</span><h2>Quando pretende reservar?</h2></div></div><div className="booking-v2-fields"><TextField id="booking-date" label="Data" type="date" required value={draft.date ?? ''} onChange={(event) => update({ date: event.target.value })} /><TextField id="booking-duration" label="Duração prevista (minutos)" type="number" min="1" required value={draft.durationMinutes ?? ''} description="Para serviços com duração publicada, mantenha essa duração. O backend valida o contrato antes de aceitar a reserva." onChange={(event) => update({ durationMinutes: event.target.value ? Number(event.target.value) : undefined })} /></div></main><Summary target={target} draft={draft}><Button disabled={!canContinue} onClick={() => navigate(bookingRoute(target.type, target.id, 'time'))}>Ver horários <ArrowRight size={16} /></Button></Summary></div></Shell>
}

export function BookingTime() {
  const api = useApi(); const target = useTarget(); const navigate = useNavigate(); const [draft, setDraft] = useState<BookingDraft>(() => target ? readDraft(target.type, target.id) : {})
  const query = useQuery({ queryKey: ['availability', target?.type, target?.id, draft.date, draft.durationMinutes], enabled: Boolean(target && draft.date && draft.durationMinutes), queryFn: () => api.availability.list({ bookableType: target!.type, bookableId: target!.id, date: draft.date!, durationMinutes: draft.durationMinutes! }) })
  const availableSlots = query.data?.items.filter((slot) => slot.status === 'AVAILABLE') ?? []
  const noAvailability = !query.isLoading && !query.isError && availableSlots.length === 0
  const nextAvailability = useQuery({
    queryKey: ['availability', 'next', target?.type, target?.id, draft.date, draft.durationMinutes],
    enabled: Boolean(noAvailability && target && draft.date && draft.durationMinutes),
    queryFn: async () => {
      for (let offset = 1; offset <= 30; offset += 1) {
        const date = addDays(draft.date!, offset)
        const result = await api.availability.list({ bookableType: target!.type, bookableId: target!.id, date, durationMinutes: draft.durationMinutes! })
        const slot = result.items.find((item) => item.status === 'AVAILABLE')
        if (slot) return { date, slot }
      }
      return null
    },
  })
  if (!target) return <Navigate to="/reservar" replace />
  if (!draft.date || !draft.durationMinutes) return <Navigate to={bookingRoute(target.type, target.id, 'selection')} replace />
  const select = (start: string, end: string, date = draft.date!) => { const next = { ...draft, date, startTime: start, endTime: end, idempotencyKey: undefined }; setDraft(next); writeDraft(target.type, target.id, next) }
  const requestOtherTime = contactHref({ sourceType: target.type === 'SERVICE' ? 'SERVICE' : 'SPACE', entityId: target.id, cta: 'REQUEST_OTHER_TIME', message: 'Gostaria de pedir outro horário para esta reserva.' })
  return <Shell step={2}><div className="booking-v2-grid"><main className="booking-v2-card"><Link className="booking-v2-back" to={bookingRoute(target.type, target.id, 'selection')}><ArrowLeft size={15} /> Alterar data</Link><div className="booking-v2-title"><Clock3 size={21} /><div><span>02</span><h2>Escolha um horário disponível.</h2></div></div>{query.isLoading && <LoadingState label="A consultar disponibilidade." />}{query.isError && <ErrorState title="Não foi possível consultar a disponibilidade." />}{!query.isLoading && !query.isError && query.data?.items.length ? <div className="booking-v2-slots">{query.data.items.map((slot) => <motion.button layout key={`${slot.start}-${slot.end}`} type="button" disabled={slot.status !== 'AVAILABLE'} className={draft.startTime === slot.start && draft.date === draft.date ? 'is-selected' : ''} aria-pressed={draft.startTime === slot.start} onClick={() => select(slot.start, slot.end)} animate={{ scale: draft.startTime === slot.start ? 1.015 : 1 }} transition={motionSprings.selection}><strong>{formatTime(slot.start)}</strong><small>{slot.status === 'AVAILABLE' ? 'Disponível' : 'Indisponível'}</small></motion.button>)}</div> : null}{noAvailability ? <div className="booking-v2-no-slot"><EmptyState title="Sem horários disponíveis">Não existem horários livres nesta data para a duração selecionada.</EmptyState>{nextAvailability.isLoading ? <p role="status">A procurar a próxima disponibilidade…</p> : nextAvailability.data ? <div className="booking-v2-next-slot"><span>PRÓXIMA DISPONIBILIDADE</span><strong>{humanDate(nextAvailability.data.date)} · {formatTime(nextAvailability.data.slot.start)}</strong><Button onClick={() => select(nextAvailability.data!.slot.start, nextAvailability.data!.slot.end, nextAvailability.data!.date)}>Escolher este horário <ArrowRight size={16} /></Button></div> : <p>Não encontrámos disponibilidade nos próximos 30 dias.</p>}<div className="booking-v2-no-slot__actions"><Link className="text-link" to={requestOtherTime}>Pedir outro horário</Link><PublicContactChannels contactHref={requestOtherTime} contextMessage={`Olá. Gostaria de encontrar outro horário para uma reserva de ${targetLabel(target.type)} na Castro’s.`} /></div></div> : null}</main><Summary target={target} draft={draft}><Button disabled={!draft.startTime || !draft.endTime} onClick={() => navigate(bookingRoute(target.type, target.id, 'customer-details'))}>Continuar <ArrowRight size={16} /></Button></Summary></div></Shell>
}

export function BookingCustomer() {
  const target = useTarget(); const navigate = useNavigate(); const [draft, setDraft] = useState<BookingDraft>(() => target ? readDraft(target.type, target.id) : {})
  if (!target) return <Navigate to="/reservar" replace />
  if (!draft.startTime || !draft.endTime) return <Navigate to={bookingRoute(target.type, target.id, 'time')} replace />
  const update = (patch: Partial<BookingDraft>) => { const next = { ...draft, ...patch, idempotencyKey: undefined }; setDraft(next); writeDraft(target.type, target.id, next) }
  const valid = Boolean(draft.firstName?.trim() && draft.email?.includes('@') && (target.type !== 'SPACE' || (draft.participants ?? 0) > 0))
  return <Shell step={3}><div className="booking-v2-grid"><main className="booking-v2-card"><Link className="booking-v2-back" to={bookingRoute(target.type, target.id, 'time')}><ArrowLeft size={15} /> Alterar horário</Link><div className="booking-v2-title"><span className="booking-v2-title__number">03</span><div><span>DADOS</span><h2>Quem devemos contactar?</h2></div></div><div className="booking-v2-fields booking-v2-fields--two"><TextField id="first-name" label="Nome" required autoComplete="given-name" value={draft.firstName ?? ''} onChange={(e) => update({ firstName: e.target.value })} /><TextField id="last-name" label="Apelido" autoComplete="family-name" value={draft.lastName ?? ''} onChange={(e) => update({ lastName: e.target.value })} /><TextField id="email" label="Email" type="email" required autoComplete="email" value={draft.email ?? ''} onChange={(e) => update({ email: e.target.value })} /><TextField id="phone" label="Telefone" type="tel" autoComplete="tel" value={draft.phone ?? ''} onChange={(e) => update({ phone: e.target.value })} /><div className="booking-v2-span"><TextField id="participants" label="Participantes" type="number" min="1" required={target.type === 'SPACE'} value={draft.participants ?? ''} description={target.type === 'SPACE' ? 'Necessário para validar a capacidade do espaço.' : 'Opcional para este serviço.'} onChange={(e) => update({ participants: e.target.value ? Number(e.target.value) : undefined })} /></div><div className="booking-v2-span"><Textarea id="notes" label="Notas" rows={4} value={draft.notes ?? ''} onChange={(e) => update({ notes: e.target.value })} /></div></div></main><Summary target={target} draft={draft}><Button disabled={!valid} onClick={() => navigate(bookingRoute(target.type, target.id, 'review'))}>Rever pedido <ArrowRight size={16} /></Button></Summary></div></Shell>
}

export function BookingReview() {
  const api = useApi(); const target = useTarget(); const targetType = target?.type; const targetId = target?.id; const navigate = useNavigate()
  const draft = useMemo(() => targetType && targetId ? readDraft(targetType, targetId) : {}, [targetType, targetId])
  const idempotencyKeyRef = useRef(draft.idempotencyKey ?? createIdempotencyKey())
  const mutation = useMutation({ mutationFn: async () => {
    if (!target || !draft.date || !draft.startTime || !draft.endTime || !draft.firstName) throw new Error('INCOMPLETE')
    const idempotencyKey = idempotencyKeyRef.current
    if (draft.idempotencyKey !== idempotencyKey) writeDraft(target.type, target.id, { ...draft, idempotencyKey })
    const request: BookingRequestDto = { bookableType: target.type, bookableId: target.id, date: draft.date, startTime: draft.startTime, endTime: draft.endTime, participants: draft.participants, customer: { firstName: draft.firstName, lastName: draft.lastName, email: draft.email, phone: draft.phone }, spaceConfiguration: target.type === 'SPACE' && draft.purpose ? { purpose: draft.purpose } : undefined, notes: draft.notes }
    return api.bookings.create(request, { idempotencyKey })
  }, onSuccess: (result) => { if (target) clearDraft(target.type, target.id); navigate(bookingConfirmationRoute(result.reference)) } })
  if (!target) return <Navigate to="/reservar" replace />
  if (!draft.date || !draft.startTime || !draft.firstName) return <Navigate to={bookingRoute(target.type, target.id, 'selection')} replace />
  return <Shell step={4}><div className="booking-v2-grid"><main className="booking-v2-card"><Link className="booking-v2-back" to={bookingRoute(target.type, target.id, 'customer-details')}><ArrowLeft size={15} /> Alterar dados</Link><div className="booking-v2-title"><span className="booking-v2-title__number">04</span><div><span>REVISÃO</span><h2>Confirme antes de enviar.</h2></div></div><dl className="booking-v2-review"><div><dt>Data</dt><dd>{humanDate(draft.date)}</dd></div><div><dt>Horário</dt><dd>{formatTime(draft.startTime)}–{formatTime(draft.endTime!)}</dd></div>{draft.purpose ? <div><dt>Finalidade</dt><dd>{purposeLabel(draft.purpose)}</dd></div> : null}<div><dt>Contacto</dt><dd>{draft.firstName} {draft.lastName ?? ''}<small>{draft.email}</small></dd></div>{draft.participants ? <div><dt>Participantes</dt><dd>{draft.participants}</dd></div> : null}{draft.notes ? <div><dt>Notas</dt><dd>{draft.notes}</dd></div> : null}</dl>{mutation.isError && <div className="booking-v2-error" role="alert">{bookingErrorMessage(mutation.error)}</div>}</main><Summary target={target} draft={draft}><Button loading={mutation.isPending} onClick={() => mutation.mutate()}>Enviar pedido de reserva <ArrowRight size={16} /></Button></Summary></div></Shell>
}

export function BookingConfirmation() {
  const api = useApi(); const { reference } = useParams(); const query = useQuery({ queryKey: ['booking', reference], enabled: Boolean(reference), queryFn: () => api.bookings.getByReference(reference!) })
  const pending = query.data?.status === 'PENDING'
  return <div className="booking-v2-page"><section className="container booking-v2-confirmation"><span className="booking-v2-confirmation__icon"><Check size={26} /></span><span className="eyebrow">{pending ? 'PEDIDO RECEBIDO' : 'RESERVA'}</span><h1>{pending ? 'Aguardamos a confirmação da Castro’s.' : query.data?.status === 'CONFIRMED' ? 'Reserva confirmada.' : 'Reserva registada.'}</h1>{query.isLoading && <LoadingState label="A carregar confirmação." />}{query.isError && <ErrorState title="A reserva foi enviada, mas não foi possível carregar os detalhes da confirmação." />}{query.data && <><div className="booking-v2-confirmation__details"><div><small>Referência</small><strong>{query.data.reference}</strong></div><div><small>Estado</small><strong>{statusLabel(query.data.status)}</strong></div><div><small>Horário</small><strong>{formatDateTime(query.data.startAt)} — {formatDateTime(query.data.endAt)}</strong></div></div><p>{pending ? 'O horário foi registado e a equipa recebeu o pedido. A Secretária pode confirmar, reagendar ou entrar em contacto consigo.' : 'Guarde a referência para qualquer contacto relacionado com esta reserva.'}</p><PublicContactChannels contextMessage={`Olá. Gostaria de falar sobre a reserva ${query.data.reference}.`} /></>}<Link className="ds-button ds-button--primary" to="/">Voltar ao início</Link></section></div>
}

function Summary({ target, draft, children }: { target: { type: BookableType; id: string }; draft: BookingDraft; children: React.ReactNode }) { return <aside className="booking-v2-summary"><span className="eyebrow">RESUMO</span><h2>Pedido de reserva</h2><dl><div><dt>Tipo</dt><dd>{targetLabel(target.type)}</dd></div>{draft.purpose && <div><dt>Finalidade</dt><dd>{purposeLabel(draft.purpose)}</dd></div>}{draft.participants && <div><dt>Participantes</dt><dd>{draft.participants}</dd></div>}{draft.date && <div><dt>Data</dt><dd>{humanDate(draft.date)}</dd></div>}{draft.durationMinutes && <div><dt>Duração</dt><dd>{draft.durationMinutes} min</dd></div>}{draft.startTime && <div><dt>Horário</dt><dd>{formatTime(draft.startTime)}{draft.endTime ? `–${formatTime(draft.endTime)}` : ''}</dd></div>}</dl><div className="booking-v2-summary__action">{children}</div><small>Disponibilidade, capacidade e estado final são validados novamente pelo backend no envio.</small></aside> }
function targetLabel(type: BookableType) { return type === 'SPACE' ? 'Espaço' : 'Serviço' }
function purposeLabel(value: string) { return value === 'meeting' ? 'Reunião' : value === 'training' ? 'Formação' : value === 'workshop' ? 'Workshop' : value === 'other' ? 'Outro encontro' : value }
function parsePositiveInteger(value: string | null): number | undefined { if (!value) return undefined; const parsed = Number(value); return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined }
function parseDate(value: string | null): string | undefined { return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined }
function formatTime(value: string) { return value.includes('T') ? value.split('T')[1].slice(0, 5) : value.slice(0, 5) }
function formatDateTime(value: string) { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium', timeStyle: 'short' }).format(date) }
function humanDate(value: string) { const date = new Date(`${value}T12:00:00`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long' }).format(date) }
function addDays(value: string, days: number) { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() + days); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
function statusLabel(value: string) { return value === 'PENDING' ? 'A aguardar confirmação' : value === 'CONFIRMED' ? 'Confirmada' : value === 'CANCELLED' ? 'Cancelada' : value === 'COMPLETED' ? 'Concluída' : value === 'NO_SHOW' ? 'Não compareceu' : value }
function bookingErrorMessage(error: unknown) { if (error instanceof ApiError && error.code === 'BOOKING_SLOT_UNAVAILABLE') return 'Este horário deixou de estar disponível. Volte ao passo de horário e escolha outro.'; if (error instanceof ApiError && error.code === 'IDEMPOTENCY_KEY_REUSED') return 'Este envio já foi processado com dados diferentes. Volte ao passo anterior, reveja os dados e tente novamente.'; if (error instanceof ApiError && error.code === 'BOOKABLE_INACTIVE') return 'Este item deixou de estar disponível para reserva.'; if (error instanceof ApiError && error.code === 'VALIDATION_FAILED') return 'Alguns dados da reserva precisam de ser revistos.'; if (error instanceof ApiError && error.code === 'BOOKING_BOOKABLE_TYPE_UNSUPPORTED') return 'Este item utiliza um fluxo próprio e não pode ser reservado por aqui.'; return 'Não foi possível enviar o pedido de reserva. Tente novamente.' }
