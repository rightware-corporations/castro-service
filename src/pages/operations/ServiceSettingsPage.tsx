import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import type { AdminServiceDto, AdminServiceInputDto } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

const emptyDraft: AdminServiceInputDto = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  durationMinutes: null,
  bookingEnabled: false,
  active: true,
  featured: false,
  sortOrder: 0,
}

export function ServiceSettingsPage() {
  const api = useApi()
  const can = useCan()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<AdminServiceInputDto>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)

  const services = useQuery({
    queryKey: ['operations', 'catalog', 'services'],
    queryFn: () => api.operations.listAdminServices(),
    enabled: can('service.read'),
  })

  const save = useMutation({
    mutationFn: () => editingId
      ? api.operations.updateAdminService(editingId, draft)
      : api.operations.createAdminService(draft),
    onSuccess: () => {
      resetEditor()
      void queryClient.invalidateQueries({ queryKey: ['operations', 'catalog', 'services'] })
      void queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  const deactivate = useMutation({
    mutationFn: (id: string) => api.operations.deactivateAdminService(id),
    onSuccess: () => {
      if (editingId) resetEditor()
      void queryClient.invalidateQueries({ queryKey: ['operations', 'catalog', 'services'] })
      void queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-PT')
    if (!term) return services.data?.items ?? []
    return (services.data?.items ?? []).filter((item) =>
      [item.name, item.slug, item.shortDescription ?? ''].some((value) => value.toLocaleLowerCase('pt-PT').includes(term)),
    )
  }, [query, services.data?.items])

  const valid = Boolean(draft.name.trim() && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) && (draft.durationMinutes == null || draft.durationMinutes > 0))

  function resetEditor() {
    setEditingId(null)
    setDraft(emptyDraft)
  }

  function edit(item: AdminServiceDto) {
    setEditingId(item.id)
    setDraft({
      name: item.name,
      slug: item.slug,
      shortDescription: item.shortDescription ?? '',
      description: item.description ?? '',
      durationMinutes: item.durationMinutes ?? null,
      bookingEnabled: item.bookingEnabled,
      active: item.active,
      featured: item.featured,
      sortOrder: item.sortOrder,
    })
  }

  return <section className="ops-v2 catalog-admin">
    <header className="ops-v2__hero">
      <div>
        <span className="eyebrow">ADMINISTRAÇÃO · SERVIÇOS</span>
        <h1>Serviços</h1>
        <p>Gira o catálogo público sem alterar código. Publicação, reservas e destaque permanecem controlados por serviço.</p>
      </div>
      <div className="ops-v2__environment"><span className="is-connected" /><div><small>Contrato</small><strong>Backend protegido</strong></div></div>
    </header>

    <section className="catalog-admin__summary" aria-label="Resumo dos serviços">
      <article><small>Total</small><strong>{services.data?.total ?? '—'}</strong></article>
      <article><small>Ativos</small><strong>{services.data?.items.filter((item) => item.active).length ?? '—'}</strong></article>
      <article><small>Reserváveis</small><strong>{services.data?.items.filter((item) => item.active && item.bookingEnabled).length ?? '—'}</strong></article>
      <article><small>Em destaque</small><strong>{services.data?.items.filter((item) => item.active && item.featured).length ?? '—'}</strong></article>
    </section>

    <section className="catalog-admin__layout">
      <div className="catalog-admin__main">
        <div className="catalog-admin__toolbar">
          <div><span className="eyebrow">CATÁLOGO</span><h2>Serviços configurados</h2></div>
          <label className="catalog-admin__search"><Search size={16} /><span className="sr-only">Pesquisar serviços</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar nome ou slug" /></label>
        </div>

        {services.isLoading ? <LoadingState label="A carregar serviços." /> : services.isError ? <ErrorState title="Não foi possível carregar os serviços." /> : filtered.length ? <div className="catalog-admin__list">
          {filtered.map((item) => <article key={item.id} className={`catalog-admin__row${item.active ? '' : ' is-inactive'}`}>
            <div className="catalog-admin__row-order"><span>{item.sortOrder}</span><small>ordem</small></div>
            <div className="catalog-admin__row-copy"><div className="catalog-admin__row-title"><strong>{item.name}</strong>{item.featured ? <Star size={14} aria-label="Em destaque" /> : null}</div><small>/{item.slug}</small>{item.shortDescription ? <p>{item.shortDescription}</p> : null}</div>
            <div className="catalog-admin__statuses"><Status enabled={item.active} on="Ativo" off="Inativo" /><Status enabled={item.bookingEnabled} on="Reservável" off="Sem reserva" /></div>
            {can('service.manage') ? <div className="catalog-admin__actions"><button type="button" onClick={() => edit(item)} aria-label={`Editar ${item.name}`}><Pencil size={16} /></button><button type="button" onClick={() => deactivate.mutate(item.id)} disabled={!item.active || deactivate.isPending} aria-label={`Desativar ${item.name}`}><Trash2 size={16} /></button></div> : null}
          </article>)}
        </div> : <div className="catalog-admin__empty"><h3>Nenhum serviço encontrado.</h3><p>Crie um serviço apenas quando houver conteúdo comercial aprovado para publicar.</p></div>}
      </div>

      <aside className="catalog-admin__editor">
        <div className="catalog-admin__editor-heading"><div><span className="eyebrow">{editingId ? 'EDITAR SERVIÇO' : 'NOVO SERVIÇO'}</span><h2>{editingId ? 'Atualizar serviço' : 'Adicionar ao catálogo'}</h2></div>{editingId ? <button type="button" className="catalog-admin__close" onClick={resetEditor} aria-label="Cancelar edição"><X size={17} /></button> : null}</div>
        <div className="catalog-admin__form">
          <label><span>Nome</span><input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label>
          <label><span>Slug</span><input value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value.toLocaleLowerCase('pt-PT').replace(/\s+/g, '-') }))} placeholder="nome-do-servico" /><small>Minúsculas, números e hífens.</small></label>
          <label><span>Descrição curta</span><textarea rows={3} value={draft.shortDescription ?? ''} onChange={(event) => setDraft((current) => ({ ...current, shortDescription: event.target.value }))} /></label>
          <label><span>Descrição</span><textarea rows={6} value={draft.description ?? ''} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label>
          <div className="catalog-admin__two"><label><span>Duração (min)</span><input type="number" min="1" value={draft.durationMinutes ?? ''} onChange={(event) => setDraft((current) => ({ ...current, durationMinutes: event.target.value ? Number(event.target.value) : null }))} placeholder="Opcional" /></label><label><span>Ordem</span><input type="number" min="0" value={draft.sortOrder} onChange={(event) => setDraft((current) => ({ ...current, sortOrder: Number(event.target.value) }))} /></label></div>
          <div className="catalog-admin__switches"><Toggle checked={draft.active} label="Ativo" onChange={(active) => setDraft((current) => ({ ...current, active }))} /><Toggle checked={draft.bookingEnabled} label="Permitir reservas" onChange={(bookingEnabled) => setDraft((current) => ({ ...current, bookingEnabled }))} /><Toggle checked={draft.featured} label="Em destaque" onChange={(featured) => setDraft((current) => ({ ...current, featured }))} /></div>
          {save.isError ? <p className="field-error" role="alert">Não foi possível guardar. Confirme o slug e os restantes campos.</p> : null}
          <button type="button" className="ds-button ds-button--primary" disabled={!can('service.manage') || !valid || save.isPending} onClick={() => save.mutate()}>{editingId ? <Check size={16} /> : <Plus size={16} />}{save.isPending ? 'A guardar…' : editingId ? 'Guardar alterações' : 'Criar serviço'}</button>
        </div>
      </aside>
    </section>
  </section>
}

function Status({ enabled, on, off }: { enabled: boolean; on: string; off: string }) {
  return <span className={`catalog-admin__status${enabled ? ' is-on' : ''}`}><span />{enabled ? on : off}</span>
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return <label className="catalog-admin__toggle"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="catalog-admin__toggle-control" aria-hidden="true"><span /></span><span>{label}</span></label>
}
