import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Phone, RotateCcw, UserRound, X } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import type { AdminServiceDto, AdminSpaceDto, BlockedPeriodInputDto, OperationsBookingItemDto } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'
import './SecretaryCalendarPage.css'

type CalendarMode = 'month' | 'week'
type BlockType = 'SERVICE' | 'SPACE'

export function SecretaryCalendarPage() {
  const api = useApi()
  const can = useCan()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<CalendarMode>('month')
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()))
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  const bookings = useQuery({ queryKey: ['operations', 'calendar', 'bookings'], queryFn: () => api.operations.listBookings(), enabled: can('booking.read') })
  const blocked = useQuery({ queryKey: ['operations', 'calendar', 'blocked'], queryFn: () => api.operations.listBlockedPeriods(), enabled: can('availability.read') })
  const services = useQuery({ queryKey: ['operations', 'calendar', 'services'], queryFn: () => api.operations.listAdminServices(), enabled: can('service.read') })
  const spaces = useQuery({ queryKey: ['operations', 'calendar', 'spaces'], queryFn: () => api.operations.listAdminSpaces(), enabled: can('space.read') })
  const config = useQuery({ queryKey: ['public', 'config'], queryFn: () => api.public.getConfig() })

  const selectedBooking = bookings.data?.items.find((item) => item.id === selectedBookingId) ?? null
  const dayBookings = (bookings.data?.items ?? []).filter((item) => localDateKey(item.startAt, config.data?.businessTimezone) === selectedDate)
  const dayBlocks = (blocked.data?.items ?? []).filter((item) => localDateKey(item.startAt, config.data?.businessTimezone) === selectedDate)
  const visibleDays = mode === 'month' ? monthGrid(anchor) : weekGrid(anchor)

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['operations', 'calendar'] })
    void queryClient.invalidateQueries({ queryKey: ['operations', 'bookings'] })
    void queryClient.invalidateQueries({ queryKey: ['operations', 'summary'] })
  }

  if (bookings.isLoading || blocked.isLoading) return <LoadingState label="A carregar agenda operacional." />
  if (bookings.isError || blocked.isError) return <ErrorState title="Não foi possível carregar a agenda operacional." />

  return <section className="secretary-calendar">
    <header className="secretary-calendar__hero">
      <div><span className="eyebrow">PLANEAMENTO · SECRETARIA</span><h1>Calendário operacional</h1><p>Marcações, períodos ocupados e reagendamentos no mesmo workspace. O website lê a mesma disponibilidade.</p></div>
      <div className="secretary-calendar__mode" aria-label="Vista do calendário">
        <button type="button" className={mode === 'month' ? 'is-active' : ''} onClick={() => setMode('month')}>Mês</button>
        <button type="button" className={mode === 'week' ? 'is-active' : ''} onClick={() => setMode('week')}>Semana</button>
      </div>
    </header>

    <div className="secretary-calendar__toolbar">
      <button type="button" onClick={() => setAnchor(shiftAnchor(anchor, mode, -1))} aria-label="Período anterior"><ChevronLeft size={17} /></button>
      <div><strong>{periodLabel(anchor, mode)}</strong><small>{bookings.data?.total ?? 0} marcações · {blocked.data?.total ?? 0} bloqueios registados</small></div>
      <button type="button" onClick={() => setAnchor(shiftAnchor(anchor, mode, 1))} aria-label="Período seguinte"><ChevronRight size={17} /></button>
      <button type="button" className="secretary-calendar__today" onClick={() => { const today = startOfDay(new Date()); setAnchor(today); setSelectedDate(dateKey(today)) }}>Hoje</button>
    </div>

    <div className={`secretary-calendar__grid secretary-calendar__grid--${mode}`}>
      {visibleDays.map((day) => {
        const key = dateKey(day)
        const items = (bookings.data?.items ?? []).filter((item) => localDateKey(item.startAt, config.data?.businessTimezone) === key)
        const blocks = (blocked.data?.items ?? []).filter((item) => localDateKey(item.startAt, config.data?.businessTimezone) === key)
        return <button key={key} type="button" className={`secretary-calendar__day${selectedDate === key ? ' is-selected' : ''}${dateKey(new Date()) === key ? ' is-today' : ''}`} onClick={() => setSelectedDate(key)}>
          <span className="secretary-calendar__day-number">{day.getDate()}</span>
          <small>{weekdayLabel(day)}</small>
          <div className="secretary-calendar__day-events">
            {items.slice(0, 3).map((item) => <span key={item.id} className={`is-booking status-${item.status.toLowerCase()}`}>{timeLabel(item.startAt, config.data?.businessTimezone)} · {item.reference}</span>)}
            {blocks.slice(0, 2).map((item) => <span key={item.id} className="is-block"><Ban size={11} />{timeLabel(item.startAt, config.data?.businessTimezone)} ocupado</span>)}
            {items.length + blocks.length > 5 ? <span>+{items.length + blocks.length - 5} itens</span> : null}
          </div>
        </button>
      })}
    </div>

    <div className="secretary-calendar__workspace">
      <section className="secretary-calendar__agenda">
        <div className="secretary-calendar__section-head"><div><span className="eyebrow">DIA SELECIONADO</span><h2>{humanDate(selectedDate)}</h2></div><CalendarDays size={20} /></div>
        <h3>Marcações</h3>
        {dayBookings.length ? <div className="secretary-calendar__items">{dayBookings.map((item) => <button key={item.id} type="button" className={selectedBookingId === item.id ? 'is-selected' : ''} onClick={() => setSelectedBookingId(item.id)}><span><Clock3 size={15} />{timeLabel(item.startAt, config.data?.businessTimezone)}–{timeLabel(item.endAt, config.data?.businessTimezone)}</span><strong>{item.reference}</strong><small>{fullName(item)} · {humanize(item.bookableType)} · {humanize(item.status)}</small></button>)}</div> : <p className="secretary-calendar__empty">Sem marcações neste dia.</p>}
        <h3>Bloqueios</h3>
        {dayBlocks.length ? <div className="secretary-calendar__blocks">{dayBlocks.map((item) => <article key={item.id}><div><Ban size={15} /><strong>{timeLabel(item.startAt, config.data?.businessTimezone)}–{timeLabel(item.endAt, config.data?.businessTimezone)}</strong><span>{resourceName(item.bookableType, item.bookableId, services.data?.items, spaces.data?.items)}</span>{item.reason ? <small>{item.reason}</small> : null}</div>{can('availability.manage') ? <button type="button" onClick={() => api.operations.deleteBlockedPeriod(item.id).then(refresh)} aria-label="Remover bloqueio"><X size={15} /></button> : null}</article>)}</div> : <p className="secretary-calendar__empty">Sem bloqueios neste dia.</p>}
      </section>

      <aside className="secretary-calendar__side">
        {selectedBooking ? <BookingPanel booking={selectedBooking} timezone={config.data?.businessTimezone} onChanged={refresh} /> : <BlockPeriodForm selectedDate={selectedDate} timezone={config.data?.businessTimezone ?? 'Africa/Maputo'} services={services.data?.items ?? []} spaces={spaces.data?.items ?? []} onCreated={refresh} />}
      </aside>
    </div>
  </section>
}

