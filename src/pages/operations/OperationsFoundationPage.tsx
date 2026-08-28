import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CalendarDays, CheckSquare2, ClipboardList, Filter, Inbox, LayoutDashboard, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, UsersRound } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import type { OperationsBookingItemDto, OperationsCustomerItemDto, OperationsRequestItemDto } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

const modules = [
  { to: '/app/pedidos', label: 'Pedidos', description: 'Triagem e acompanhamento de contactos recebidos.', icon: Inbox, permission: 'request.read' as const },
  { to: '/app/reservas', label: 'Reservas', description: 'Operação de reservas, estado e contexto do cliente.', icon: ClipboardList, permission: 'booking.read' as const },
  { to: '/app/calendario', label: 'Calendário', description: 'Leitura temporal de reservas, disponibilidade e bloqueios.', icon: CalendarDays, permission: 'booking.read' as const },
  { to: '/app/clientes', label: 'Clientes', description: 'Histórico relacional preparado para pedidos e reservas.', icon: UsersRound, permission: 'customer.read' as const },
  { to: '/app/tarefas', label: 'Tarefas', description: 'Seguimentos e próximos passos da equipa.', icon: CheckSquare2, permission: 'request.read' as const },
  { to: '/app/configuracoes', label: 'Configurações', description: 'Catálogo, disponibilidade, conteúdos e acessos.', icon: Settings, permission: 'settings.read' as const },
]

const pageMeta: Record<string, { eyebrow: string; title: string; description: string }> = {
  '/app/dashboard': { eyebrow: 'VISÃO GERAL', title: 'Dashboard', description: 'Ponto de entrada para o trabalho operacional da Castro’s.' },
  '/app/pedidos': { eyebrow: 'RELAÇÃO COM CLIENTES', title: 'Pedidos', description: 'Triagem, atribuição e acompanhamento de pedidos recebidos.' },
  '/app/reservas': { eyebrow: 'OPERAÇÃO', title: 'Reservas', description: 'Acompanhe reservas e o respetivo estado num único workspace.' },
  '/app/calendario': { eyebrow: 'PLANEAMENTO', title: 'Calendário', description: 'Visão temporal para reservas, disponibilidade e bloqueios.' },
  '/app/clientes': { eyebrow: 'RELAÇÃO', title: 'Clientes', description: 'Vista consolidada do relacionamento com pessoas e organizações.' },
  '/app/tarefas': { eyebrow: 'FOLLOW-UP', title: 'Tarefas', description: 'Próximos passos, seguimentos e trabalho pendente da equipa.' },
  '/app/configuracoes': { eyebrow: 'ADMINISTRAÇÃO', title: 'Configurações', description: 'Estrutura para gerir catálogo, disponibilidade, conteúdos e acessos.' },
}

export function OperationsFoundationPage() {
  const { pathname } = useLocation()
  const can = useCan()
  const api = useApi()
  const meta = pageMeta[pathname] ?? (pathname.startsWith('/app/configuracoes') ? pageMeta['/app/configuracoes'] : { eyebrow: 'CASTRO’S OPERATIONS', title: 'Área operacional', description: 'Módulo preparado para evolução funcional.' })
  const visibleModules = modules.filter((module) => can(module.permission))

  return <section className="ops-v2">
    <header className="ops-v2__hero"><div><span className="eyebrow">{meta.eyebrow}</span><h1>{meta.title}</h1><p>{meta.description}</p></div><div className="ops-v2__environment" aria-label="Estado do ambiente"><span className={api.kind === 'mock' ? 'is-development' : 'is-connected'} /><div><small>Dados</small><strong>{api.kind === 'mock' ? 'Modo de desenvolvimento' : 'Backend ligado'}</strong></div></div></header>
    {pathname === '/app/dashboard' && <Dashboard visibleModules={visibleModules} />}
    {pathname === '/app/pedidos' && <RequestsWorkspace />}
    {pathname === '/app/reservas' && <BookingsWorkspace />}
    {pathname === '/app/calendario' && <CalendarWorkspace />}
    {pathname === '/app/clientes' && <CustomersWorkspace />}
    {pathname === '/app/tarefas' && <TasksWorkspace />}
    {pathname.startsWith('/app/configuracoes') && <SettingsWorkspace pathname={pathname} />}
    {!pageMeta[pathname] && !pathname.startsWith('/app/configuracoes') && <OperationalEmptyState />}
  </section>
}

