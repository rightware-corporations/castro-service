import type { ReactNode } from 'react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ClipboardList, Inbox, Search, UsersRound } from 'lucide-react'
import { operationsQueryAdmin } from '../../api/client/operationsQueryAdmin'
import type { OperationsBookingItemDto, OperationsCustomerItemDto, OperationsRequestItemDto } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

const PAGE_SIZE = 20

export function RequestsPagedPage() {
  const [page, setPage] = useState(0)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const query = useQuery({ queryKey: ['operations', 'requests', 'paged', page, q, status], queryFn: () => operationsQueryAdmin.listRequests({ page, size: PAGE_SIZE, q, status }) })
  return <PagedShell eyebrow="CRM · RELAÇÃO" title="Pedidos e leads" description="Origem, lifecycle, responsável e próximo follow-up numa única caixa de trabalho." icon={Inbox} q={q} onQ={(value) => { setQ(value); setPage(0) }} status={status} onStatus={(value) => { setStatus(value); setPage(0) }} statusOptions={requestStatuses} loading={query.isLoading} error={query.isError} total={query.data?.total ?? 0} page={page} setPage={setPage}>
    {(query.data?.items ?? []).map((item) => <RequestRow key={item.id} item={item} />)}
  </PagedShell>
}

export function BookingsPagedPage() {
  const [page, setPage] = useState(0)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const query = useQuery({ queryKey: ['operations', 'bookings', 'paged', page, q, status], queryFn: () => operationsQueryAdmin.listBookings({ page, size: PAGE_SIZE, q, status }) })
  return <PagedShell eyebrow="OPERAÇÃO" title="Reservas" description="Pesquisa, estado e paginação calculados no backend." icon={ClipboardList} q={q} onQ={(value) => { setQ(value); setPage(0) }} status={status} onStatus={(value) => { setStatus(value); setPage(0) }} statusOptions={bookingStatuses} loading={query.isLoading} error={query.isError} total={query.data?.total ?? 0} page={page} setPage={setPage}>
    {(query.data?.items ?? []).map((item) => <BookingRow key={item.id} item={item} />)}
  </PagedShell>
}

export function CustomersPagedPage() {
  const [page, setPage] = useState(0)
  const [q, setQ] = useState('')
  const query = useQuery({ queryKey: ['operations', 'customers', 'paged', page, q], queryFn: () => operationsQueryAdmin.listCustomers({ page, size: PAGE_SIZE, q }) })
  return <PagedShell eyebrow="CRM · RELAÇÃO" title="Contactos e clientes" description="Relação consolidada desde o primeiro lead até ao cliente recorrente." icon={UsersRound} q={q} onQ={(value) => { setQ(value); setPage(0) }} loading={query.isLoading} error={query.isError} total={query.data?.total ?? 0} page={page} setPage={setPage}>
    {(query.data?.items ?? []).map((item) => <CustomerRow key={item.id} item={item} />)}
  </PagedShell>
}

type Option = readonly [string, string]
type PagedShellProps = {
  eyebrow: string; title: string; description: string; icon: typeof Inbox; q: string; onQ(value: string): void;
  status?: string; onStatus?(value: string): void; statusOptions?: readonly Option[]; loading: boolean; error: boolean;
  total: number; page: number; setPage(value: number | ((current: number) => number)): void; children: ReactNode
}