function BookingPanel({ booking, timezone, onChanged }: { booking: OperationsBookingItemDto; timezone?: string; onChanged: () => void }) {
  const api = useApi()
  const can = useCan()
  const [rescheduleDate, setRescheduleDate] = useState(() => localDateKey(booking.startAt, timezone))
  const [showReschedule, setShowReschedule] = useState(false)
  const slots = useQuery({ queryKey: ['operations', 'booking', booking.id, 'reschedule-slots', rescheduleDate], queryFn: () => api.operations.listRescheduleSlots(booking.id, rescheduleDate), enabled: showReschedule && can('booking.update') && Boolean(rescheduleDate) })
  const status = useMutation({ mutationFn: (next: 'CONFIRMED' | 'CANCELLED') => api.operations.updateBookingStatus(booking.id, next), onSuccess: onChanged })
  const reschedule = useMutation({ mutationFn: (slot: { start: string; end: string }) => api.operations.rescheduleBooking(booking.id, { date: rescheduleDate, startTime: slot.start.slice(0, 5), endTime: slot.end.slice(0, 5) }), onSuccess: () => { setShowReschedule(false); onChanged() } })

  return <div className="secretary-calendar__booking-panel">
    <span className="eyebrow">MARCAÇÃO</span><h2>{booking.reference}</h2>
    <dl><div><dt><UserRound size={14} />Cliente</dt><dd>{fullName(booking)}</dd></div><div><dt><Phone size={14} />Telefone</dt><dd>{booking.phone || '—'}</dd></div><div><dt>Tipo</dt><dd>{humanize(booking.bookableType)}</dd></div><div><dt>Horário</dt><dd>{humanDate(localDateKey(booking.startAt, timezone))} · {timeLabel(booking.startAt, timezone)}–{timeLabel(booking.endAt, timezone)}</dd></div><div><dt>Estado</dt><dd>{humanize(booking.status)}</dd></div></dl>
    {can('booking.update') ? <div className="secretary-calendar__booking-actions">
      {booking.status === 'PENDING' ? <button type="button" onClick={() => status.mutate('CONFIRMED')} disabled={status.isPending}><Check size={15} />Confirmar</button> : null}
      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') ? <button type="button" onClick={() => setShowReschedule((value) => !value)}><RotateCcw size={15} />Reagendar</button> : null}
      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') ? <button type="button" className="is-danger" onClick={() => status.mutate('CANCELLED')} disabled={status.isPending}><X size={15} />Cancelar</button> : null}
    </div> : null}
    {status.isError ? <p className="field-error" role="alert">Não foi possível atualizar a marcação.</p> : null}
    {showReschedule ? <div className="secretary-calendar__reschedule"><label>Nova data<input type="date" value={rescheduleDate} onChange={(event) => setRescheduleDate(event.target.value)} /></label>{slots.isLoading ? <p>A procurar horários…</p> : slots.isError ? <p className="field-error">Não foi possível consultar horários.</p> : slots.data?.items.filter((slot) => slot.status === 'AVAILABLE').length ? <div className="secretary-calendar__slots">{slots.data.items.filter((slot) => slot.status === 'AVAILABLE').map((slot) => <button key={`${slot.start}-${slot.end}`} type="button" disabled={reschedule.isPending} onClick={() => reschedule.mutate(slot)}>{slot.start.slice(0,5)}–{slot.end.slice(0,5)}</button>)}</div> : <p>Nenhum horário disponível nesta data.</p>}{reschedule.isError ? <p className="field-error">O horário deixou de estar disponível. Escolha outro.</p> : null}</div> : null}
  </div>
}

