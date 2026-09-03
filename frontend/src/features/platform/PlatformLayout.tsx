import { useQueryClient } from '@tanstack/react-query'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useApi, useSession } from '../../app/providers/AppProviders'

export function PlatformLayout() {
  const api = useApi()
  const session = useSession()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const logout = async () => {
    try { await api.auth.logout() } finally {
      queryClient.setQueryData(['auth', 'me'], null)
      navigate('/platform/login', { replace: true })
    }
  }

  return <div className="platform-shell">
    <aside className="platform-sidebar">
      <div className="platform-sidebar__identity"><span>RIGHTWARE</span><strong>Platform Control</strong></div>
      <nav aria-label="Navegação de plataforma">
        <Link className="is-active" to="/platform"><span>01</span>Overview</Link>
        <a href="#organizations"><span>02</span>Organizations</a>
        <a href="#audit"><span>03</span>Platform audit</a>
      </nav>
      <div className="platform-sidebar__footer">
        <div><span>AUTHORITY</span><strong>Super Admin</strong></div>
        <button type="button" onClick={logout}>Terminar sessão</button>
      </div>
    </aside>
    <div className="platform-workspace">
      <header className="platform-topbar">
        <div><span>CASTRO’S SERVICES</span><strong>Platform administration</strong></div>
        <div className="platform-topbar__account"><span>{session?.displayName || 'Platform administrator'}</span><small>{session?.username}</small></div>
      </header>
      <Outlet />
    </div>
  </div>
}