function PagedShell({ eyebrow, title, description, icon: Icon, q, onQ, status = '', onStatus, statusOptions, loading, error, total, page, setPage, children }: PagedShellProps) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const current = Math.min(page + 1, pages)
  return <section className="ops-v2">
    <header className="ops-v2__hero"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div><div className="ops-v2__environment"><Icon size={18}/><div><small>Total filtrado</small><strong>{total}</strong></div></div></header>
    <section className="ops-workspace">
      <div className="ops-workspace__toolbar">
        <label className="ops-workspace__search"><Search size={17}/><input value={q} onChange={(event) => onQ(event.target.value)} placeholder="Pesquisar" aria-label={`Pesquisar ${title.toLowerCase()}`} /></label>
        {statusOptions && onStatus && <label><span className="sr-only">Estado</span><select value={status} onChange={(event) => onStatus(event.target.value)}><option value="">Todos os estados</option>{statusOptions.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
      </div>
      {loading ? <LoadingState label={`A carregar ${title.toLowerCase()}.`} /> : error ? <ErrorState title={`Não foi possível carregar ${title.toLowerCase()}.`} /> : <div className="ops-workspace__table-shell">{children || <div className="catalog-admin__empty"><h3>Sem resultados.</h3><p>A pesquisa atual não devolveu registos.</p></div>}</div>}
      <nav aria-label={`Paginação de ${title.toLowerCase()}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 20 }}>
        <button className="button button--secondary" type="button" disabled={page <= 0 || loading} onClick={() => setPage((value) => Math.max(0, value - 1))}>Anterior</button>
        <span>Página {current} de {pages} · {total} registo(s)</span>
        <button className="button button--secondary" type="button" disabled={page + 1 >= pages || loading} onClick={() => setPage((value) => value + 1)}>Seguinte</button>
      </nav>
    </section>
  </section>
}

function RequestRow({ item }: { item: OperationsRequestItemDto }) {
  const followUp = item.followUpAt ? formatDate(item.followUpAt) : 'Sem follow-up'
  const overdue = Boolean(item.followUpAt && new Date(item.followUpAt).getTime() < Date.now() && !['CLOSED','CANCELLED'].includes(item.status))
  return <Link className="ops-workspace__row crm-inbox-row" to={`/app/pedidos/${item.id}`}>
    <span><strong>{fullName(item)}</strong><small>{lifecycleLabel(item.lifecycleStage)} · {item.email || item.phone || 'Sem contacto'}</small></span>
    <span><strong>{item.sourceEntityName || humanize(item.type)}</strong><small>{item.sourceCta ? humanize(item.sourceCta) : item.sourceType ? humanize(item.sourceType) : 'Origem geral'}</small></span>
    <span className={overdue ? 'crm-inbox-row__overdue' : ''}><strong>{followUp}</strong><small>{item.ownerName || 'Sem responsável'}</small></span>
    <span>{humanize(item.status)}</span><span>{formatDate(item.createdAt)}</span>
  </Link>
}

function BookingRow({ item }: { item: OperationsBookingItemDto }) {
  return <Link className="ops-workspace__row ops-workspace__row--bookings" to={`/app/reservas/${item.id}`}><span><strong>{item.reference}</strong></span><span>{fullName(item)}</span><span>{humanize(item.bookableType)}</span><span>{formatDate(item.startAt)}</span><span>{humanize(item.status)}</span></Link>
}

function CustomerRow({ item }: { item: OperationsCustomerItemDto }) {
  return <Link className="ops-workspace__row" to={`/app/clientes/${item.id}`}><span><strong>{fullName(item)}</strong><small>{lifecycleLabel(item.lifecycleStage)}</small></span><span>{item.email || '—'}</span><span>{item.phone || '—'}</span><span>{item.source || '—'}</span><span>{formatDate(item.updatedAt)}</span></Link>
}

const requestStatuses = [['NEW','Novo'],['CONTACTED','Contactado'],['QUALIFIED','Qualificado'],['WAITING_CUSTOMER','A aguardar cliente'],['CONVERTED','Convertido'],['CLOSED','Fechado'],['CANCELLED','Cancelado']] as const
const bookingStatuses = [['PENDING','Pendente'],['CONFIRMED','Confirmada'],['COMPLETED','Concluída'],['CANCELLED','Cancelada'],['NO_SHOW','Não compareceu']] as const
function fullName(item: { firstName?: string | null; lastName?: string | null }) { return [item.firstName, item.lastName].filter(Boolean).join(' ') || 'Sem nome' }
function humanize(value: string) { return value.replaceAll('_', ' ').toLocaleLowerCase('pt-PT').replace(/^./, (letter) => letter.toUpperCase()) }
function lifecycleLabel(value?: string | null) { return value ? humanize(value) : 'Lead' }
function formatDate(value: string) { return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) }
