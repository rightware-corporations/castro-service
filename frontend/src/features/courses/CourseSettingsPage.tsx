import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import type { AdminCourseDto, AdminCourseInputDto, AdminCourseSessionDto, AdminCourseSessionInputDto, CourseRegistrationStatus } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

const emptyCourse: AdminCourseInputDto = { name: '', slug: '', description: '', active: true }
const emptySession: AdminCourseSessionInputDto = { startAt: '', endAt: '', active: true }

export function CourseSettingsPage() {
  const api = useApi()
  const can = useCan()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<AdminCourseInputDto>(emptyCourse)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [sessionDraft, setSessionDraft] = useState<AdminCourseSessionInputDto>(emptySession)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)

  const courses = useQuery({ queryKey: ['operations', 'catalog', 'courses'], queryFn: () => api.operations.listAdminCourses(), enabled: can('course.read') })
  const sessions = useQuery({ queryKey: ['operations', 'catalog', 'courses', selectedCourseId, 'sessions'], queryFn: () => api.operations.listAdminCourseSessions(selectedCourseId!), enabled: can('course.read') && Boolean(selectedCourseId) })
  const registrations = useQuery({ queryKey: ['operations', 'course-registrations'], queryFn: () => api.operations.listCourseRegistrations(), enabled: can('course.read') })

  const save = useMutation({
    mutationFn: () => editingId ? api.operations.updateAdminCourse(editingId, draft) : api.operations.createAdminCourse(draft),
    onSuccess: () => { resetCourse(); void queryClient.invalidateQueries({ queryKey: ['operations', 'catalog', 'courses'] }); void queryClient.invalidateQueries({ queryKey: ['courses'] }) },
  })
  const deactivate = useMutation({ mutationFn: (id: string) => api.operations.deactivateAdminCourse(id), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['operations', 'catalog', 'courses'] }); void queryClient.invalidateQueries({ queryKey: ['courses'] }) } })
  const saveSession = useMutation({
    mutationFn: () => editingSessionId ? api.operations.updateAdminCourseSession(selectedCourseId!, editingSessionId, sessionDraft) : api.operations.createAdminCourseSession(selectedCourseId!, sessionDraft),
    onSuccess: () => { resetSession(); void queryClient.invalidateQueries({ queryKey: ['operations', 'catalog', 'courses', selectedCourseId, 'sessions'] }); void queryClient.invalidateQueries({ queryKey: ['course-sessions'] }) },
  })
  const deactivateSession = useMutation({ mutationFn: (id: string) => api.operations.deactivateAdminCourseSession(selectedCourseId!, id), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['operations', 'catalog', 'courses', selectedCourseId, 'sessions'] }) })
  const updateRegistration = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CourseRegistrationStatus }) => api.operations.updateCourseRegistrationStatus(id, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['operations', 'course-registrations'] }),
  })

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-PT')
    const items = courses.data?.items ?? []
    return term ? items.filter((item) => [item.name, item.slug, item.description ?? ''].some((value) => value.toLocaleLowerCase('pt-PT').includes(term))) : items
  }, [courses.data?.items, query])

  const valid = Boolean(draft.name.trim() && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug))
  const sessionValid = Boolean(selectedCourseId && sessionDraft.startAt && sessionDraft.endAt && sessionDraft.startAt < sessionDraft.endAt)
  const pendingRegistrations = registrations.data?.items.filter((item) => item.status === 'PENDING').length ?? 0

  function resetCourse() { setEditingId(null); setDraft(emptyCourse) }
  function editCourse(item: AdminCourseDto) { setEditingId(item.id); setDraft({ name: item.name, slug: item.slug, description: item.description ?? '', active: item.active }) }
  function resetSession() { setEditingSessionId(null); setSessionDraft(emptySession) }
  function editSession(item: AdminCourseSessionDto) { setEditingSessionId(item.id); setSessionDraft({ startAt: toLocalInput(item.startAt), endAt: toLocalInput(item.endAt), active: item.active }) }

  return <section className="ops-v2 catalog-admin">
    <header className="ops-v2__hero"><div><span className="eyebrow">ADMINISTRAÇÃO · FORMAÇÃO</span><h1>Formação</h1><p>Gira formações, sessões e inscrições reais sem transformar uma sessão de grupo numa reserva exclusiva.</p></div><div className="ops-v2__environment"><span className="is-connected" /><div><small>Contrato</small><strong>Backend protegido</strong></div></div></header>

    <section className="catalog-admin__summary"><article><small>Total</small><strong>{courses.data?.total ?? '—'}</strong></article><article><small>Ativas</small><strong>{courses.data?.items.filter((item) => item.active).length ?? '—'}</strong></article><article><small>Inscrições</small><strong>{registrations.data?.total ?? '—'}</strong></article><article><small>Pendentes</small><strong>{pendingRegistrations}</strong></article></section>

    <section className="catalog-admin__layout">
      <div className="catalog-admin__main">
        <div className="catalog-admin__toolbar"><div><span className="eyebrow">CATÁLOGO</span><h2>Formações configuradas</h2></div><label className="catalog-admin__search"><Search size={16} /><input aria-label="Pesquisar formações" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar formação" /></label></div>
        {courses.isLoading ? <LoadingState label="A carregar formações." /> : courses.isError ? <ErrorState title="Não foi possível carregar as formações." /> : filtered.length ? <div className="catalog-admin__list">{filtered.map((item) => <article key={item.id} className={`catalog-admin__row${item.active ? '' : ' is-inactive'}`}><div className="catalog-admin__row-order"><span>{item.active ? '●' : '○'}</span><small>estado</small></div><div className="catalog-admin__row-copy"><div className="catalog-admin__row-title"><strong>{item.name}</strong></div><small>/{item.slug}</small>{item.description ? <p>{item.description}</p> : null}</div><div className="catalog-admin__statuses"><Status enabled={item.active} on="Ativa" off="Inativa" /></div><div className="catalog-admin__actions"><button type="button" onClick={() => { setSelectedCourseId(item.id); resetSession() }}>Sessões</button>{can('course.manage') ? <><button type="button" onClick={() => editCourse(item)} aria-label={`Editar ${item.name}`}><Pencil size={16} /></button><button type="button" onClick={() => deactivate.mutate(item.id)} disabled={!item.active || deactivate.isPending} aria-label={`Desativar ${item.name}`}><Trash2 size={16} /></button></> : null}</div></article>)}</div> : <div className="catalog-admin__empty"><h3>Sem formações configuradas.</h3><p>Crie apenas formações com conteúdo aprovado.</p></div>}

        {selectedCourseId ? <section className="catalog-admin__sessions"><div className="catalog-admin__toolbar"><div><span className="eyebrow">SESSÕES</span><h2>Calendário da formação</h2></div><button type="button" className="ds-button ds-button--secondary" onClick={() => { setSelectedCourseId(null); resetSession() }}>Fechar</button></div>{sessions.isLoading ? <LoadingState label="A carregar sessões." /> : sessions.isError ? <ErrorState title="Não foi possível carregar as sessões." /> : sessions.data?.items.length ? <div className="catalog-admin__list">{sessions.data.items.map((item) => <article key={item.id} className={`catalog-admin__row${item.active ? '' : ' is-inactive'}`}><div className="catalog-admin__row-copy"><strong>{formatDateTime(item.startAt)}</strong><small>até {formatDateTime(item.endAt)}</small></div><div className="catalog-admin__statuses"><Status enabled={item.active} on="Ativa" off="Inativa" /></div>{can('course.manage') ? <div className="catalog-admin__actions"><button type="button" onClick={() => editSession(item)}><Pencil size={16} /></button><button type="button" onClick={() => deactivateSession.mutate(item.id)} disabled={!item.active}><Trash2 size={16} /></button></div> : null}</article>)}</div> : <div className="catalog-admin__empty"><h3>Sem sessões.</h3><p>Adicione uma sessão quando existir uma data real confirmada.</p></div>}</section> : null}

        <section className="catalog-admin__sessions"><div className="catalog-admin__toolbar"><div><span className="eyebrow">INSCRIÇÕES</span><h2>Participação nas sessões</h2></div><small>{pendingRegistrations} a aguardar decisão</small></div>{registrations.isLoading ? <LoadingState label="A carregar inscrições." /> : registrations.isError ? <ErrorState title="Não foi possível carregar as inscrições." /> : registrations.data?.items.length ? <div className="catalog-admin__list">{registrations.data.items.map((item) => <article key={item.id} className={`catalog-admin__row${item.status === 'CANCELLED' ? ' is-inactive' : ''}`}><div className="catalog-admin__row-order"><span>{item.participantCount}</span><small>pessoas</small></div><div className="catalog-admin__row-copy"><div className="catalog-admin__row-title"><strong>{[item.firstName, item.lastName].filter(Boolean).join(' ') || item.email}</strong></div><small>{item.reference} · {item.courseName ?? 'Formação'}</small><p>{formatDateTime(item.sessionStartAt)}{item.organizationName ? ` · ${item.organizationName}` : ''}</p></div><div className="catalog-admin__statuses"><span className={`catalog-admin__status${item.status === 'CONFIRMED' ? ' is-on' : ''}`}><span />{registrationStatusLabel(item.status)}</span></div>{can('course.manage') && item.status !== 'CANCELLED' ? <div className="catalog-admin__actions">{item.status === 'PENDING' ? <button type="button" disabled={updateRegistration.isPending} onClick={() => updateRegistration.mutate({ id: item.id, status: 'CONFIRMED' })} aria-label={`Confirmar ${item.reference}`}><Check size={16} /></button> : null}<button type="button" disabled={updateRegistration.isPending} onClick={() => updateRegistration.mutate({ id: item.id, status: 'CANCELLED' })} aria-label={`Cancelar ${item.reference}`}><X size={16} /></button></div> : null}</article>)}</div> : <div className="catalog-admin__empty"><h3>Sem inscrições.</h3><p>As inscrições submetidas no website serão apresentadas aqui.</p></div>}</section>
      </div>

      <aside className="catalog-admin__editor">
        <div className="catalog-admin__editor-heading"><div><span className="eyebrow">{selectedCourseId ? editingSessionId ? 'EDITAR SESSÃO' : 'NOVA SESSÃO' : editingId ? 'EDITAR FORMAÇÃO' : 'NOVA FORMAÇÃO'}</span><h2>{selectedCourseId ? 'Calendário' : 'Catálogo'}</h2></div>{(editingId || editingSessionId) ? <button type="button" className="catalog-admin__close" onClick={selectedCourseId ? resetSession : resetCourse}><X size={17} /></button> : null}</div>
        {selectedCourseId ? <div className="catalog-admin__form"><label><span>Início</span><input type="datetime-local" value={sessionDraft.startAt} onChange={(event) => setSessionDraft((current) => ({ ...current, startAt: event.target.value }))} /></label><label><span>Fim</span><input type="datetime-local" value={sessionDraft.endAt} onChange={(event) => setSessionDraft((current) => ({ ...current, endAt: event.target.value }))} /></label><Toggle checked={sessionDraft.active} label="Sessão ativa" onChange={(active) => setSessionDraft((current) => ({ ...current, active }))} />{saveSession.isError ? <p className="field-error">Não foi possível guardar a sessão.</p> : null}<button type="button" className="ds-button ds-button--primary" disabled={!can('course.manage') || !sessionValid || saveSession.isPending} onClick={() => saveSession.mutate()}>{editingSessionId ? <Check size={16} /> : <Plus size={16} />}{saveSession.isPending ? 'A guardar…' : editingSessionId ? 'Guardar sessão' : 'Adicionar sessão'}</button></div> : <div className="catalog-admin__form"><label><span>Nome</span><input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label><label><span>Slug</span><input value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value.toLocaleLowerCase('pt-PT').replace(/\s+/g, '-') }))} placeholder="nome-da-formacao" /></label><label><span>Descrição</span><textarea rows={7} value={draft.description ?? ''} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label><Toggle checked={draft.active} label="Formação ativa" onChange={(active) => setDraft((current) => ({ ...current, active }))} />{save.isError ? <p className="field-error">Não foi possível guardar a formação.</p> : null}<button type="button" className="ds-button ds-button--primary" disabled={!can('course.manage') || !valid || save.isPending} onClick={() => save.mutate()}>{editingId ? <Check size={16} /> : <Plus size={16} />}{save.isPending ? 'A guardar…' : editingId ? 'Guardar alterações' : 'Criar formação'}</button></div>}
      </aside>
    </section>
  </section>
}

function Status({ enabled, on, off }: { enabled: boolean; on: string; off: string }) { return <span className={`catalog-admin__status${enabled ? ' is-on' : ''}`}><span />{enabled ? on : off}</span> }
function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) { return <label className="catalog-admin__toggle"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="catalog-admin__toggle-control"><span /></span><span>{label}</span></label> }
function formatDateTime(value?: string | null) { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium', timeStyle: 'short' }).format(date) }
function toLocalInput(value: string) { const date = new Date(value); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16) }
function registrationStatusLabel(value: CourseRegistrationStatus) { return value === 'PENDING' ? 'Pendente' : value === 'CONFIRMED' ? 'Confirmada' : 'Cancelada' }