function Dashboard({ visibleModules }: { visibleModules: typeof modules }) {
  const api = useApi()
  const can = useCan()
  const summary = useQuery({ queryKey: ['operations', 'summary'], queryFn: () => api.operations.getSummary(), enabled: can('dashboard.read') })
  return <>
    {summary.isLoading && <LoadingState label="A carregar visão operacional." />}
    {summary.isError && <ErrorState title="Não foi possível carregar a visão operacional." />}
    <section className="ops-v2__status-grid" aria-label="Estado operacional">
      <article><span>01</span><div><small>Pedidos</small><strong>{summary.data?.requests ?? '—'}</strong><p>Pedidos registados na organização atual.</p></div></article>
      <article><span>02</span><div><small>Reservas</small><strong>{summary.data?.bookings ?? '—'}</strong><p>Reservas registadas na organização atual.</p></div></article>
      <article><span>03</span><div><small>Clientes</small><strong>{summary.data?.customers ?? '—'}</strong><p>Clientes consolidados a partir das interações.</p></div></article>
    </section>
    <section className="ops-v2__modules"><div className="ops-v2__section-heading"><div><span className="eyebrow">WORKSPACE</span><h2>Áreas de trabalho</h2></div><p>Entradas principais da operação.</p></div><div className="ops-v2__module-grid">{visibleModules.map(({ to, label, description, icon: Icon }) => <Link key={to} to={to}><span className="ops-v2__module-icon"><Icon size={20} /></span><div><strong>{label}</strong><p>{description}</p></div><ArrowRight size={18} /></Link>)}</div></section>
  </>
}

function RequestsWorkspace() {
  const api = useApi(); const can = useCan(); const [search, setSearch] = useState(''); const [status, setStatus] = useState('ALL')
  const query = useQuery({ queryKey: ['operations', 'requests'], queryFn: () => api.operations.listRequests(), enabled: can('request.read') })
  const rows = useMemo(() => (query.data?.items ?? []).filter((item) => matchesSearch(item, search) && (status === 'ALL' || item.status === status)), [query.data, search, status])
  return <section className="ops-workspace"><WorkspaceToolbar value={search} onChange={setSearch} searchPlaceholder="Pesquisar por nome, email ou mensagem" action={can('request.create') ? <button type="button" className="ds-button ds-button--primary"><Plus size={16} /> Novo pedido</button> : undefined} /><div className="ops-workspace__tabs" role="tablist" aria-label="Estado dos pedidos">{[['ALL','Todos'],['NEW','Novos'],['IN_PROGRESS','Em acompanhamento'],['CLOSED','Fechados']].map(([value,label]) => <button key={value} type="button" role="tab" aria-selected={status === value} onClick={() => setStatus(value)}>{label}</button>)}</div>{query.isLoading ? <LoadingState label="A carregar pedidos." /> : query.isError ? <ErrorState title="Não foi possível carregar os pedidos." /> : <div className="ops-workspace__table-shell"><div className="ops-workspace__table-head" aria-hidden="true"><span>Cliente</span><span>Tipo</span><span>Contacto</span><span>Estado</span><span>Recebido</span></div>{rows.length ? rows.map((item) => <RequestRow key={item.id} item={item} />) : <OperationalCollectionEmpty icon={Inbox} title="Sem pedidos para mostrar." description="A pesquisa ou o filtro atual não devolveu pedidos nesta organização." />}</div>}</section>
}

