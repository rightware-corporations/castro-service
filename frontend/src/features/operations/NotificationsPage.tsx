import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Circle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApi, useCan } from '../../app/providers/AppProviders'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

export function NotificationsPage() {
  const api = useApi()
  const can = useCan()
  const queryClient = useQueryClient()
  const notifications = useQuery({ queryKey: ['operations', 'notifications'], queryFn: () => api.operations.listNotifications(), enabled: can('notification.read') })
  const unread = useMemo(() => (notifications.data?.items ?? []).filter((item) => !item.readAt).length, [notifications.data])

  const markRead = useMutation({
    mutationFn: (id: string) => api.operations.markNotificationRead(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['operations', 'notifications'] }),
  })
  const markAll = useMutation({
    mutationFn: () => api.operations.markAllNotificationsRead(),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['operations', 'notifications'] }),
  })

  return <section className="catalog-admin">
    <header className="ops-v2__hero"><div><span className="eyebrow">OPERAÇÕES</span><h1>Notificações</h1><p>Eventos internos dirigidos ao utilizador autenticado.</p></div>{unread > 0 && <button className="button button--secondary" type="button" onClick={() => markAll.mutate()} disabled={markAll.isPending}><CheckCheck size={16}/>{markAll.isPending ? 'A atualizar…' : 'Marcar todas como lidas'}</button>}</header>
    <section className="catalog-admin__summary">
      <article><small>Total</small><strong>{notifications.data?.total ?? '—'}</strong></article>
      <article><small>Não lidas</small><strong>{unread}</strong></article>
      <article><small>Lidas</small><strong>{Math.max((notifications.data?.total ?? 0) - unread, 0)}</strong></article>
      <article><small>Fonte</small><strong>Eventos internos</strong></article>
    </section>
    {notifications.isLoading ? <LoadingState label="A carregar notificações." /> : notifications.isError ? <ErrorState title="Não foi possível carregar as notificações." /> : <div className="catalog-admin__list">
      {(notifications.data?.items ?? []).length ? notifications.data!.items.map((item) => <article className={`catalog-admin__row ${item.readAt ? 'is-inactive' : ''}`} key={item.id}>
        <div className="catalog-admin__row-order">{item.readAt ? <Bell size={18}/> : <Circle size={12} fill="currentColor"/>}</div>
        <div className="catalog-admin__row-copy"><div className="catalog-admin__row-title"><strong>{item.title}</strong></div><p>{item.body || 'Sem detalhe adicional.'}</p><small>{formatDate(item.createdAt)}{item.type ? ` · ${typeLabel(item.type)}` : ''}</small>{item.resourceType === 'TASK' && <div><Link to="/app/tarefas">Abrir tarefas</Link></div>}</div>
        <div className="catalog-admin__statuses"><span className={`catalog-admin__status ${item.readAt ? '' : 'is-on'}`}><span/>{item.readAt ? 'Lida' : 'Nova'}</span></div>
        <div className="catalog-admin__actions">{!item.readAt && <button type="button" onClick={() => markRead.mutate(item.id)} disabled={markRead.isPending} aria-label="Marcar como lida"><CheckCheck size={16}/></button>}</div>
      </article>) : <div className="catalog-admin__empty"><Bell size={22}/><h3>Sem notificações.</h3><p>Novos eventos internos aparecerão aqui quando forem gerados pelo sistema.</p></div>}
    </div>}
  </section>
}

function formatDate(value: string) { return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) }
function typeLabel(type: string) { return type === 'TASK_ASSIGNED' ? 'Tarefa atribuída' : type }
