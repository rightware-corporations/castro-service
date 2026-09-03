import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CalendarDays, Clock3, Inbox, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApi, useCan, useSession } from '../../app/providers/AppProviders'
import type { OperationsBookingItemDto, OperationsRequestItemDto } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

const activeRequestStatuses = new Set(['NEW', 'CONTACTED', 'QUALIFIED', 'WAITING_CUSTOMER'])
const activeBookingStatuses = new Set(['PENDING', 'CONFIRMED'])

export function OwnerDashboardPage() {
  const api = useApi()
  const can = useCan()
  const session = useSession()
  const range = useMemo(() => lastThirtyDays(), [])
  const summary = useQuery({ queryKey: ['owner', 'summary'], queryFn: () => api.operations.getSummary(), enabled: can('dashboard.read') })
  const bookings = useQuery({ queryKey: ['owner', 'bookings'], queryFn: () => api.operations.listBookings(), enabled: can('booking.read') })
  const requests = useQuery({ queryKey: ['owner', 'requests'], queryFn: () => api.operations.listRequests(), enabled: can('request.read') })
  const report = useQuery({ queryKey: ['owner', 'report', range.from, range.to], queryFn: () => api.operations.getReport(range.from, range.to), enabled: can('report.read') })

  const now = bookings.dataUpdatedAt
  const upcoming = useMemo(() => (bookings.data?.items ?? [])
    .filter((booking) => activeBookingStatuses.has(booking.status) && (!now || new Date(booking.startAt).getTime() >= now))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 5), [bookings.data, now])
  const openRequests = useMemo(() => (requests.data?.items ?? []).filter((request) => activeRequestStatuses.has(request.status)), [requests.data])
  const pendingBookings = (bookings.data?.items ?? []).filter((booking) => booking.status === 'PENDING').length
  const confirmedBookings = (bookings.data?.items ?? []).filter((booking) => booking.status === 'CONFIRMED').length
  const loading = summary.isLoading || bookings.isLoading || requests.isLoading || report.isLoading
  const failed = summary.isError || bookings.isError || requests.isError || report.isError

  return <section className="owner-dashboard">
    <header className="owner-dashboard__hero">
      <div>
        <span className="owner-dashboard__kicker">VISÃO EXECUTIVA · CASTRO’S SERVICES</span>
        <h1>{ownerGreeting(session?.displayName)}</h1>
        <p>Uma leitura limpa da operação para acompanhar a empresa sem entrar no trabalho diário da equipa.</p>
      </div>
      <div className="owner-dashboard__date"><small>Hoje</small><strong>{formatLongDate(new Date())}</strong></div>
    </header>

    {loading && <LoadingState label="A preparar a visão executiva." />}
    {failed && <ErrorState title="Não foi possível carregar toda a visão executiva." />}

    <section className="owner-dashboard__pulse" aria-label="Estado da empresa">
      <div className="owner-dashboard__pulse-lead">
        <span>Estado atual</span>
        <strong>{openRequests.length + pendingBookings === 0 ? 'Operação sem pendências críticas visíveis.' : `${openRequests.length + pendingBookings} pontos pedem acompanhamento.`}</strong>
        <p>Este indicador usa apenas pedidos ainda ativos e reservas pendentes; não representa desempenho financeiro.</p>
      </div>
      <div className="owner-dashboard__pulse-metrics">
        <ExecutiveMetric label="Pedidos ativos" value={openRequests.length} context={`${summary.data?.requests ?? '—'} pedidos registados`} />
        <ExecutiveMetric label="Reservas pendentes" value={pendingBookings} context={`${confirmedBookings} confirmadas`} />
        <ExecutiveMetric label="Clientes" value={summary.data?.customers ?? '—'} context="base atual da organização" />
      </div>
    </section>

    <div className="owner-dashboard__grid">
      <section className="owner-dashboard__panel owner-dashboard__panel--agenda">
        <PanelHeading eyebrow="PRÓXIMA ATIVIDADE" title="Agenda em movimento" to="/owner/agenda" />
        {upcoming.length ? <div className="owner-agenda-list">{upcoming.map((booking) => <UpcomingBooking key={booking.id} booking={booking} />)}</div> : <OwnerEmpty title="Sem reservas futuras visíveis." text="Quando existirem reservas confirmadas ou pendentes, aparecem aqui em ordem temporal." />}
      </section>

      <section className="owner-dashboard__panel owner-dashboard__panel--requests">
        <PanelHeading eyebrow="PROCURA" title="Pedidos a acompanhar" to="/owner/atividade" />
        <div className="owner-request-summary">
          <div><Inbox size={20} /><strong>{openRequests.length}</strong><span>pedidos ainda ativos</span></div>
          <RequestStatusLine label="Novos" value={countRequests(openRequests, 'NEW')} />
          <RequestStatusLine label="Em contacto" value={countRequests(openRequests, 'CONTACTED')} />
          <RequestStatusLine label="Qualificados" value={countRequests(openRequests, 'QUALIFIED')} />
          <RequestStatusLine label="Aguardam cliente" value={countRequests(openRequests, 'WAITING_CUSTOMER')} />
        </div>
      </section>
    </div>

    <section className="owner-dashboard__period">
      <div className="owner-dashboard__period-copy">
        <span className="owner-dashboard__kicker">ÚLTIMOS 30 DIAS</span>
        <h2>Atividade real, sem métricas inventadas.</h2>
        <p>Pedidos, reservas, clientes e tarefas criados no período. Receita e conversão só entram quando existirem contratos de dados reais para esses indicadores.</p>
        <Link className="owner-dashboard__text-link" to="/owner/relatorios">Abrir relatórios <ArrowRight size={16} /></Link>
      </div>
      <div className="owner-dashboard__period-numbers">
        <PeriodMetric value={report.data?.requestsCreated ?? '—'} label="Pedidos" />
        <PeriodMetric value={report.data?.bookingsCreated ?? '—'} label="Reservas" />
        <PeriodMetric value={report.data?.customersCreated ?? '—'} label="Novos clientes" />
        <PeriodMetric value={report.data?.tasksCreated ?? '—'} label="Tarefas" />
      </div>
    </section>

    <section className="owner-dashboard__links" aria-label="Atalhos executivos">
      <ExecutiveLink to="/owner/agenda" icon={CalendarDays} label="Agenda" copy="Próximas reservas e atividade temporal." />
      <ExecutiveLink to="/owner/atividade" icon={Clock3} label="Atividade" copy="Pedidos e reservas que merecem atenção." />
      <ExecutiveLink to="/owner/clientes" icon={UsersRound} label="Clientes" copy="Visão da base de clientes da organização." />
    </section>
  </section>
}

