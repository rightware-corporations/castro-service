import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarOff, Clock3, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import type { AvailabilityExceptionInputDto, AvailabilityRuleInputDto, BlockedPeriodInputDto, BookableType } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const
const dayLabels: Record<(typeof days)[number], string> = {
  MONDAY: 'Segunda-feira', TUESDAY: 'Terça-feira', WEDNESDAY: 'Quarta-feira', THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira', SATURDAY: 'Sábado', SUNDAY: 'Domingo',
}

const initialRule: AvailabilityRuleInputDto = {
  bookableType: 'SPACE', bookableId: '', dayOfWeek: 'MONDAY', opensAt: '08:00', closesAt: '17:00', slotIntervalMinutes: 30,
  bufferBeforeMinutes: 0, bufferAfterMinutes: 0, minimumNoticeMinutes: 0, maximumAdvanceDays: 90, active: true,
}
const initialException: AvailabilityExceptionInputDto = { bookableType: 'SPACE', bookableId: '', date: '', closed: true, opensAt: null, closesAt: null }
const initialBlocked: BlockedPeriodInputDto = { bookableType: 'SPACE', bookableId: '', startAt: '', endAt: '', reason: '' }

export function AvailabilitySettingsPage() {
  const api = useApi()
  const can = useCan()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<AvailabilityRuleInputDto>(initialRule)
  const [exceptionDraft, setExceptionDraft] = useState<AvailabilityExceptionInputDto>(initialException)
  const [blockedDraft, setBlockedDraft] = useState<BlockedPeriodInputDto>(initialBlocked)

  const rules = useQuery({ queryKey: ['operations', 'availability', 'rules'], queryFn: () => api.operations.listAvailabilityRules(), enabled: can('availability.read') })
  const exceptions = useQuery({ queryKey: ['operations', 'availability', 'exceptions'], queryFn: () => api.operations.listAvailabilityExceptions(), enabled: can('availability.read') })
  const blocked = useQuery({ queryKey: ['operations', 'availability', 'blocked'], queryFn: () => api.operations.listBlockedPeriods(), enabled: can('availability.read') })

  const createRule = useMutation({ mutationFn: () => api.operations.createAvailabilityRule(draft), onSuccess: () => { setDraft(initialRule); void queryClient.invalidateQueries({ queryKey: ['operations', 'availability', 'rules'] }) } })
  const deleteRule = useMutation({ mutationFn: (id: string) => api.operations.deleteAvailabilityRule(id), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['operations', 'availability', 'rules'] }) })
  const createException = useMutation({ mutationFn: () => api.operations.createAvailabilityException(exceptionDraft), onSuccess: () => { setExceptionDraft(initialException); void queryClient.invalidateQueries({ queryKey: ['operations', 'availability', 'exceptions'] }) } })
  const deleteException = useMutation({ mutationFn: (id: string) => api.operations.deleteAvailabilityException(id), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['operations', 'availability', 'exceptions'] }) })
  const createBlocked = useMutation({ mutationFn: () => api.operations.createBlockedPeriod(blockedDraft), onSuccess: () => { setBlockedDraft(initialBlocked); void queryClient.invalidateQueries({ queryKey: ['operations', 'availability', 'blocked'] }) } })
  const deleteBlocked = useMutation({ mutationFn: (id: string) => api.operations.deleteBlockedPeriod(id), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['operations', 'availability', 'blocked'] }) })

  const resourceLabel = useMemo(() => labelForResource(draft.bookableType), [draft.bookableType])
  const valid = Boolean(draft.bookableId && draft.opensAt < draft.closesAt && draft.slotIntervalMinutes > 0 && draft.maximumAdvanceDays > 0)
  const exceptionValid = Boolean(exceptionDraft.bookableId && exceptionDraft.date && (exceptionDraft.closed || (exceptionDraft.opensAt && exceptionDraft.closesAt && exceptionDraft.opensAt < exceptionDraft.closesAt)))
  const blockedValid = Boolean(blockedDraft.bookableId && blockedDraft.startAt && blockedDraft.endAt && blockedDraft.startAt < blockedDraft.endAt)

  return <section className="ops-v2 availability-admin">
    <header className="ops-v2__hero"><div><span className="eyebrow">ADMINISTRAÇÃO · DISPONIBILIDADE</span><h1>Disponibilidade</h1><p>Regras semanais, exceções e períodos bloqueados com isolamento por organização.</p></div><div className="ops-v2__environment"><span className="is-connected" /><div><small>Contrato</small><strong>Backend protegido</strong></div></div></header>

    <section className="availability-admin__summary" aria-label="Resumo da disponibilidade">
      <article><small>Regras</small><strong>{rules.data?.total ?? '—'}</strong></article>
      <article><small>Exceções</small><strong>{exceptions.data?.total ?? '—'}</strong></article>
      <article><small>Bloqueios</small><strong>{blocked.data?.total ?? '—'}</strong></article>
    </section>

    <section className="availability-admin__layout">
      <div className="availability-admin__main">
        <div className="ops-v2__section-heading"><div><span className="eyebrow">REGRAS SEMANAIS</span><h2>Horários publicados</h2></div><p>Sem regra configurada, o sistema não fabrica horários disponíveis.</p></div>
        {rules.isLoading ? <LoadingState label="A carregar regras de disponibilidade." /> : rules.isError ? <ErrorState title="Não foi possível carregar as regras." /> : <div className="availability-admin__rules">{rules.data?.items.length ? rules.data.items.map((rule) => <article key={rule.id} className="availability-rule-row"><span className="availability-rule-row__day">{dayLabels[rule.dayOfWeek as keyof typeof dayLabels] ?? rule.dayOfWeek}</span><div><strong>{rule.opensAt.slice(0, 5)} — {rule.closesAt.slice(0, 5)}</strong><small>{humanizeType(rule.bookableType)} · {rule.bookableId}</small></div><div><span>{rule.slotIntervalMinutes} min</span><small>intervalo</small></div><div><span>{rule.maximumAdvanceDays} dias</span><small>antecedência máx.</small></div>{can('availability.manage') ? <button type="button" className="availability-rule-row__delete" aria-label="Eliminar regra" disabled={deleteRule.isPending} onClick={() => deleteRule.mutate(rule.id)}><Trash2 size={16} /></button> : null}</article>) : <AvailabilityEmpty icon={ShieldCheck} title="Sem regras configuradas." description="Enquanto não existirem regras, a disponibilidade pública permanece vazia." />}</div>}
      </div>

      <aside className="availability-admin__form-panel">
        <span className="eyebrow">NOVA REGRA</span><h2>Definir horário</h2><p>Associe a regra a um recurso real já existente no catálogo.</p>
        <div className="availability-admin__form">
          <BookableFields type={draft.bookableType} id={draft.bookableId} onType={(bookableType) => setDraft((current) => ({ ...current, bookableType, bookableId: '' }))} onId={(bookableId) => setDraft((current) => ({ ...current, bookableId }))} resourceLabel={resourceLabel} />
          <label><span>Dia</span><select value={draft.dayOfWeek} onChange={(event) => setDraft((current) => ({ ...current, dayOfWeek: event.target.value }))}>{days.map((day) => <option key={day} value={day}>{dayLabels[day]}</option>)}</select></label>
          <div className="availability-admin__two"><label><span>Abre</span><input type="time" value={draft.opensAt} onChange={(event) => setDraft((current) => ({ ...current, opensAt: event.target.value }))} /></label><label><span>Fecha</span><input type="time" value={draft.closesAt} onChange={(event) => setDraft((current) => ({ ...current, closesAt: event.target.value }))} /></label></div>
          <div className="availability-admin__two"><label><span>Intervalo (min)</span><input type="number" min="1" value={draft.slotIntervalMinutes} onChange={(event) => setDraft((current) => ({ ...current, slotIntervalMinutes: Number(event.target.value) }))} /></label><label><span>Máx. antecedência (dias)</span><input type="number" min="1" value={draft.maximumAdvanceDays} onChange={(event) => setDraft((current) => ({ ...current, maximumAdvanceDays: Number(event.target.value) }))} /></label></div>
          <div className="availability-admin__two"><label><span>Buffer antes</span><input type="number" min="0" value={draft.bufferBeforeMinutes} onChange={(event) => setDraft((current) => ({ ...current, bufferBeforeMinutes: Number(event.target.value) }))} /></label><label><span>Buffer depois</span><input type="number" min="0" value={draft.bufferAfterMinutes} onChange={(event) => setDraft((current) => ({ ...current, bufferAfterMinutes: Number(event.target.value) }))} /></label></div>
          <label><span>Aviso mínimo (min)</span><input type="number" min="0" value={draft.minimumNoticeMinutes} onChange={(event) => setDraft((current) => ({ ...current, minimumNoticeMinutes: Number(event.target.value) }))} /></label>
          <label className="availability-admin__check"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))} /><span>Regra ativa</span></label>
          {createRule.isError ? <p className="field-error" role="alert">Não foi possível guardar a regra. Confirme o recurso e os horários.</p> : null}
          <button type="button" className="ds-button ds-button--primary" disabled={!can('availability.manage') || !valid || createRule.isPending} onClick={() => createRule.mutate()}><Plus size={16} /> {createRule.isPending ? 'A guardar…' : 'Adicionar regra'}</button>
        </div>
      </aside>
    </section>

    <section className="availability-admin__editors">
      <article className="availability-admin__editor-card">
        <div className="availability-admin__editor-heading"><span><CalendarOff size={20} /></span><div><span className="eyebrow">EXCEÇÕES</span><h2>Dias especiais</h2><p>Feche um dia ou publique um horário extraordinário para um recurso.</p></div></div>
        <div className="availability-admin__form">
          <BookableFields type={exceptionDraft.bookableType} id={exceptionDraft.bookableId} onType={(bookableType) => setExceptionDraft((current) => ({ ...current, bookableType, bookableId: '' }))} onId={(bookableId) => setExceptionDraft((current) => ({ ...current, bookableId }))} resourceLabel={labelForResource(exceptionDraft.bookableType)} />
          <label><span>Data</span><input type="date" value={exceptionDraft.date} onChange={(event) => setExceptionDraft((current) => ({ ...current, date: event.target.value }))} /></label>
          <label className="availability-admin__check"><input type="checkbox" checked={exceptionDraft.closed} onChange={(event) => setExceptionDraft((current) => ({ ...current, closed: event.target.checked, opensAt: event.target.checked ? null : current.opensAt, closesAt: event.target.checked ? null : current.closesAt }))} /><span>Dia fechado</span></label>
          {!exceptionDraft.closed && <div className="availability-admin__two"><label><span>Abre</span><input type="time" value={exceptionDraft.opensAt ?? ''} onChange={(event) => setExceptionDraft((current) => ({ ...current, opensAt: event.target.value }))} /></label><label><span>Fecha</span><input type="time" value={exceptionDraft.closesAt ?? ''} onChange={(event) => setExceptionDraft((current) => ({ ...current, closesAt: event.target.value }))} /></label></div>}
          {createException.isError && <p className="field-error" role="alert">Não foi possível guardar a exceção.</p>}
          <button type="button" className="ds-button ds-button--primary" disabled={!can('availability.manage') || !exceptionValid || createException.isPending} onClick={() => createException.mutate()}><Plus size={16} /> {createException.isPending ? 'A guardar…' : 'Adicionar exceção'}</button>
        </div>
        <AvailabilityRecords loading={exceptions.isLoading} error={exceptions.isError} empty="Sem exceções configuradas.">
          {exceptions.data?.items.map((item) => <article className="availability-admin__record" key={item.id}><div><strong>{formatDate(item.date)}</strong><small>{humanizeType(item.bookableType)} · {item.bookableId}</small></div><span>{item.closed ? 'Fechado' : `${item.opensAt?.slice(0, 5)} — ${item.closesAt?.slice(0, 5)}`}</span>{can('availability.manage') && <button type="button" aria-label="Eliminar exceção" disabled={deleteException.isPending} onClick={() => deleteException.mutate(item.id)}><Trash2 size={15} /></button>}</article>)}
        </AvailabilityRecords>
      </article>

      <article className="availability-admin__editor-card">
        <div className="availability-admin__editor-heading"><span><Clock3 size={20} /></span><div><span className="eyebrow">PERÍODOS BLOQUEADOS</span><h2>Bloquear intervalo</h2><p>Impeça reservas num período específico, independentemente das regras semanais.</p></div></div>
        <div className="availability-admin__form">
          <BookableFields type={blockedDraft.bookableType} id={blockedDraft.bookableId} onType={(bookableType) => setBlockedDraft((current) => ({ ...current, bookableType, bookableId: '' }))} onId={(bookableId) => setBlockedDraft((current) => ({ ...current, bookableId }))} resourceLabel={labelForResource(blockedDraft.bookableType)} />
          <div className="availability-admin__two"><label><span>Início</span><input type="datetime-local" value={blockedDraft.startAt} onChange={(event) => setBlockedDraft((current) => ({ ...current, startAt: event.target.value }))} /></label><label><span>Fim</span><input type="datetime-local" value={blockedDraft.endAt} onChange={(event) => setBlockedDraft((current) => ({ ...current, endAt: event.target.value }))} /></label></div>
          <label><span>Motivo (opcional)</span><input value={blockedDraft.reason ?? ''} onChange={(event) => setBlockedDraft((current) => ({ ...current, reason: event.target.value }))} placeholder="Contexto interno" /></label>
          {createBlocked.isError && <p className="field-error" role="alert">Não foi possível guardar o bloqueio.</p>}
          <button type="button" className="ds-button ds-button--primary" disabled={!can('availability.manage') || !blockedValid || createBlocked.isPending} onClick={() => createBlocked.mutate()}><Plus size={16} /> {createBlocked.isPending ? 'A guardar…' : 'Adicionar bloqueio'}</button>
        </div>
        <AvailabilityRecords loading={blocked.isLoading} error={blocked.isError} empty="Sem períodos bloqueados.">
          {blocked.data?.items.map((item) => <article className="availability-admin__record" key={item.id}><div><strong>{formatDateTime(item.startAt)}</strong><small>{humanizeType(item.bookableType)} · {item.bookableId}</small></div><span>até {formatDateTime(item.endAt)}{item.reason ? ` · ${item.reason}` : ''}</span>{can('availability.manage') && <button type="button" aria-label="Eliminar bloqueio" disabled={deleteBlocked.isPending} onClick={() => deleteBlocked.mutate(item.id)}><Trash2 size={15} /></button>}</article>)}
        </AvailabilityRecords>
      </article>
    </section>
  </section>
}

