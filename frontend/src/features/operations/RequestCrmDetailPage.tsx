import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarClock, CircleUserRound, ExternalLink, Target } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCan } from '../../app/providers/AppProviders'
import type { OperationsRequestItemDto, RequestOperationalStatus } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'
import { crmOperationsApi } from './crmOperationsApi'

export function RequestCrmDetailPage() {
  const { id } = useParams()
  const can = useCan()
  const queryClient = useQueryClient()
  const requestQuery = useQuery({ queryKey: ['crm', 'request', id], queryFn: () => crmOperationsApi.getRequest(id!), enabled: Boolean(id) && can('request.read') })
  const assigneesQuery = useQuery({ queryKey: ['crm', 'assignees'], queryFn: crmOperationsApi.listAssignees, enabled: can('request.assign') })
  const [ownerUserId, setOwnerUserId] = useState('')
  const [followUpAt, setFollowUpAt] = useState('')

  useEffect(() => {
    if (!requestQuery.data) return
    setOwnerUserId(requestQuery.data.ownerUserId ?? '')
    setFollowUpAt(toLocalInput(requestQuery.data.followUpAt))
  }, [requestQuery.data])

  const refresh = (data: OperationsRequestItemDto) => {
    queryClient.setQueryData(['crm', 'request', id], data)
    void queryClient.invalidateQueries({ queryKey: ['operations', 'requests'] })
    void queryClient.invalidateQueries({ queryKey: ['operations', 'customers'] })
    void queryClient.invalidateQueries({ queryKey: ['operations', 'summary'] })
  }

  const statusMutation = useMutation({
    mutationFn: (status: RequestOperationalStatus) => crmOperationsApi.updateStatus(id!, status),
    onSuccess: refresh,
  })
  const followUpMutation = useMutation({
    mutationFn: () => crmOperationsApi.updateFollowUp(id!, {
      ownerUserId: ownerUserId || null,
      followUpAt: followUpAt ? new Date(followUpAt).toISOString() : null,
    }),
    onSuccess: refresh,
  })

  if (requestQuery.isLoading) return <LoadingState label="A carregar contexto CRM." />
  if (requestQuery.isError || !requestQuery.data) return <ErrorState title="Não foi possível carregar este pedido." />
  const request = requestQuery.data
  const nextStatuses = allowedStatuses(request.status)
  const overdue = Boolean(request.followUpAt && new Date(request.followUpAt).getTime() < Date.now() && !['CLOSED', 'CANCELLED'].includes(request.status))

  return <section className="crm-detail">
    <Link className="crm-detail__back" to="/app/pedidos"><ArrowLeft size={16} /> Voltar aos pedidos</Link>
    <header className="crm-detail__hero">
      <div><span className="eyebrow">CRM · PEDIDO</span><h1>{fullName(request)}</h1><p>{request.message || 'Sem mensagem associada.'}</p></div>
      <div className="crm-detail__stage"><small>Lifecycle</small><strong>{lifecycleLabel(request.lifecycleStage)}</strong><span>{statusLabel(request.status)}</span></div>
    </header>

    <div className="crm-detail__grid">
      <main className="crm-detail__main">
        <section className="crm-panel">
          <div className="crm-panel__heading"><CircleUserRound size={19} /><div><span>CONTACTO</span><h2>Quem iniciou a conversa</h2></div></div>
          <dl className="crm-detail__facts">
            <Fact label="Nome" value={fullName(request)} />
            <Fact label="Email" value={request.email || '—'} />
            <Fact label="Telefone" value={request.phone || '—'} />
            <Fact label="Tipo de pedido" value={humanize(request.type)} />
            <Fact label="Recebido" value={formatDate(request.createdAt)} />
            <Fact label="Último contacto" value={request.lastContactAt ? formatDate(request.lastContactAt) : 'Ainda não registado'} />
          </dl>
        </section>

        <section className="crm-panel">
          <div className="crm-panel__heading"><Target size={19} /><div><span>INTENT CONTEXT</span><h2>De onde veio este interesse</h2></div></div>
          <dl className="crm-detail__facts">
            <Fact label="Origem" value={request.sourceType ? humanize(request.sourceType) : 'Geral'} />
            <Fact label="Interesse" value={request.sourceEntityName || 'Contacto geral'} />
            <Fact label="CTA" value={request.sourceCta ? humanize(request.sourceCta) : '—'} />
            <Fact label="Página de origem" value={request.sourcePath || '—'} />
            <Fact label="UTM source" value={request.utmSource || '—'} />
            <Fact label="Campanha" value={request.utmCampaign || '—'} />
          </dl>
          {request.referrer && <a className="crm-detail__referrer" href={request.referrer} target="_blank" rel="noreferrer">Abrir referência <ExternalLink size={14} /></a>}
        </section>
      </main>

      <aside className="crm-detail__aside">
        <section className="crm-panel crm-panel--action">
          <div className="crm-panel__heading"><CalendarClock size={19} /><div><span>FOLLOW-UP</span><h2>Próxima ação</h2></div></div>
          {overdue && <p className="crm-detail__alert">Follow-up vencido — requer atenção.</p>}
          <label><span>Responsável</span><select value={ownerUserId} onChange={(event) => setOwnerUserId(event.target.value)} disabled={!can('request.assign') || assigneesQuery.isLoading}><option value="">Sem responsável</option>{(assigneesQuery.data ?? []).map((person) => <option key={person.id} value={person.id}>{person.firstName} {person.lastName} · {person.experienceType === 'OWNER' ? 'CEO' : 'Operações'}</option>)}</select></label>
          <label><span>Data e hora</span><input type="datetime-local" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} disabled={!can('request.assign')} /></label>
          {can('request.assign') && <button className="ds-button ds-button--primary" type="button" onClick={() => followUpMutation.mutate()} disabled={followUpMutation.isPending}>{followUpMutation.isPending ? 'A guardar…' : 'Guardar follow-up'}</button>}
          {followUpMutation.isError && <p className="field-error" role="alert">Não foi possível guardar o follow-up.</p>}
        </section>

        <section className="crm-panel crm-panel--action">
          <div><span className="eyebrow">ESTADO COMERCIAL</span><h2>{statusLabel(request.status)}</h2></div>
          {can('request.update') && nextStatuses.length ? <div className="crm-detail__status-actions">{nextStatuses.map((status) => <button key={status} type="button" onClick={() => statusMutation.mutate(status)} disabled={statusMutation.isPending}>{statusLabel(status)}</button>)}</div> : <p>Sem transições disponíveis para este estado.</p>}
          <small>Qualificar promove o contacto para Qualified Lead. Converter promove-o para Customer.</small>
          {statusMutation.isError && <p className="field-error" role="alert">Não foi possível atualizar o estado.</p>}
        </section>
      </aside>
    </div>
  </section>
}