function BookingsWorkspace() {
  const api = useApi(); const can = useCan(); const [search, setSearch] = useState('')
  const query = useQuery({ queryKey: ['operations', 'bookings'], queryFn: () => api.operations.listBookings(), enabled: can('booking.read') })
  const rows = useMemo(() => (query.data?.items ?? []).filter((item) => matchesSearch(item, search)), [query.data, search])
  const today = new Date().toISOString().slice(0, 10); const all = query.data?.items ?? []
  const counts = { today: all.filter((b) => b.startAt.startsWith(today)).length, pending: all.filter((b) => b.status === 'PENDING').length, confirmed: all.filter((b) => b.status === 'CONFIRMED').length, cancelled: all.filter((b) => b.status === 'CANCELLED').length }
  return <section className="ops-workspace"><WorkspaceToolbar value={search} onChange={setSearch} searchPlaceholder="Pesquisar por referência ou cliente" action={can('booking.create') ? <button type="button" className="ds-button ds-button--primary"><Plus size={16} /> Nova reserva</button> : undefined} /><div className="ops-workspace__summary-strip"><span><small>Hoje</small><strong>{counts.today}</strong></span><span><small>Pendentes</small><strong>{counts.pending}</strong></span><span><small>Confirmadas</small><strong>{counts.confirmed}</strong></span><span><small>Canceladas</small><strong>{counts.cancelled}</strong></span></div>{query.isLoading ? <LoadingState label="A carregar reservas." /> : query.isError ? <ErrorState title="Não foi possível carregar as reservas." /> : <div className="ops-workspace__table-shell"><div className="ops-workspace__table-head ops-workspace__table-head--bookings" aria-hidden="true"><span>Referência</span><span>Cliente</span><span>Reserva</span><span>Data</span><span>Estado</span></div>{rows.length ? rows.map((item) => <BookingRow key={item.id} item={item} />) : <OperationalCollectionEmpty icon={ClipboardList} title="Sem reservas para mostrar." description="A pesquisa atual não devolveu reservas nesta organização." />}</div>}</section>
}

function CustomersWorkspace() {
  const api = useApi(); const can = useCan(); const [search, setSearch] = useState('')
  const query = useQuery({ queryKey: ['operations', 'customers'], queryFn: () => api.operations.listCustomers(), enabled: can('customer.read') })
  const rows = useMemo(() => (query.data?.items ?? []).filter((item) => matchesSearch(item, search)), [query.data, search])
  return <section className="ops-workspace"><WorkspaceToolbar value={search} onChange={setSearch} searchPlaceholder="Pesquisar clientes por nome, email ou telefone" /><div className="ops-workspace__summary-strip"><span><small>Clientes</small><strong>{query.data?.total ?? '—'}</strong></span><span><small>Origem pública</small><strong>{(query.data?.items ?? []).filter((c) => Boolean(c.source)).length}</strong></span><span><small>Com email</small><strong>{(query.data?.items ?? []).filter((c) => Boolean(c.email)).length}</strong></span><span><small>Com telefone</small><strong>{(query.data?.items ?? []).filter((c) => Boolean(c.phone)).length}</strong></span></div>{query.isLoading ? <LoadingState label="A carregar clientes." /> : query.isError ? <ErrorState title="Não foi possível carregar os clientes." /> : <div className="ops-workspace__table-shell"><div className="ops-workspace__table-head" aria-hidden="true"><span>Cliente</span><span>Contacto</span><span>Empresa</span><span>Origem</span><span>Atualizado</span></div>{rows.length ? rows.map((item) => <CustomerRow key={item.id} item={item} />) : <OperationalCollectionEmpty icon={UsersRound} title="Sem clientes para mostrar." description="A pesquisa atual não devolveu clientes nesta organização." />}</div>}</section>
}

