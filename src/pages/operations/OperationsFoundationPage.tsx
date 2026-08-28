import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CalendarDays, ClipboardList, Filter, Inbox, LayoutDashboard, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, UsersRound } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'

const modules = [
  { to: '/app/pedidos', label: 'Pedidos', description: 'Triagem e acompanhamento de contactos recebidos.', icon: Inbox, permission: 'request.read' as const },
  { to: '/app/reservas', label: 'Reservas', description: 'Operação de reservas, estado e contexto do cliente.', icon: ClipboardList, permission: 'booking.read' as const },
  { to: '/app/calendario', label: 'Calendário', description: 'Leitura temporal de reservas, disponibilidade e bloqueios.', icon: CalendarDays, permission: 'booking.read' as const },
  { to: '/app/configuracoes', label: 'Configurações', description: 'Catálogo, disponibilidade, conteúdos e acessos.', icon: Settings, permission: 'settings.read' as const },
]

const pageMeta: Record<string, { eyebrow: string; title: string; description: string }> = {
  '/app/dashboard': { eyebrow: 'VISÃO GERAL', title: 'Dashboard', description: 'Ponto de entrada para o trabalho operacional da Castro’s.' },
  '/app/pedidos': { eyebrow: 'RELAÇÃO COM CLIENTES', title: 'Pedidos', description: 'Triagem, atribuição e acompanhamento de pedidos recebidos.' },
  '/app/reservas': { eyebrow: 'OPERAÇÃO', title: 'Reservas', description: 'Acompanhe reservas e o respetivo estado num único workspace.' },
  '/app/calendario': { eyebrow: 'PLANEAMENTO', title: 'Calendário', description: 'Visão temporal para reservas, disponibilidade e bloqueios.' },
  '/app/configuracoes': { eyebrow: 'ADMINISTRAÇÃO', title: 'Configurações', description: 'Estrutura para gerir catálogo, disponibilidade, conteúdos e acessos.' },
}

export function OperationsFoundationPage() {
  const { pathname } = useLocation()
  const can = useCan()
  const api = useApi()
  const meta = pageMeta[pathname] ?? (pathname.startsWith('/app/configuracoes') ? pageMeta['/app/configuracoes'] : { eyebrow: 'CASTRO’S OPERATIONS', title: 'Área operacional', description: 'Módulo preparado para evolução funcional.' })
  const visibleModules = modules.filter((module) => can(module.permission))

  return (
    <section className="ops-v2">
      <header className="ops-v2__hero">
        <div>
          <span className="eyebrow">{meta.eyebrow}</span>
          <h1>{meta.title}</h1>
          <p>{meta.description}</p>
        </div>
        <div className="ops-v2__environment" aria-label="Estado do ambiente">
          <span className={api.kind === 'mock' ? 'is-development' : 'is-connected'} />
          <div><small>Dados</small><strong>{api.kind === 'mock' ? 'Modo de desenvolvimento' : 'Backend ligado'}</strong></div>
        </div>
      </header>

      {pathname === '/app/dashboard' && <Dashboard visibleModules={visibleModules} />}
      {pathname === '/app/pedidos' && <RequestsWorkspace />}
      {pathname === '/app/reservas' && <BookingsWorkspace />}
      {pathname === '/app/calendario' && <CalendarWorkspace />}
      {pathname.startsWith('/app/configuracoes') && <SettingsWorkspace pathname={pathname} />}
      {!pageMeta[pathname] && !pathname.startsWith('/app/configuracoes') && <OperationalEmptyState />}
    </section>
  )
}

