import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, LayoutDashboard, Inbox, CalendarDays, Settings, ChevronRight, ArrowUpRight, ClipboardList, UsersRound, CheckSquare2, Bell, BarChart3, LogOut } from 'lucide-react'
import { useApi, useCan, useSession } from '../providers/AppProviders'
import { SkipLink } from '../../design-system/patterns/navigation'

const publicLinks = [
  { to: '/servicos', label: 'Serviços' },
  { to: '/formacao', label: 'Formação' },
  { to: '/espacos', label: 'Espaços' },
  { to: '/contacto', label: 'Contacto' },
]

const operationLinks = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.read' as const },
  { to: '/app/pedidos', label: 'Pedidos', icon: Inbox, permission: 'request.read' as const },
  { to: '/app/reservas', label: 'Reservas', icon: ClipboardList, permission: 'booking.read' as const },
  { to: '/app/calendario', label: 'Calendário', icon: CalendarDays, permission: 'booking.read' as const },
  { to: '/app/clientes', label: 'Clientes', icon: UsersRound, permission: 'customer.read' as const },
  { to: '/app/tarefas', label: 'Tarefas', icon: CheckSquare2, permission: 'task.read' as const },
  { to: '/app/notificacoes', label: 'Notificações', icon: Bell, permission: 'notification.read' as const },
  { to: '/app/relatorios', label: 'Relatórios', icon: BarChart3, permission: 'report.read' as const },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings, permission: 'settings.read' as const },
]

function Brand({ inverse = false }: { inverse?: boolean }) {
  return <Link className={`brand-mark ${inverse ? 'brand-mark--inverse' : ''}`} to="/" aria-label="Castro’s Services — início"><span className="brand-mark__symbol" aria-hidden="true"><span className="brand-node brand-node--a" /><span className="brand-node brand-node--b" /><span className="brand-node brand-node--c" /></span><span className="brand-mark__wordmark"><strong>CASTRO’S</strong><small>SERVICES</small></span></Link>
}

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="public-layout public-v2-shell"><SkipLink /><header className="public-header"><div className="container public-header__inner"><Brand /><nav id="public-primary-navigation" className={`public-nav ${menuOpen ? 'public-nav--open' : ''}`} aria-label="Navegação principal">{publicLinks.map((link) => <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>{link.label}</NavLink>)}<Link className="button button--nav public-header__cta" to="/contacto" onClick={() => setMenuOpen(false)}>Falar connosco <ChevronRight size={16} /></Link></nav><button className="icon-button public-menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="public-primary-navigation">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div></header><main id="main-content" tabIndex={-1}><Outlet /></main><footer className="public-footer public-footer--v2"><div className="container public-footer__v2-grid"><div className="public-footer__brand-block"><Brand inverse /><p>Consultoria, formação e espaços reunidos numa experiência pensada para pessoas e organizações.</p></div><nav className="public-footer__nav" aria-label="Navegação do rodapé"><span className="public-footer__label">Explorar</span>{publicLinks.map((link) => <Link key={link.to} to={link.to}>{link.label}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}</nav><div className="public-footer__closing"><span className="public-footer__label">Castro’s Services</span><p>Atendimento ao Cliente · Ética e Liderança Organizacional · Palestras, Workshops e Formação · Treinamento Corporativo Personalizado.</p></div></div><div className="container public-footer__baseline"><span>Castro’s Services</span><span>Consultoria · Formação · Espaços</span></div></footer></div>
}

export function AuthLayout() { return <div className="auth-layout"><SkipLink /><header className="auth-layout__header"><Brand inverse /></header><main id="main-content" tabIndex={-1}><Outlet /></main></div> }

export function OperationsLayout() {
  const api = useApi(); const can = useCan(); const session = useSession(); const navigate = useNavigate(); const queryClient = useQueryClient()
  const [sidebarOpen, setSidebarOpen] = useState(false); const [loggingOut, setLoggingOut] = useState(false)
  const visibleLinks = operationLinks.filter((link) => can(link.permission))
  const logout = async () => { if (api.kind === 'mock') { navigate('/'); return } setLoggingOut(true); try { await api.auth.logout() } finally { queryClient.setQueryData(['auth','me'], null); queryClient.removeQueries({ queryKey: ['operations'] }); setLoggingOut(false); navigate('/login', { replace: true }) } }
  return <div className="operations-layout"><SkipLink /><aside id="operations-navigation-panel" className={`operations-sidebar ${sidebarOpen ? 'operations-sidebar--open' : ''}`}><div className="operations-sidebar__top"><Brand inverse /><button className="icon-button operations-close" type="button" onClick={() => setSidebarOpen(false)} aria-label="Fechar navegação"><X size={20} /></button></div><p className="operations-sidebar__label">CASTRO’S OPERATIONS</p><nav className="operations-nav" aria-label="Navegação de operações">{visibleLinks.length ? visibleLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}><Icon size={18} />{label}</NavLink>) : <span className="operations-nav__empty">Sem permissões atribuídas.</span>}</nav><div className="operations-sidebar__bottom"><Link to="/"><ChevronRight size={15} />Voltar ao site</Link><button type="button" onClick={logout} disabled={loggingOut}><LogOut size={15} />{loggingOut ? 'A sair…' : 'Terminar sessão'}</button></div></aside>{sidebarOpen && <button className="operations-scrim" type="button" onClick={() => setSidebarOpen(false)} aria-label="Fechar navegação" />}<div className="operations-main"><header className="operations-topbar"><button className="icon-button operations-menu" type="button" onClick={() => setSidebarOpen(true)} aria-label="Abrir navegação" aria-expanded={sidebarOpen} aria-controls="operations-navigation-panel"><Menu size={21} /></button><div><span>Área interna</span><strong>{session?.displayName || 'Secretária · Castro’s Services'}</strong></div><span className="topbar-account">Operações</span></header><main id="main-content" tabIndex={-1} className="operations-content"><Outlet /></main><nav className="mobile-bottom-nav" aria-label="Navegação rápida">{visibleLinks.slice(0, 4).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to}><Icon size={18} /><span>{label}</span></NavLink>)}</nav></div></div>
}
