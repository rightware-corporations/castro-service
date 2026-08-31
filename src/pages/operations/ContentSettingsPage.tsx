import { FormEvent, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, Plus, Save, Trash2 } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import type { AdminContentInputDto, AdminContentItemDto, ContentStatus } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

const emptyInput: AdminContentInputDto = { contentKey: '', title: '', body: '', mediaUrl: '', status: 'DRAFT' }

export function ContentSettingsPage() {
  const api = useApi()
  const can = useCan()
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const content = useQuery({ queryKey: ['operations', 'content'], queryFn: () => api.operations.listContent(), enabled: can('content.read') })
  const selected = useMemo(() => content.data?.items.find((item) => item.id === selectedId) ?? null, [content.data, selectedId])

  const remove = useMutation({
    mutationFn: (id: string) => api.operations.deleteContent(id),
    onSuccess: () => {
      setSelectedId(null)
      setCreating(false)
      void queryClient.invalidateQueries({ queryKey: ['operations', 'content'] })
    },
  })

  if (content.isLoading) return <LoadingState label="A carregar conteúdo." />
  if (content.isError || !content.data) return <ErrorState title="Não foi possível carregar o conteúdo." />

  return <section className="catalog-admin">
    <header className="ops-v2__hero"><div><span className="eyebrow">CONTEÚDO</span><h1>Conteúdo público</h1><p>Área editorial para preparar e publicar texto ou referências de media aprovadas. Nenhum conteúdo é criado automaticamente.</p></div><button className="button button--primary" type="button" disabled={!can('content.manage')} onClick={() => { setSelectedId(null); setCreating(true) }}><Plus size={16} />Novo conteúdo</button></header>
    <section className="catalog-admin__summary">
      <article><small>Total</small><strong>{content.data.total}</strong></article>
      <article><small>Publicados</small><strong>{content.data.items.filter((item) => item.status === 'PUBLISHED').length}</strong></article>
      <article><small>Rascunhos</small><strong>{content.data.items.filter((item) => item.status === 'DRAFT').length}</strong></article>
      <article><small>Fonte</small><strong>Backend</strong></article>
    </section>
    <div className="catalog-admin__layout">
      <main className="catalog-admin__main">
        {content.data.items.length === 0 ? <div className="catalog-admin__empty"><FileText size={24} /><h3>Sem entradas de conteúdo</h3><p>Crie apenas conteúdo confirmado ou aprovado para publicação.</p></div> : <div className="catalog-admin__list">{content.data.items.map((item) => <button key={item.id} type="button" className={`catalog-admin__row ${selectedId === item.id ? 'is-active' : ''}`} onClick={() => { setCreating(false); setSelectedId(item.id) }}><div><strong>{item.title || item.contentKey}</strong><small>{item.contentKey}</small></div><span className="badge">{item.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}</span></button>)}</div>}
      </main>
      <aside className="catalog-admin__editor">
        {creating ? <ContentEditor key="new" initial={emptyInput} onSaved={(item) => { setCreating(false); setSelectedId(item.id) }} /> : selected ? <ContentEditor key={selected.id} item={selected} initial={toInput(selected)} onSaved={(item) => setSelectedId(item.id)} onDelete={() => remove.mutate(selected.id)} deleting={remove.isPending} /> : <div className="catalog-admin__empty"><h3>Seleciona uma entrada</h3><p>Escolhe conteúdo existente ou cria uma nova entrada.</p></div>}
      </aside>
    </div>
  </section>
}

function ContentEditor({ item, initial, onSaved, onDelete, deleting = false }: { item?: AdminContentItemDto; initial: AdminContentInputDto; onSaved: (item: AdminContentItemDto) => void; onDelete?: () => void; deleting?: boolean }) {
  const api = useApi()
  const can = useCan()
  const queryClient = useQueryClient()
  const [contentKey, setContentKey] = useState(initial.contentKey)
  const [title, setTitle] = useState(initial.title ?? '')
  const [body, setBody] = useState(initial.body ?? '')
  const [mediaUrl, setMediaUrl] = useState(initial.mediaUrl ?? '')
  const [status, setStatus] = useState<ContentStatus>(initial.status)

  const save = useMutation({
    mutationFn: () => {
      const input: AdminContentInputDto = { contentKey, title, body, mediaUrl, status }
      return item ? api.operations.updateContent(item.id, input) : api.operations.createContent(input)
    },
    onSuccess: (value) => {
      void queryClient.invalidateQueries({ queryKey: ['operations', 'content'] })
      onSaved(value)
    },
  })

  function submit(event: FormEvent) { event.preventDefault(); save.mutate() }

  return <div><div className="catalog-admin__editor-heading"><div><span className="eyebrow">{item ? 'EDITAR' : 'CRIAR'}</span><h2>{item ? item.title || item.contentKey : 'Nova entrada'}</h2></div></div><form className="catalog-admin__form" onSubmit={submit}>
    <label>Chave<input required maxLength={160} pattern="[a-z0-9][a-z0-9._-]*" value={contentKey} onChange={(event) => setContentKey(event.target.value)} placeholder="home.hero.title" /><small>Identificador técnico estável, sem espaços.</small></label>
    <label>Título<input maxLength={240} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
    <label>Conteúdo<textarea rows={8} maxLength={20000} value={body} onChange={(event) => setBody(event.target.value)} /></label>
    <label>URL de media<input maxLength={4000} value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="https://…" /><small>Utilizar apenas referência de media aprovada.</small></label>
    <label>Estado<select value={status} onChange={(event) => setStatus(event.target.value as ContentStatus)}><option value="DRAFT">Rascunho</option><option value="PUBLISHED">Publicado</option></select></label>
    {save.isError && <p className="field-error" role="alert">Não foi possível guardar. Confirma a chave e tenta novamente.</p>}
    {save.isSuccess && <p role="status">Conteúdo guardado.</p>}
    <button className="button button--primary" type="submit" disabled={!can('content.manage') || save.isPending}><Save size={16} />{save.isPending ? 'A guardar…' : 'Guardar'}</button>
    {item && onDelete && <button className="button" type="button" disabled={!can('content.manage') || deleting} onClick={onDelete}><Trash2 size={16} />{deleting ? 'A eliminar…' : 'Eliminar'}</button>}
  </form></div>
}

function toInput(item: AdminContentItemDto): AdminContentInputDto {
  return { contentKey: item.contentKey, title: item.title ?? '', body: item.body ?? '', mediaUrl: item.mediaUrl ?? '', status: item.status }
}