function Dashboard({ visibleModules }: { visibleModules: typeof modules }) {
  return <>
    <section className="ops-v2__status-grid" aria-label="Estado operacional">
      <article><span>01</span><div><small>Pedidos</small><strong>Workspace preparado</strong><p>Triagem e acompanhamento sem métricas inventadas.</p></div></article>
      <article><span>02</span><div><small>Reservas</small><strong>Fluxo público ligado</strong><p>Availability, CSRF e idempotência já fazem parte do caminho público.</p></div></article>
      <article><span>03</span><div><small>Agenda</small><strong>Vista operacional pronta</strong><p>O calendário já tem estrutura para receber reservas e bloqueios reais.</p></div></article>
    </section>

    <section className="ops-v2__modules">
      <div className="ops-v2__section-heading"><div><span className="eyebrow">WORKSPACE</span><h2>Áreas de trabalho</h2></div><p>Entradas principais da operação, sem dados fictícios.</p></div>
      <div className="ops-v2__module-grid">{visibleModules.map(({ to, label, description, icon: Icon }) => <Link key={to} to={to}><span className="ops-v2__module-icon"><Icon size={20} /></span><div><strong>{label}</strong><p>{description}</p></div><ArrowRight size={18} /></Link>)}</div>
    </section>
  </>
}

function RequestsWorkspace() {
  const can = useCan()
  return <section className="ops-workspace">
    <WorkspaceToolbar searchPlaceholder="Pesquisar por nome, email ou referência" action={can('request.create') ? <button type="button" className="ds-button ds-button--primary"><Plus size={16} /> Novo pedido</button> : undefined} />
    <div className="ops-workspace__tabs" role="tablist" aria-label="Estado dos pedidos">
      <button type="button" role="tab" aria-selected="true">Todos</button><button type="button" role="tab">Novos</button><button type="button" role="tab">Em acompanhamento</button><button type="button" role="tab">Fechados</button>
    </div>
    <div className="ops-workspace__table-shell">
      <div className="ops-workspace__table-head" aria-hidden="true"><span>Cliente</span><span>Tipo</span><span>Responsável</span><span>Estado</span><span>Recebido</span></div>
      <OperationalCollectionEmpty icon={Inbox} title="Ainda não existem pedidos para mostrar." description="Quando o backend operacional expuser pedidos autenticados, esta vista receberá pesquisa, filtros, estado e atribuição sem mudar a composição." />
    </div>
  </section>
}

function BookingsWorkspace() {
  const can = useCan()
  return <section className="ops-workspace">
    <WorkspaceToolbar searchPlaceholder="Pesquisar por referência ou cliente" action={can('booking.create') ? <button type="button" className="ds-button ds-button--primary"><Plus size={16} /> Nova reserva</button> : undefined} />
    <div className="ops-workspace__summary-strip">
      <span><small>Hoje</small><strong>—</strong></span><span><small>Pendentes</small><strong>—</strong></span><span><small>Confirmadas</small><strong>—</strong></span><span><small>Canceladas</small><strong>—</strong></span>
    </div>
    <div className="ops-workspace__table-shell">
      <div className="ops-workspace__table-head ops-workspace__table-head--bookings" aria-hidden="true"><span>Referência</span><span>Cliente</span><span>Reserva</span><span>Data</span><span>Estado</span></div>
      <OperationalCollectionEmpty icon={ClipboardList} title="Sem reservas operacionais ligadas." description="O fluxo público já cria reservas reais; falta apenas o contrato autenticado para listar e gerir essas reservas nesta área interna." />
    </div>
  </section>
}

function CalendarWorkspace() {
  return <section className="ops-workspace">
    <div className="ops-calendar-toolbar"><div className="ops-calendar-toolbar__nav"><button type="button" aria-label="Período anterior">‹</button><button type="button">Hoje</button><button type="button" aria-label="Período seguinte">›</button></div><strong>Agenda operacional</strong><div className="ops-calendar-toolbar__views"><button type="button">Dia</button><button type="button">Semana</button><button type="button" className="is-active">Mês</button></div></div>
    <div className="ops-calendar-grid" aria-label="Calendário mensal sem dados operacionais">
      {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((day) => <div className="ops-calendar-grid__weekday" key={day}>{day}</div>)}
      {Array.from({ length: 35 }, (_, index) => <div className="ops-calendar-grid__day" key={index}><span>{index + 1 <= 31 ? index + 1 : ''}</span></div>)}
    </div>
    <p className="ops-calendar-note"><ShieldCheck size={16} /> Nenhum evento é simulado. Reservas e bloqueios aparecerão quando o endpoint interno autenticado estiver disponível.</p>
  </section>
}

