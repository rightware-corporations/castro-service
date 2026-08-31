import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock3, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import type { AvailabilityRuleInputDto, BookableType } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const
const dayLabels: Record<(typeof days)[number], string> = {
  MONDAY: 'Segunda-feira', TUESDAY: 'Terça-feira', WEDNESDAY: 'Quarta-feira', THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira', SATURDAY: 'Sábado', SUNDAY: 'Domingo',
}

const initialRule: AvailabilityRuleInputDto = {
  bookableType: 'SPACE',
  bookableId: '',
  dayOfWeek: 'MONDAY',
  opensAt: '08:00',
  closesAt: '17:00',
  slotIntervalMinutes: 30,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  minimumNoticeMinutes: 0,
  maximumAdvanceDays: 90,
  active: true,
}

export function AvailabilitySettingsPage() {
  const api = useApi()
  const can = useCan()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<AvailabilityRuleInputDto>(initialRule)
  const rules = useQuery({ queryKey: ['operations', 'availability', 'rules'], queryFn: () => api.operations.listAvailabilityRules(), enabled: can('availability.read') })
  const exceptions = useQuery({ queryKey: ['operations', 'availability', 'exceptions'], queryFn: () => api.operations.listAvailabilityExceptions(), enabled: can('availability.read') })
  const blocked = useQuery({ queryKey: ['operations', 'availability', 'blocked'], queryFn: () => api.operations.listBlockedPeriods(), enabled: can('availability.read') })
  const createRule = useMutation({
    mutationFn: () => api.operations.createAvailabilityRule(draft),
    onSuccess: () => { setDraft(initialRule); void queryClient.invalidateQueries({ queryKey: ['operations', 'availability', 'rules'] }) },
  })
  const deleteRule = useMutation({ mutationFn: (id: string) => api.operations.deleteAvailabilityRule(id), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['operations', 'availability', 'rules'] }) })

  const resourceLabel = useMemo(() => draft.bookableType === 'SPACE' ? 'ID do espaço' : draft.bookableType === 'SERVICE' ? 'ID do serviço' : 'ID da sessão de formação', [draft.bookableType])
  const valid = Boolean(draft.bookableId && draft.opensAt < draft.closesAt && draft.slotIntervalMinutes > 0 && draft.maximumAdvanceDays > 0)

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
        {rules.isLoading ? <LoadingState label="A carregar regras de disponibilidade." /> : rules.isError ? <ErrorState title="Não foi possível carregar as regras." /> : <div className="availability-admin__rules">{rules.data?.items.length ? rules.data.items.map((rule) => <article key={rule.id} className="availability-rule-row"><span className="availability-rule-row__day">{dayLabels[rule.dayOfWeek as keyof typeof dayLabels] ?? rule.dayOfWeek}</span><div><strong>{rule.opensAt.slice(0, 5)} — {rule.closesAt.slice(0, 5)}</strong><small>{humanizeType(rule.bookableType)} · {rule.bookableId}</small></div><div><span>{rule.slotIntervalMinutes} min</span><small>intervalo</small></div><div><span>{rule.maximumAdvanceDays} dias</span><small>antecedência máx.</small></div>{can('availability.manage') ? <button type="button" className="availability-rule-row__delete" aria-label="Eliminar regra" disabled={deleteRule.isPending} onClick={() => deleteRule.mutate(rule.id)}><Trash2 size={16} /></button> : null}</article>) : <div className="availability-admin__empty"><ShieldCheck size={22} /><h3>Sem regras configuradas.</h3><p>Enquanto não existirem regras, a disponibilidade pública permanece vazia.</p></div>}</div>}
      </div>

      <aside className="availability-admin__form-panel">
        <span className="eyebrow">NOVA REGRA</span><h2>Definir horário</h2><p>Associe a regra a um recurso real já existente no catálogo.</p>
        <div className="availability-admin__form">
          <label><span>Tipo</span><select value={draft.bookableType} onChange={(event) => setDraft((current) => ({ ...current, bookableType: event.target.value as BookableType }))}><option value="SPACE">Espaço</option><option value="SERVICE">Serviço</option><option value="COURSE_SESSION">Sessão de formação</option></select></label>
          <label><span>{resourceLabel}</span><input value={draft.bookableId} onChange={(event) => setDraft((current) => ({ ...current, bookableId: event.target.value }))} placeholder="UUID" /></label>
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

    <section className="availability-admin__secondary"><article><Clock3 size={20} /><div><span className="eyebrow">EXCEÇÕES</span><h2>{exceptions.data?.total ?? 0}</h2><p>Dias fechados ou com horário extraordinário.</p></div></article><article><ShieldCheck size={20} /><div><span className="eyebrow">PERÍODOS BLOQUEADOS</span><h2>{blocked.data?.total ?? 0}</h2><p>Intervalos indisponíveis independentemente da regra semanal.</p></div></article></section>
  </section>
}

function humanizeType(type: string) { return type === 'SPACE' ? 'Espaço' : type === 'SERVICE' ? 'Serviço' : 'Sessão de formação' }
