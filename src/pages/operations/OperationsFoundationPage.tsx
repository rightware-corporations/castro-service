import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CalendarDays, ClipboardList, Inbox, LayoutDashboard, Settings, ShieldCheck } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'

const modules = [
  { to: '/app/pedidos', label: 'Pedidos', description: 'Acompanhar contactos e pedidos recebidos.', icon: Inbox, permission: 'request.read' as const },
  { to: '/app/reservas', label: 'Reservas', description: 'Consultar e gerir reservas quando o contrato operacional estiver disponível.', icon: ClipboardList, permission: 'booking.read' as const },
  { to: '/app/calendario', label: 'Calendário', description: 'Visualização temporal preparada para reservas e bloqueios.', icon: CalendarDays, permission: 'booking.read' as const },
  { to: '/app/configuracoes', label: 'Configurações', description: 'Serviços, formação, espaços, disponibilidade e acesso.', icon: Settings, permission: 'settings.read' as const },
]

const pageMeta: Record<string, { eyebrow: string; title: string; description: string }> = {
  '/app/dashboard': { eyebrow: 'VISÃO GERAL', title: 'Dashboard', description: 'Ponto de entrada para o trabalho operacional da Castro’s.' },
  '/app/pedidos': { eyebrow: 'RELAÇÃO COM CLIENTES', title: 'Pedidos', description: 'Área preparada para triagem, atribuição e acompanhamento de pedidos.' },
  '/app/reservas': { eyebrow: 'OPERAÇÃO', title: 'Reservas', description: 'Área preparada para acompanhar reservas e respetivo estado.' },
  '/app/calendario': { eyebrow: 'PLANEAMENTO', title: 'Calendário', description: 'Visão temporal preparada para disponibilidade, reservas e bloqueios.' },
  '/app/configuracoes': { eyebrow: 'ADMINISTRAÇÃO', title: 'Configurações', description: 'Estrutura para gerir catálogo, disponibilidade, conteúdos e acessos.' },
}

export function OperationsFoundationPage() {
  const { pathname } = useLocation()
  const can = useCan()
  const api = useApi()
  const meta = pageMeta[pathname] ?? (pathname.startsWith('/app/configuracoes') ? pageMeta['/app/configuracoes'] : { eyebrow: 'CASTRO’S OPERATIONS', title: 'Área operacional', description: 'Módulo preparado para evolução funcional.' })
  const visibleModules = modules.filter((module) => can(module.permission))
  const isDashboard = pathname === '/app/dashboard'

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

      {isDashboard ? <>
        <section className="ops-v2__status-grid" aria-label="Estado operacional">
          <article><span>01</span><div><small>Pedidos</small><strong>Sem métricas publicadas</strong><p>O dashboard não fabrica contagens antes de existirem endpoints operacionais.</p></div></article>
          <article><span>02</span><div><small>Reservas</small><strong>Fluxo público ligado</strong><p>A criação pública já utiliza availability, CSRF e idempotência.</p></div></article>
          <article><span>03</span><div><small>Agenda</small><strong>Estrutura preparada</strong><p>A calendarização operacional será ligada aos contratos internos.</p></div></article>
        </section>

        <section className="ops-v2__modules">
          <div className="ops-v2__section-heading"><div><span className="eyebrow">WORKSPACE</span><h2>Áreas de trabalho</h2></div><p>Entradas principais da operação, sem dados fictícios.</p></div>
          <div className="ops-v2__module-grid">{visibleModules.map(({ to, label, description, icon: Icon }) => <Link key={to} to={to}><span className="ops-v2__module-icon"><Icon size={20} /></span><div><strong>{label}</strong><p>{description}</p></div><ArrowRight size={18} /></Link>)}</div>
        </section>
      </> : <OperationalEmptyState pathname={pathname} />}
    </section>
  )
}

function OperationalEmptyState({ pathname }: { pathname: string }) {
  const can = useCan()
  const settings = pathname.startsWith('/app/configuracoes')
  return <section className="ops-v2__workspace">
    <div className="ops-v2__workspace-rail" aria-hidden="true"><span>01</span><span>02</span><span>03</span></div>
    <div className="ops-v2__workspace-main">
      <div className="ops-v2__empty-icon"><ShieldCheck size={24} /></div>
      <span className="eyebrow">CONTRATO INTERNO PENDENTE</span>
      <h2>{settings ? 'Administração preparada sem inventar dados.' : 'O módulo está pronto para receber dados reais.'}</h2>
      <p>{settings ? 'A estrutura de administração existe, mas as ações de catálogo, utilizadores, permissões e disponibilidade só serão ligadas quando a autorização backend estiver fechada.' : 'Não apresentamos pedidos, reservas, clientes ou estados simulados como se fossem operação real. O próximo passo é expor endpoints internos autenticados e ligá-los a esta área.'}</p>
      <div className="ops-v2__empty-actions">
        <Link className="ds-button ds-button--primary" to="/app/dashboard">Voltar ao dashboard <LayoutDashboard size={16} /></Link>
        {can('settings.read') && !settings ? <Link className="ds-button ds-button--secondary" to="/app/configuracoes">Ver configurações <Settings size={16} /></Link> : null}
      </div>
    </div>
  </section>
}