function BookableFields({ type, id, onType, onId, resourceLabel }: { type: BookableType; id: string; onType: (type: BookableType) => void; onId: (id: string) => void; resourceLabel: string }) {
  return <><label><span>Tipo</span><select value={type} onChange={(event) => onType(event.target.value as BookableType)}><option value="SPACE">Espaço</option><option value="SERVICE">Serviço</option><option value="COURSE_SESSION">Sessão de formação</option></select></label><label><span>{resourceLabel}</span><input value={id} onChange={(event) => onId(event.target.value)} placeholder="UUID" /></label></>
}

function AvailabilityRecords({ loading, error, empty, children }: { loading: boolean; error: boolean; empty: string; children: React.ReactNode }) {
  if (loading) return <LoadingState label="A carregar registos." />
  if (error) return <ErrorState title="Não foi possível carregar os registos." />
  const hasRecords = Array.isArray(children) ? children.length > 0 : Boolean(children)
  return <div className="availability-admin__records">{hasRecords ? children : <AvailabilityEmpty icon={ShieldCheck} title={empty} description="Adicione um registo quando existir uma necessidade operacional real." />}</div>
}

function AvailabilityEmpty({ icon: Icon, title, description }: { icon: typeof ShieldCheck; title: string; description: string }) {
  return <div className="availability-admin__empty"><Icon size={22} /><h3>{title}</h3><p>{description}</p></div>
}
function humanizeType(type: string) { return type === 'SPACE' ? 'Espaço' : type === 'SERVICE' ? 'Serviço' : 'Sessão de formação' }
function labelForResource(type: BookableType) { return type === 'SPACE' ? 'ID do espaço' : type === 'SERVICE' ? 'ID do serviço' : 'ID da sessão de formação' }
function formatDate(value: string) { return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`)) }
function formatDateTime(value: string) { return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) }
