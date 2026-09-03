import { useQuery } from '@tanstack/react-query'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'
import { platformApi } from './platformApi'

const formatDate = (value: string) => new Intl.DateTimeFormat('pt-MZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export function PlatformDashboardPage() {
  const overview = useQuery({ queryKey: ['platform', 'overview'], queryFn: platformApi.getOverview, staleTime: 30_000 })
  const organizations = useQuery({ queryKey: ['platform', 'organizations'], queryFn: platformApi.listOrganizations, staleTime: 30_000 })
  const audit = useQuery({ queryKey: ['platform', 'audit'], queryFn: platformApi.listAudit, staleTime: 15_000 })

  if (overview.isPending || organizations.isPending || audit.isPending) return <main className="platform-main"><LoadingState label="A carregar Platform Control." /></main>
  if (overview.isError || organizations.isError || audit.isError || !overview.data || !organizations.data || !audit.data) return <main className="platform-main"><ErrorState title="Não foi possível carregar a administração da plataforma." /></main>

  const data = overview.data
  return <main className="platform-main">
    <section className="platform-hero">
      <div><span className="platform-kicker">PLATFORM OVERVIEW</span><h1>Control plane</h1><p>Visão administrativa da infraestrutura lógica e das organizações servidas pela plataforma.</p></div>
      <div className="platform-hero__status"><span>DATABASE</span><strong className={data.databaseStatus === 'UP' ? 'is-up' : ''}>{data.databaseStatus}</strong><small>Atualizado {formatDate(data.generatedAt)}</small></div>
    </section>

    <section className="platform-metrics" aria-label="Métricas da plataforma">
      <article><span>ORGANIZATIONS</span><strong>{data.organizations}</strong><small>{data.activeOrganizations} ativas</small></article>
      <article><span>TENANT USERS</span><strong>{data.tenantUsers}</strong><small>{data.activeTenantUsers} ativos</small></article>
      <article><span>PLATFORM ADMINS</span><strong>{data.platformAdministrators}</strong><small>autoridade global</small></article>
      <article><span>BOUNDARY</span><strong>Isolated</strong><small>sem role dentro da Castro’s</small></article>
    </section>

    <section className="platform-panel" id="organizations">
      <header><div><span className="platform-kicker">ORGANIZATIONS</span><h2>Instâncias administradas</h2></div><span>{organizations.data.length} registadas</span></header>
      <div className="platform-org-table" role="table" aria-label="Organizações da plataforma">
        <div className="platform-org-table__row platform-org-table__head" role="row"><span>Organização</span><span>Estado</span><span>Utilizadores</span><span>Criada</span></div>
        {organizations.data.map((organization) => <div className="platform-org-table__row" role="row" key={organization.id}>
          <div><strong>{organization.name}</strong><small>{organization.slug}</small></div>
          <span className={organization.active ? 'platform-status is-active' : 'platform-status'}>{organization.active ? 'ACTIVE' : 'INACTIVE'}</span>
          <div><strong>{organization.tenantUsers}</strong><small>{organization.activeTenantUsers} ativos</small></div>
          <span>{formatDate(organization.createdAt)}</span>
        </div>)}
      </div>
    </section>

    <section className="platform-panel" id="audit">
      <header><div><span className="platform-kicker">PLATFORM AUDIT</span><h2>Atividade privilegiada</h2></div><span>últimos {audit.data.length}</span></header>
      <div className="platform-audit-list">
        {audit.data.length === 0 ? <p className="platform-empty">Ainda não existem eventos de plataforma.</p> : audit.data.map((event) => <article key={event.id}>
          <div className="platform-audit-list__index" aria-hidden="true">•</div>
          <div><strong>{event.action.replaceAll('_', ' ')}</strong><span>{event.entityType}</span>{event.details && <p>{event.details}</p>}</div>
          <div><strong>{event.actorEmail || 'system'}</strong><small>{formatDate(event.createdAt)}</small></div>
        </article>)}
      </div>
    </section>

    <section className="platform-security-note">
      <span>SECURITY MODEL</span>
      <p>O Super Admin administra a plataforma através de uma identidade própria. A sessão não recebe permissões operacionais da organização e não é membro da Castro’s Services.</p>
    </section>
  </main>
}