function ExecutiveMetric({ label, value, context }: { label: string; value: string | number; context: string }) {
  return <article><small>{label}</small><strong>{value}</strong><span>{context}</span></article>
}

function PeriodMetric({ value, label }: { value: string | number; label: string }) {
  return <article><strong>{value}</strong><span>{label}</span></article>
}

function PanelHeading({ eyebrow, title, to }: { eyebrow: string; title: string; to: string }) {
  return <header className="owner-panel-heading"><div><span>{eyebrow}</span><h2>{title}</h2></div><Link to={to} aria-label={`Abrir ${title}`}><ArrowRight size={18} /></Link></header>
}

function UpcomingBooking({ booking }: { booking: OperationsBookingItemDto }) {
  return <article className="owner-agenda-item">
    <time dateTime={booking.startAt}><strong>{formatDay(booking.startAt)}</strong><span>{formatTime(booking.startAt)}</span></time>
    <div><strong>{booking.reference}</strong><span>{customerName(booking)}</span></div>
    <span className={`owner-status owner-status--${booking.status.toLowerCase()}`}>{statusLabel(booking.status)}</span>
  </article>
}

function RequestStatusLine({ label, value }: { label: string; value: number }) { return <p><span>{label}</span><strong>{value}</strong></p> }
function OwnerEmpty({ title, text }: { title: string; text: string }) { return <div className="owner-empty"><strong>{title}</strong><p>{text}</p></div> }
function ExecutiveLink({ to, icon: Icon, label, copy }: { to: string; icon: typeof CalendarDays; label: string; copy: string }) { return <Link to={to}><Icon size={20} /><div><strong>{label}</strong><span>{copy}</span></div><ArrowRight size={17} /></Link> }
function countRequests(items: OperationsRequestItemDto[], status: string) { return items.filter((request) => request.status === status).length }
function customerName(booking: OperationsBookingItemDto) { return [booking.firstName, booking.lastName].filter(Boolean).join(' ') || booking.email || 'Cliente' }
function statusLabel(status: string) { return status === 'CONFIRMED' ? 'Confirmada' : status === 'PENDING' ? 'Pendente' : status.replaceAll('_', ' ') }
function formatDay(value: string) { return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' }).format(new Date(value)) }
function formatTime(value: string) { return new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) }
function formatLongDate(value: Date) { return new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }).format(value) }
function ownerGreeting(name?: string) { const firstName = name?.trim().split(/\s+/)[0]; return firstName ? `Visão da empresa, ${firstName}.` : 'Visão da empresa.' }
function lastThirtyDays() { const end = new Date(); const start = new Date(end); start.setUTCDate(start.getUTCDate() - 29); return { from: `${start.toISOString().slice(0, 10)}T00:00:00Z`, to: `${end.toISOString().slice(0, 10)}T23:59:59.999Z` } }