function SettingsWorkspace({ pathname }: { pathname: string }) {
  const items = [
    { to: '/app/configuracoes/servicos', label: 'Serviços', description: 'Catálogo e disponibilidade de reserva.' },
    { to: '/app/configuracoes/formacao', label: 'Formação', description: 'Cursos e sessões.' },
    { to: '/app/configuracoes/espacos', label: 'Espaços', description: 'Informação, media e publicação.' },
    { to: '/app/configuracoes/disponibilidade', label: 'Disponibilidade', description: 'Regras, exceções e bloqueios.' },
    { to: '/app/configuracoes/conteudo', label: 'Conteúdo', description: 'Conteúdo público e institucional.' },
    { to: '/app/configuracoes/utilizadores', label: 'Utilizadores', description: 'Contas internas.' },
    { to: '/app/configuracoes/funcoes', label: 'Funções', description: 'Papéis e responsabilidades.' },
    { to: '/app/configuracoes/permissoes', label: 'Permissões', description: 'Matriz de autorização.' },
  ]
  const active = items.find((item) => item.to === pathname)
  return <section className="ops-settings">
    <aside className="ops-settings__nav"><span className="eyebrow">CONFIGURAÇÃO</span>{items.map((item) => <Link key={item.to} to={item.to} className={pathname === item.to ? 'is-active' : ''}><strong>{item.label}</strong><small>{item.description}</small></Link>)}</aside>
    <div className="ops-settings__panel"><span className="ops-v2__empty-icon"><SlidersHorizontal size={23} /></span><span className="eyebrow">{active?.label ?? 'ADMINISTRAÇÃO'}</span><h2>{active ? `${active.label} preparado para gestão.` : 'Selecione uma área de configuração.'}</h2><p>{active ? 'A composição está pronta para receber formulários e listas reais. As ações de escrita só serão ligadas quando autorização e endpoints internos estiverem fechados.' : 'A administração está organizada por domínio para evitar um painel genérico e difícil de manter.'}</p></div>
  </section>
}

function WorkspaceToolbar({ searchPlaceholder, action }: { searchPlaceholder: string; action?: React.ReactNode }) {
  return <div className="ops-workspace__toolbar"><label className="ops-workspace__search"><Search size={17} aria-hidden="true" /><span className="visually-hidden">Pesquisar</span><input type="search" placeholder={searchPlaceholder} /></label><button type="button" className="ds-button ds-button--secondary"><Filter size={16} /> Filtros</button>{action}</div>
}

function OperationalCollectionEmpty({ icon: Icon, title, description }: { icon: typeof Inbox; title: string; description: string }) {
  return <div className="ops-collection-empty"><span><Icon size={23} /></span><h2>{title}</h2><p>{description}</p></div>
}

function OperationalEmptyState() {
  return <section className="ops-v2__workspace"><div className="ops-v2__workspace-rail" aria-hidden="true"><span>01</span><span>02</span><span>03</span></div><div className="ops-v2__workspace-main"><div className="ops-v2__empty-icon"><ShieldCheck size={24} /></div><span className="eyebrow">CONTRATO INTERNO PENDENTE</span><h2>O módulo está pronto para receber dados reais.</h2><p>Não apresentamos dados simulados como operação real. O próximo passo é expor endpoints internos autenticados e ligá-los a esta área.</p><div className="ops-v2__empty-actions"><Link className="ds-button ds-button--primary" to="/app/dashboard">Voltar ao dashboard <LayoutDashboard size={16} /></Link></div></div></section>
}
