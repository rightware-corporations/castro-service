import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X, LayoutDashboard, Inbox, CalendarDays, Settings, ChevronRight } from 'lucide-react'
import { useCan } from '../providers/AppProviders'

const publicLinks = [
  { to: '/servicos', label: 'Serviços' },
  { to: '/formacao', label: 'Formação' },
  { to: '/espacos', label: 'Espaço' },
  { to: '/contacto', label: 'Contacto' },
]

const operationLinks = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.read' as const },
  { to: '/app/pedidos', label: 'Pedidos', icon: Inbox, permission: 'request.read' as const },
  { to: '/app/reservas', label: 'Reservas', icon: CalendarDays, permission: 'booking.read' as const },
  { to: '/app/calendario', label: 'Calendário', icon: CalendarDays, permission: 'booking.read' as const },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings, permission: 'settings.read' as const },
]

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className={`brand-mark ${inverse ? 'brand-mark--inverse' : ''}`} to="/" aria-label="Castro’s Services — início">
      <span className="brand-mark__symbol" aria-hidden="true">◌</span>
      <span>
        <strong>CASTRO’S</strong>
        <small>SERVICES</small>
      </span>
    </Link>
  )
}

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="container public-header__inner">
          <Brand />
          <nav className={`public-nav ${menuOpen ? 'public-nav--open' : ''}`} aria-label="Navegação principal">
            {publicLinks.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>{link.label}</NavLink>
            ))}
            <Link className="button button--nav" to="/contacto" onClick={() => setMenuOpen(false)}>Falar connosco <ChevronRight size={16} /></Link>
          </nav>
          <button className="icon-button public-menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="public-footer">
        <div className="container public-footer__inner">
          <Brand inverse />
          <p>Conteúdo institucional e contactos reais serão ligados após validação de conteúdo.</p>
        </div>
      </footer>
    </div>
  )
}

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <header className="auth-layout__header"><Brand inverse /></header>
      <main><Outlet /></main>
    </div>
  )
}

export function OperationsLayout() {
  const can = useCan()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const visibleLinks = operationLinks.filter((link) => can(link.permission))

  return (
    <div className="operations-layout">
      <aside className={`operations-sidebar ${sidebarOpen ? 'operations-sidebar--open' : ''}`}>
        <div className="operations-sidebar__top"><Brand inverse /><button className="icon-button operations-close" type="button" onClick={() => setSidebarOpen(false)} aria-label="Fechar navegação"><X size={20} /></button></div>
        <p className="operations-sidebar__label">CASTRO’S OPERATIONS</p>
        <nav className="operations-nav" aria-label="Navegação de operações">
          {visibleLinks.length ? visibleLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}><Icon size={18} />{label}</NavLink>) : <span className="operations-nav__empty">Sem permissões atribuídas.</span>}
        </nav>
        <div className="operations-sidebar__bottom"><Link to="/"><ChevronRight size={15} />Voltar ao site</Link></div>
      </aside>
      {sidebarOpen && <button className="operations-scrim" type="button" onClick={() => setSidebarOpen(false)} aria-label="Fechar navegação" />}
      <div className="operations-main">
        <header className="operations-topbar"><button className="icon-button operations-menu" type="button" onClick={() => setSidebarOpen(true)} aria-label="Abrir navegação"><Menu size={21} /></button><div><span>Área interna</span><strong>Castro’s Services</strong></div><Link className="topbar-account" to="/app/configuracoes/utilizadores">Conta</Link></header>
        <main className="operations-content"><Outlet /></main>
        <nav className="mobile-bottom-nav" aria-label="Navegação rápida">{visibleLinks.slice(0, 4).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
      </div>
    </div>
  )
}
