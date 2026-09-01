import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import type { AdminSpaceDto, AdminSpaceInputDto } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

const emptyDraft: AdminSpaceInputDto = {
  name: '', slug: '', description: '', location: '', capacityMin: null, capacityMax: null, sizeSquareMeters: null, active: true,
}

export function SpaceSettingsPage() {
  const api = useApi()
  const can = useCan()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<AdminSpaceInputDto>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)

  const spaces = useQuery({ queryKey: ['operations', 'catalog', 'spaces'], queryFn: () => api.operations.listAdminSpaces(), enabled: can('space.read') })
  const save = useMutation({
    mutationFn: () => editingId ? api.operations.updateAdminSpace(editingId, draft) : api.operations.createAdminSpace(draft),
    onSuccess: () => { reset(); void queryClient.invalidateQueries({ queryKey: ['operations', 'catalog', 'spaces'] }); void queryClient.invalidateQueries({ queryKey: ['spaces'] }) },
  })
  const deactivate = useMutation({ mutationFn: (id: string) => api.operations.deactivateAdminSpace(id), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['operations', 'catalog', 'spaces'] }); void queryClient.invalidateQueries({ queryKey: ['spaces'] }) } })

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-PT')
    const items = spaces.data?.items ?? []
    return term ? items.filter((item) => [item.name, item.slug, item.location ?? ''].some((value) => value.toLocaleLowerCase('pt-PT').includes(term))) : items
  }, [query, spaces.data?.items])

  const valid = Boolean(draft.name.trim() && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) && (draft.capacityMin == null || draft.capacityMin >= 0) && (draft.capacityMax == null || draft.capacityMax >= 0) && (draft.capacityMin == null || draft.capacityMax == null || draft.capacityMin <= draft.capacityMax) && (draft.sizeSquareMeters == null || draft.sizeSquareMeters > 0))

  function reset() { setEditingId(null); setDraft(emptyDraft) }
  function edit(item: AdminSpaceDto) { setEditingId(item.id); setDraft({ name: item.name, slug: item.slug, description: item.description ?? '', location: item.location ?? '', capacityMin: item.capacityMin ?? null, capacityMax: item.capacityMax ?? null, sizeSquareMeters: item.sizeSquareMeters ?? null, active: item.active }) }

  return <section className="ops-v2 catalog-admin">
    <header className="ops-v2__hero"><div><span className="eyebrow">ADMINISTRAÇÃO · ESPAÇOS</span><h1>Espaços</h1><p>Gira os espaços publicados, respetivas capacidades e informação operacional sem alterar código.</p></div><div className="ops-v2__environment"><span className="is-connected" /><div><small>Contrato</small><strong>Backend protegido</strong></div></div></header>

    <section className="catalog-admin__summary"><article><small>Total</small><strong>{spaces.data?.total ?? '—'}</strong></article><article><small>Ativos</small><strong>{spaces.data?.items.filter((item) => item.active).length ?? '—'}</strong></article><article><small>Com capacidade</small><strong>{spaces.data?.items.filter((item) => item.capacityMax != null).length ?? '—'}</strong></article><article><small>Com localização</small><strong>{spaces.data?.items.filter((item) => Boolean(item.location)).length ?? '—'}</strong></article></section>

    <section className="catalog-admin__layout">
      <div className="catalog-admin__main">
        <div className="catalog-admin__toolbar"><div><span className="eyebrow">CATÁLOGO</span><h2>Espaços configurados</h2></div><label className="catalog-admin__search"><Search size={16} /><input aria-label="Pesquisar espaços" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar espaço" /></label></div>
        {spaces.isLoading ? <LoadingState label="A carregar espaços." /> : spaces.isError ? <ErrorState title="Não foi possível carregar os espaços." /> : filtered.length ? <div className="catalog-admin__list">{filtered.map((item) => <article key={item.id} className={`catalog-admin__row${item.active ? '' : ' is-inactive'}`}><div className="catalog-admin__row-order"><span>{item.capacityMax ?? '—'}</span><small>cap. máx.</small></div><div className="catalog-admin__row-copy"><div className="catalog-admin__row-title"><strong>{item.name}</strong></div><small>/{item.slug}</small>{item.location ? <p>{item.location}</p> : null}</div><div className="catalog-admin__statuses"><Status enabled={item.active} on="Ativo" off="Inativo" /></div>{can('space.manage') ? <div className="catalog-admin__actions"><button type="button" onClick={() => edit(item)} aria-label={`Editar ${item.name}`}><Pencil size={16} /></button><button type="button" onClick={() => deactivate.mutate(item.id)} disabled={!item.active || deactivate.isPending} aria-label={`Desativar ${item.name}`}><Trash2 size={16} /></button></div> : null}</article>)}</div> : <div className="catalog-admin__empty"><h3>Sem espaços configurados.</h3><p>Adicione apenas espaços reais e aprovados para publicação.</p></div>}
      </div>

      <aside className="catalog-admin__editor">
        <div className="catalog-admin__editor-heading"><div><span className="eyebrow">{editingId ? 'EDITAR ESPAÇO' : 'NOVO ESPAÇO'}</span><h2>{editingId ? 'Atualizar espaço' : 'Adicionar espaço'}</h2></div>{editingId ? <button type="button" className="catalog-admin__close" onClick={reset}><X size={17} /></button> : null}</div>
        <div className="catalog-admin__form">
          <label><span>Nome</span><input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label>
          <label><span>Slug</span><input value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value.toLocaleLowerCase('pt-PT').replace(/\s+/g, '-') }))} placeholder="nome-do-espaco" /></label>
          <label><span>Descrição</span><textarea rows={6} value={draft.description ?? ''} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label>
          <label><span>Localização</span><input value={draft.location ?? ''} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} /></label>
          <div className="catalog-admin__two"><label><span>Capacidade mínima</span><input type="number" min="0" value={draft.capacityMin ?? ''} onChange={(event) => setDraft((current) => ({ ...current, capacityMin: event.target.value ? Number(event.target.value) : null }))} /></label><label><span>Capacidade máxima</span><input type="number" min="0" value={draft.capacityMax ?? ''} onChange={(event) => setDraft((current) => ({ ...current, capacityMax: event.target.value ? Number(event.target.value) : null }))} /></label></div>
          <label><span>Área (m²)</span><input type="number" min="0" step="0.01" value={draft.sizeSquareMeters ?? ''} onChange={(event) => setDraft((current) => ({ ...current, sizeSquareMeters: event.target.value ? Number(event.target.value) : null }))} /></label>
          <Toggle checked={draft.active} label="Espaço ativo" onChange={(active) => setDraft((current) => ({ ...current, active }))} />
          {save.isError ? <p className="field-error">Não foi possível guardar o espaço.</p> : null}
          <button type="button" className="ds-button ds-button--primary" disabled={!can('space.manage') || !valid || save.isPending} onClick={() => save.mutate()}>{editingId ? <Check size={16} /> : <Plus size={16} />}{save.isPending ? 'A guardar…' : editingId ? 'Guardar alterações' : 'Criar espaço'}</button>
        </div>
      </aside>
    </section>
  </section>
}

function Status({ enabled, on, off }: { enabled: boolean; on: string; off: string }) { return <span className={`catalog-admin__status${enabled ? ' is-on' : ''}`}><span />{enabled ? on : off}</span> }
function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) { return <label className="catalog-admin__toggle"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="catalog-admin__toggle-control"><span /></span><span>{label}</span></label> }