function BlockPeriodForm({ selectedDate, timezone, services, spaces, onCreated }: { selectedDate: string; timezone: string; services: AdminServiceDto[]; spaces: AdminSpaceDto[]; onCreated: () => void }) {
  const api = useApi()
  const can = useCan()
  const [type, setType] = useState<BlockType>('SERVICE')
  const availableResources = type === 'SERVICE' ? services.filter((item) => item.active) : spaces.filter((item) => item.active)
  const [resourceId, setResourceId] = useState('')
  const [start, setStart] = useState(`${selectedDate}T09:00`)
  const [end, setEnd] = useState(`${selectedDate}T10:00`)
  const [reason, setReason] = useState('')
  const create = useMutation({ mutationFn: (input: BlockedPeriodInputDto) => api.operations.createBlockedPeriod(input), onSuccess: () => { setReason(''); onCreated() } })

  const currentResource = availableResources.some((item) => item.id === resourceId) ? resourceId : availableResources[0]?.id ?? ''
  const valid = Boolean(currentResource && start && end && start < end)

  function submit() {
    if (!valid || !can('availability.manage')) return
    create.mutate({ bookableType: type, bookableId: currentResource, startAt: zonedLocalToOffset(start, timezone), endAt: zonedLocalToOffset(end, timezone), reason: reason.trim() || undefined })
  }

  return <div className="secretary-calendar__block-form">
    <span className="eyebrow">OCUPAÇÃO EXTERNA</span><h2>Bloquear horário</h2><p>Use quando a marcação entrou por telefone, WhatsApp ou outro canal fora do website.</p>
    <label>Tipo<select value={type} onChange={(event) => { setType(event.target.value as BlockType); setResourceId('') }}><option value="SERVICE">Serviço / consultoria</option><option value="SPACE">Espaço</option></select></label>
    <label>Recurso<select value={currentResource} onChange={(event) => setResourceId(event.target.value)}>{availableResources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <label>Início<input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} /></label>
    <label>Fim<input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
    <label>Motivo<textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Ex.: marcação recebida por telefone" /></label>
    {create.isError ? <p className="field-error" role="alert">Não foi possível criar o bloqueio.</p> : null}
    <button type="button" className="ds-button ds-button--primary" disabled={!valid || !can('availability.manage') || create.isPending} onClick={submit}><Ban size={15} />{create.isPending ? 'A bloquear…' : 'Bloquear horário'}</button>
  </div>
}