function Fact({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div> }
function fullName(item: OperationsRequestItemDto) { return [item.firstName, item.lastName].filter(Boolean).join(' ') || 'Contacto sem nome' }
function humanize(value: string) { return value.replaceAll('_', ' ').toLocaleLowerCase('pt-PT').replace(/^./, (letter) => letter.toUpperCase()) }
function statusLabel(value: RequestOperationalStatus) { return ({ NEW: 'Novo', CONTACTED: 'Contactado', QUALIFIED: 'Qualificado', WAITING_CUSTOMER: 'A aguardar cliente', CONVERTED: 'Convertido', CLOSED: 'Fechado', CANCELLED: 'Cancelado' } as const)[value] }
function lifecycleLabel(value?: OperationsRequestItemDto['lifecycleStage']) { return value ? humanize(value) : 'Lead' }
function formatDate(value: string) { return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }
function toLocalInput(value?: string | null) { if (!value) return ''; const date = new Date(value); if (Number.isNaN(date.getTime())) return ''; const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000); return local.toISOString().slice(0, 16) }
function allowedStatuses(current: RequestOperationalStatus): RequestOperationalStatus[] {
  if (current === 'NEW') return ['CONTACTED', 'CLOSED', 'CANCELLED']
  if (current === 'CONTACTED') return ['QUALIFIED', 'WAITING_CUSTOMER', 'CLOSED', 'CANCELLED']
  if (current === 'QUALIFIED') return ['WAITING_CUSTOMER', 'CONVERTED', 'CLOSED', 'CANCELLED']
  if (current === 'WAITING_CUSTOMER') return ['CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED', 'CANCELLED']
  if (current === 'CONVERTED') return ['CLOSED']
  return []
}
