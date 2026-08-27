import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { useCan } from '../../app/providers/AppProviders'

export function OperationsFoundationPage() {
  const { pathname } = useLocation()
  const can = useCan()
  const canReadSettings = can('settings.read')
  const title = pathname === '/app/dashboard' ? 'Dashboard' : pathname.startsWith('/app/configuracoes') ? 'Configurações' : 'Área operacional'

  return (
    <section className="operations-foundation">
      <div className="operations-foundation__header">
        <div><span className="eyebrow">CASTRO’S OPERATIONS · FOUNDATION</span><h1>{title}</h1><p>O shell interno está pronto. As áreas de operações e administração serão ligadas às features e contratos aprovados.</p></div>
        {canReadSettings && <Link className="button button--primary" to="/app/configuracoes">Abrir configurações <ArrowRight size={16} /></Link>}
      </div>
      <div className="operations-foundation__notice" role="status">
        <LockKeyhole size={20} aria-hidden="true" />
        <div><strong>Sem dados operacionais ligados</strong><span>Não são apresentados métricas, reservas, clientes ou conteúdos fictícios nesta fase.</span></div>
      </div>
    </section>
  )
}