function CalendarWorkspace() {
  const api = useApi(); const can = useCan(); const query = useQuery({ queryKey: ['operations', 'bookings'], queryFn: () => api.operations.listBookings(), enabled: can('booking.read') })
  const [monthOffset, setMonthOffset] = useState(0); const base = new Date(); const month = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1); const year = month.getFullYear(); const monthIndex = month.getMonth(); const firstOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7; const days = new Date(year, monthIndex + 1, 0).getDate(); const label = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(month)
  const bookings = query.data?.items ?? []
  return <section className="ops-workspace"><div className="ops-calendar-toolbar"><div className="ops-calendar-toolbar__nav"><button type="button" aria-label="Período anterior" onClick={() => setMonthOffset((v) => v - 1)}>‹</button><button type="button" onClick={() => setMonthOffset(0)}>Hoje</button><button type="button" aria-label="Período seguinte" onClick={() => setMonthOffset((v) => v + 1)}>›</button></div><strong>{label}</strong><div className="ops-calendar-toolbar__views"><button type="button" className="is-active">Mês</button></div></div>{query.isLoading ? <LoadingState label="A carregar agenda." /> : query.isError ? <ErrorState title="Não foi possível carregar a agenda." /> : <div className="ops-calendar-grid" aria-label={`Calendário de ${label}`}>{['SEG','TER','QUA','QUI','SEX','SÁB','DOM'].map((day) => <div className="ops-calendar-grid__weekday" key={day}>{day}</div>)}{Array.from({ length: 42 }, (_, index) => { const day = index - firstOffset + 1; const iso = day > 0 && day <= days ? `${year}-${String(monthIndex + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}` : ''; const events = iso ? bookings.filter((b) => b.startAt.startsWith(iso)) : []; return <div className="ops-calendar-grid__day" key={index}><span>{iso ? day : ''}</span>{events.slice(0, 2).map((event) => <small key={event.id} className="ops-calendar-event">{formatTime(event.startAt)} · {event.reference}</small>)}{events.length > 2 && <small className="ops-calendar-more">+{events.length - 2}</small>}</div> })}</div>}</section>
}

function TasksWorkspace() { return <section className="ops-workspace"><WorkspaceToolbar value="" onChange={() => undefined} searchPlaceholder="Pesquisar tarefas e seguimentos" action={<button type="button" className="ds-button ds-button--primary" disabled><Plus size={16} /> Nova tarefa</button>} /><OperationalCollectionEmpty icon={CheckSquare2} title="Tarefas ainda aguardam contrato backend." description="Não foi criada uma API fictícia. Este módulo será ativado quando o domínio de tarefas existir no backend." /></section> }

function SettingsWorkspace({ pathname }: { pathname: string }) {
  const items = [{ to:'/app/configuracoes/servicos',label:'Serviços',description:'Catálogo e disponibilidade de reserva.'},{to:'/app/configuracoes/formacao',label:'Formação',description:'Cursos e sessões.'},{to:'/app/configuracoes/espacos',label:'Espaços',description:'Informação, media e publicação.'},{to:'/app/configuracoes/disponibilidade',label:'Disponibilidade',description:'Regras, exceções e bloqueios.'},{to:'/app/configuracoes/conteudo',label:'Conteúdo',description:'Conteúdo público e institucional.'},{to:'/app/configuracoes/utilizadores',label:'Utilizadores',description:'Contas internas.'},{to:'/app/configuracoes/funcoes',label:'Funções',description:'Papéis e responsabilidades.'},{to:'/app/configuracoes/permissoes',label:'Permissões',description:'Matriz de autorização.'}]
  const active = items.find((item) => item.to === pathname)
  return <section className="ops-settings"><aside className="ops-settings__nav"><span className="eyebrow">CONFIGURAÇÃO</span>{items.map((item) => <Link key={item.to} to={item.to} className={pathname === item.to ? 'is-active' : ''}><strong>{item.label}</strong><small>{item.description}</small></Link>)}</aside><div className="ops-settings__panel"><span className="ops-v2__empty-icon"><SlidersHorizontal size={23} /></span><span className="eyebrow">{active?.label ?? 'ADMINISTRAÇÃO'}</span><h2>{active ? `${active.label} preparado para gestão.` : 'Selecione uma área de configuração.'}</h2><p>{active ? 'A leitura e escrita deste domínio será ligada apenas aos respetivos endpoints e permissões internas.' : 'A administração está organizada por domínio para evitar um painel genérico e difícil de manter.'}</p></div></section>
}

