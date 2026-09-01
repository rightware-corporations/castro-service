import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import type { BookableType, BookingRequestDto, CourseDto, CourseSessionDto, ServiceDto, SpaceDto } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'
import { Button, Select, Textarea, TextField } from '../../design-system/primitives'

const types: { value: BookableType; label: string }[] = [
  { value: 'SPACE', label: 'Espaço' },
  { value: 'SERVICE', label: 'Serviço' },
  { value: 'COURSE_SESSION', label: 'Sessão de formação' },
]

export function ManualBookingPage() {
  const api = useApi()
  const can = useCan()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [type, setType] = useState<BookableType>('SPACE')
  const [resourceId, setResourceId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState<number | ''>('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [participants, setParticipants] = useState<number | ''>('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')

  const services = useQuery({ queryKey: ['services'], queryFn: () => api.public.listServices(), enabled: type === 'SERVICE' })
  const spaces = useQuery({ queryKey: ['spaces'], queryFn: () => api.public.listSpaces(), enabled: type === 'SPACE' })
  const courses = useQuery({ queryKey: ['courses'], queryFn: () => api.public.listCourses(), enabled: type === 'COURSE_SESSION' })
  const sessions = useQuery({ queryKey: ['course-sessions', courseId], queryFn: () => api.public.listCourseSessions(courseId), enabled: type === 'COURSE_SESSION' && Boolean(courseId) })

  const selectedService = services.data?.items.find((item) => item.id === resourceId)
  const selectedSession = sessions.data?.items.find((item) => item.id === resourceId)

  const effectiveDate = type === 'COURSE_SESSION' && selectedSession ? selectedSession.startAt.slice(0, 10) : date
  const effectiveDuration = type === 'COURSE_SESSION' && selectedSession ? minutesBetween(selectedSession) : Number(duration || 0)
  const availability = useQuery({
    queryKey: ['operations', 'manual-booking', 'availability', type, resourceId, effectiveDate, effectiveDuration],
    queryFn: () => api.availability.list({ bookableType: type, bookableId: resourceId, date: effectiveDate, durationMinutes: effectiveDuration }),
    enabled: type !== 'COURSE_SESSION' && Boolean(resourceId && effectiveDate && effectiveDuration > 0),
  })

  const resources = useMemo(() => type === 'SERVICE' ? services.data?.items ?? [] : type === 'SPACE' ? spaces.data?.items ?? [] : sessions.data?.items ?? [], [type, services.data, spaces.data, sessions.data])

  const mutation = useMutation({
    mutationFn: () => {
      const sessionTimes = selectedSession ? fixedSessionTimes(selectedSession) : null
      const request: BookingRequestDto = {
        bookableType: type,
        bookableId: resourceId,
        date: effectiveDate,
        startTime: sessionTimes?.start ?? startTime,
        endTime: sessionTimes?.end ?? endTime,
        participants: participants === '' ? undefined : Number(participants),
        customer: { firstName: firstName.trim(), lastName: lastName.trim() || undefined, email: email.trim() || undefined, phone: phone.trim() || undefined },
        notes: notes.trim() || undefined,
      }
      return api.operations.createBooking(request)
    },
    onSuccess: (booking) => {
      void queryClient.invalidateQueries({ queryKey: ['operations', 'bookings'] })
      void queryClient.invalidateQueries({ queryKey: ['operations', 'summary'] })
      navigate(`/app/reservas/${booking.id}`)
    },
  })

  function resetResource(nextType: BookableType) {
    setType(nextType); setResourceId(''); setCourseId(''); setDate(''); setDuration(''); setStartTime(''); setEndTime('')
  }

  function selectResource(id: string) {
    setResourceId(id); setStartTime(''); setEndTime('')
    if (type === 'SERVICE') {
      const service = services.data?.items.find((item) => item.id === id)
      setDuration(service?.durationMinutes ?? '')
    }
  }

  const valid = can('booking.create') && Boolean(resourceId && effectiveDate && effectiveDuration > 0 && firstName.trim() && (type === 'COURSE_SESSION' ? selectedSession : startTime && endTime))

  return <section className="ops-v2 manual-booking">
    <header className="ops-v2__hero"><div><span className="eyebrow">OPERAÇÃO · RESERVAS</span><h1>Nova reserva</h1><p>Registe uma reserva em nome de um cliente usando disponibilidade e catálogo reais da organização.</p></div></header>
    <div className="catalog-admin__layout">
      <main className="catalog-admin__main">
        <Link className="booking-v2-back" to="/app/reservas"><ArrowLeft size={15} /> Voltar às reservas</Link>
        <div className="catalog-admin__form">
          <Select id="manual-type" label="Tipo" value={type} onChange={(event) => resetResource(event.target.value as BookableType)}>{types.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select>
          {type === 'COURSE_SESSION' ? <Select id="manual-course" label="Formação" value={courseId} onChange={(event) => { setCourseId(event.target.value); setResourceId('') }}><option value="">Selecionar formação</option>{(courses.data?.items ?? []).map((course: CourseDto) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select> : null}
          <Select id="manual-resource" label={type === 'SPACE' ? 'Espaço' : type === 'SERVICE' ? 'Serviço' : 'Sessão'} value={resourceId} onChange={(event) => selectResource(event.target.value)}><option value="">Selecionar</option>{resources.map((item: ServiceDto | SpaceDto | CourseSessionDto) => <option key={item.id} value={item.id}>{'name' in item ? item.name : sessionLabel(item)}</option>)}</Select>
          {type === 'COURSE_SESSION' && selectedSession ? <div className="ops-workspace__summary-strip"><span><small>Data</small><strong>{effectiveDate}</strong></span><span><small>Início</small><strong>{fixedSessionTimes(selectedSession).start}</strong></span><span><small>Fim</small><strong>{fixedSessionTimes(selectedSession).end}</strong></span><span><small>Duração</small><strong>{effectiveDuration} min</strong></span></div> : <><TextField id="manual-date" label="Data" type="date" value={date} onChange={(event) => { setDate(event.target.value); setStartTime(''); setEndTime('') }} /><TextField id="manual-duration" label="Duração (minutos)" type="number" min="1" value={duration} onChange={(event) => { setDuration(event.target.value ? Number(event.target.value) : ''); setStartTime(''); setEndTime('') }} description={selectedService?.durationMinutes ? 'Duração publicada do serviço carregada automaticamente.' : undefined} /></>}
        </div>

        {availability.isLoading ? <LoadingState label="A consultar disponibilidade." /> : null}
        {availability.isError ? <ErrorState title="Não foi possível consultar a disponibilidade." /> : null}
        {type !== 'COURSE_SESSION' && availability.data ? <section className="booking-v2-slots" aria-label="Horários disponíveis">{availability.data.items.map((slot) => <button key={slot.start} type="button" disabled={slot.status !== 'AVAILABLE'} className={startTime === slot.start ? 'is-selected' : ''} onClick={() => { setStartTime(slot.start); setEndTime(slot.end) }}><strong>{slot.start.slice(0, 5)}</strong><small>{slot.status === 'AVAILABLE' ? 'Disponível' : 'Indisponível'}</small></button>)}</section> : null}
      </main>

      <aside className="catalog-admin__editor">
        <div className="catalog-admin__editor-heading"><div><span className="eyebrow">CLIENTE</span><h2>Dados da reserva</h2></div></div>
        <div className="catalog-admin__form">
          <TextField id="manual-first-name" label="Nome" required value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          <TextField id="manual-last-name" label="Apelido" value={lastName} onChange={(event) => setLastName(event.target.value)} />
          <TextField id="manual-email" label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <TextField id="manual-phone" label="Telefone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <TextField id="manual-participants" label="Participantes" type="number" min="1" value={participants} onChange={(event) => setParticipants(event.target.value ? Number(event.target.value) : '')} />
          <Textarea id="manual-notes" label="Notas" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
          {mutation.isError ? <p className="field-error" role="alert">Não foi possível criar a reserva. Confirme disponibilidade, recurso e dados do cliente.</p> : null}
          <Button disabled={!valid} loading={mutation.isPending} onClick={() => mutation.mutate()}><Check size={16} /> Criar reserva</Button>
          <Link className="text-link" to="/app/reservas">Cancelar <ArrowRight size={14} /></Link>
        </div>
      </aside>
    </div>
  </section>
}

function minutesBetween(session: CourseSessionDto) { return Math.max(1, Math.round((new Date(session.endAt).getTime() - new Date(session.startAt).getTime()) / 60000)) }
function fixedSessionTimes(session: CourseSessionDto) { return { start: session.startAt.includes('T') ? session.startAt.split('T')[1].slice(0, 5) : session.startAt.slice(11, 16), end: session.endAt.includes('T') ? session.endAt.split('T')[1].slice(0, 5) : session.endAt.slice(11, 16) } }
function sessionLabel(session: CourseSessionDto) { return `${session.startAt.slice(0, 10)} · ${fixedSessionTimes(session).start}–${fixedSessionTimes(session).end}` }