function monthGrid(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const mondayOffset = (first.getDay() + 6) % 7
  const start = new Date(first); start.setDate(first.getDate() - mondayOffset)
  return Array.from({ length: 42 }, (_, index) => { const day = new Date(start); day.setDate(start.getDate() + index); return day })
}
function weekGrid(anchor: Date) {
  const start = new Date(anchor); start.setDate(anchor.getDate() - ((anchor.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, index) => { const day = new Date(start); day.setDate(start.getDate() + index); return day })
}
function shiftAnchor(anchor: Date, mode: CalendarMode, direction: number) { const next = new Date(anchor); if (mode === 'month') next.setMonth(next.getMonth() + direction); else next.setDate(next.getDate() + (7 * direction)); return next }
function startOfDay(value: Date) { return new Date(value.getFullYear(), value.getMonth(), value.getDate()) }
function dateKey(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}` }
function localDateKey(value: string, timezone = 'Africa/Maputo') { const date = new Date(value); if (Number.isNaN(date.getTime())) return value.slice(0, 10); const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date); const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ''; return `${get('year')}-${get('month')}-${get('day')}` }
function timeLabel(value: string, timezone = 'Africa/Maputo') { const date = new Date(value); return Number.isNaN(date.getTime()) ? value.slice(11, 16) : new Intl.DateTimeFormat('pt-PT', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(date) }
function weekdayLabel(day: Date) { return new Intl.DateTimeFormat('pt-PT', { weekday: 'short' }).format(day) }
function periodLabel(anchor: Date, mode: CalendarMode) { return mode === 'month' ? new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(anchor) : `${humanDate(dateKey(weekGrid(anchor)[0]))} — ${humanDate(dateKey(weekGrid(anchor)[6]))}` }
function humanDate(value: string) { const date = new Date(`${value}T12:00:00`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }).format(date) }
function humanize(value: string) { return value.replaceAll('_', ' ').toLocaleLowerCase('pt-PT').replace(/^./, (letter) => letter.toLocaleUpperCase('pt-PT')) }
function fullName(item: OperationsBookingItemDto) { return [item.firstName, item.lastName].filter(Boolean).join(' ') || item.email || 'Cliente' }
function resourceName(type: string, id: string, services?: AdminServiceDto[], spaces?: AdminSpaceDto[]) { return type === 'SERVICE' ? services?.find((item) => item.id === id)?.name ?? 'Serviço' : spaces?.find((item) => item.id === id)?.name ?? 'Espaço' }

export function zonedLocalToOffset(local: string, timezone: string) {
  const [datePart, timePart] = local.split('T')
  if (!datePart || !timePart) throw new Error('Invalid local date-time')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0)
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(guess))
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0)
  const represented = Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'), value('second'))
  const offsetMinutes = Math.round((represented - guess) / 60000)
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absolute = Math.abs(offsetMinutes)
  const offset = `${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`
  return `${datePart}T${timePart.length === 5 ? `${timePart}:00` : timePart}${offset}`
}