function WorkspaceToolbar({ value, onChange, searchPlaceholder, action }: { value: string; onChange: (value: string) => void; searchPlaceholder: string; action?: React.ReactNode }) { return <div className="ops-workspace__toolbar"><label className="ops-workspace__search"><Search size={17} aria-hidden="true" /><span className="visually-hidden">Pesquisar</span><input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={searchPlaceholder} /></label><button type="button" className="ds-button ds-button--secondary" disabled><Filter size={16} /> Filtros</button>{action}</div> }
function RequestRow({ item }: { item: OperationsRequestItemDto }) { return <div className="ops-data-row"><span><strong>{fullName(item)}</strong><small>{item.message || 'Sem mensagem'}</small></span><span>{humanize(item.type)}</span><span>{item.email || item.phone || '—'}</span><span><Status value={item.status} /></span><span>{formatDateTime(item.createdAt)}</span></div> }
function BookingRow({ item }: { item: OperationsBookingItemDto }) { return <div className="ops-data-row ops-data-row--bookings"><span><strong>{item.reference}</strong></span><span>{fullName(item)}</span><span>{humanize(item.bookableType)}</span><span>{formatDateTime(item.startAt)}</span><span><Status value={item.status} /></span></div> }
function CustomerRow({ item }: { item: OperationsCustomerItemDto }) { return <div className="ops-data-row"><span><strong>{fullName(item)}</strong></span><span>{item.email || item.phone || '—'}</span><span>{item.company || '—'}</span><span>{item.source ? humanize(item.source) : '—'}</span><span>{formatDateTime(item.updatedAt)}</span></div> }
function Status({ value }: { value: string }) { return <span className={`ops-status ops-status--${value.toLowerCase()}`}>{humanize(value)}</span> }
function OperationalCollectionEmpty({ icon: Icon, title, description }: { icon: typeof Inbox; title: string; description: string }) { return <div className="ops-collection-empty"><span><Icon size={23} /></span><h2>{title}</h2><p>{description}</p></div> }
function OperationalEmptyState() { return <section className="ops-v2__workspace"><div className="ops-v2__workspace-rail" aria-hidden="true"><span>01</span><span>02</span><span>03</span></div><div className="ops-v2__workspace-main"><div className="ops-v2__empty-icon"><ShieldCheck size={24} /></div><span className="eyebrow">MÓDULO PENDENTE</span><h2>Este módulo ainda não tem contrato funcional completo.</h2><p>A interface só será ligada quando dados e autorização correspondentes existirem.</p><div className="ops-v2__empty-actions"><Link className="ds-button ds-button--primary" to="/app/dashboard">Voltar ao dashboard <LayoutDashboard size={16} /></Link></div></div></section> }
function fullName(item: { firstName?: string | null; lastName?: string | null }) { return [item.firstName, item.lastName].filter(Boolean).join(' ') || 'Sem nome' }
function humanize(value: string) { return value.replaceAll('_', ' ').toLocaleLowerCase('pt-PT').replace(/^./, (c) => c.toLocaleUpperCase('pt-PT')) }
function formatDateTime(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' }).format(date) }
function formatTime(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(date) }
function matchesSearch(item: object, search: string) { if (!search.trim()) return true; const needle = search.trim().toLocaleLowerCase('pt-PT'); return Object.values(item).some((value) => typeof value === 'string' && value.toLocaleLowerCase('pt-PT').includes(needle)) }
