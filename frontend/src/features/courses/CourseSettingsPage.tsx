import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import type { AdminCourseDto, AdminCourseInputDto, AdminCourseSessionDto, AdminCourseSessionInputDto, CourseRegistrationStatus } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

type CourseAdminInput = AdminCourseInputDto & {
  shortDescription?: string
  modality?: string
  durationLabel?: string
  scheduleSummary?: string
  investmentAmount?: number | null
  investmentCurrency?: string
  certificateIncluded: boolean
  learningOutcomes: string[]
  featured: boolean
}

type CourseAdminView = AdminCourseDto & {
  shortDescription?: string | null
  modality?: string | null
  durationLabel?: string | null
  scheduleSummary?: string | null
  investmentAmount?: number | null
  investmentCurrency?: string | null
  certificateIncluded?: boolean
  learningOutcomes?: string[]
  featured?: boolean
}

type CourseSessionAdminInput = AdminCourseSessionInputDto & { label?: string }
type CourseSessionAdminView = AdminCourseSessionDto & { label?: string | null }

const emptyCourse: CourseAdminInput = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  modality: '',
  durationLabel: '',
  scheduleSummary: '',
  investmentAmount: null,
  investmentCurrency: 'MZN',
  certificateIncluded: false,
  learningOutcomes: [],
  featured: false,
  active: true,
}
const emptySession: CourseSessionAdminInput = { startAt: '', endAt: '', label: '', active: true }

export function CourseSettingsPage() {
  const api = useApi()
  const can = useCan()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<CourseAdminInput>(emptyCourse)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [sessionDraft, setSessionDraft] = useState<CourseSessionAdminInput>(emptySession)
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

  const courseItems = (courses.data?.items ?? []) as CourseAdminView[]
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-PT')
    return term ? courseItems.filter((item) => [item.name, item.slug, item.shortDescription ?? '', item.description ?? '', item.modality ?? ''].some((value) => value.toLocaleLowerCase('pt-PT').includes(term))) : courseItems
  }, [courseItems, query])

  const validInvestment = draft.investmentAmount == null || (draft.investmentAmount >= 0 && Boolean(draft.investmentCurrency?.trim()))
  const valid = Boolean(draft.name.trim() && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) && validInvestment)
  const sessionValid = Boolean(selectedCourseId && sessionDraft.startAt && sessionDraft.endAt && sessionDraft.startAt < sessionDraft.endAt)
  const pendingRegistrations = registrations.data?.items.filter((item) => item.status === 'PENDING').length ?? 0

  function resetCourse() { setEditingId(null); setDraft(emptyCourse) }
  function editCourse(item: CourseAdminView) {
    setEditingId(item.id)
    setDraft({
      name: item.name,
      slug: item.slug,
      shortDescription: item.shortDescription ?? '',
      description: item.description ?? '',
      modality: item.modality ?? '',
      durationLabel: item.durationLabel ?? '',
      scheduleSummary: item.scheduleSummary ?? '',
      investmentAmount: item.investmentAmount ?? null,
      investmentCurrency: item.investmentCurrency ?? 'MZN',
      certificateIncluded: item.certificateIncluded ?? false,
      learningOutcomes: item.learningOutcomes ?? [],
      featured: item.featured ?? false,
      active: item.active,
    })
  }
  function resetSession() { setEditingSessionId(null); setSessionDraft(emptySession) }
  function editSession(raw: AdminCourseSessionDto) {
    const item = raw as CourseSessionAdminView
    setEditingSessionId(item.id)
    setSessionDraft({ startAt: toLocalInput(item.startAt), endAt: toLocalInput(item.endAt), label: item.label ?? '', active: item.active })
  }

  return <section className="ops-v2 catalog-admin">
    <header className="ops-v2__hero"><div><span className="eyebrow">ADMINISTRAÇÃO · FORMAÇÃO</span><h1>Formação</h1><p>Crie cursos através de um único modelo reutilizável. O conteúdo muda por formação; a experiência pública, o card e o CTA mantêm a mesma estrutura.</p></div><div className="ops-v2__environment"><span className="is-connected" /><div><small>Contrato</small><strong>Backend protegido</strong></div></div></header>

    <section className="catalog-admin__summary"><article><small>Total</small><strong>{courses.data?.total ?? '—'}</strong></article><article><small>Ativas</small><strong>{courseItems.filter((item) => item.active).length}</strong></article><article><small>Inscrições</small><strong>{registrations.data?.total ?? '—'}</strong></article><article><small>Pendentes</small><strong>{pendingRegistrations}</strong></article></section>

    <section className="catalog-admin__layout">
      <div className="catalog-admin__main">
        <div className="catalog-admin__toolbar"><div><span className="eyebrow">CATÁLOGO</span><h2>Formações configuradas</h2></div><label className="catalog-admin__search"><Search size={16} /><input aria-label="Pesquisar formações" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar formação" /></label></div>
        {courses.isLoading ? <LoadingState label="A carregar formações." /> : courses.isError ? <ErrorState title="Não foi possível carregar as formações." /> : filtered.length ? <div className="catalog-admin__list">{filtered.map((item) => <article key={item.id} className={`catalog-admin__row${item.active ? '' : ' is-inactive'}`}><div className="catalog-admin__row-order"><span>{item.active ? '●' : '○'}</span><small>estado</small></div><div className="catalog-admin__row-copy"><div className="catalog-admin__row-title"><strong>{item.name}</strong></div><small>/{item.slug}{item.modality ? ` · ${item.modality}` : ''}{item.durationLabel ? ` · ${item.durationLabel}` : ''}</small>{item.shortDescription || item.description ? <p>{item.shortDescription ?? item.description}</p> : null}{item.investmentAmount != null ? <small>Investimento: {formatMoney(item.investmentAmount, item.investmentCurrency)}</small> : null}</div><div className="catalog-admin__statuses"><Status enabled={item.active} on="Ativa" off="Inativa" />{item.featured ? <span className="catalog-admin__status is-on"><span />Destaque</span> : null}</div><div className="catalog-admin__actions"><button type="button" onClick={() => { setSelectedCourseId(item.id); resetSession() }}>Sessões</button>{can('course.manage') ? <><button type="button" onClick={() => editCourse(item)} aria-label={`Editar ${item.name}`}><Pencil size={16} /></button><button type="button" onClick={() => deactivate.mutate(item.id)} disabled={!item.active || deactivate.isPending} aria-label={`Desativar ${item.name}`}><Trash2 size={16} /></button></> : null}</div></article>)}</div> : <div className="catalog-admin__empty"><h3>Sem formações configuradas.</h3><p>Crie apenas formações com conteúdo aprovado.</p></div>}

        {selectedCourseId ? <section className="catalog-admin__sessions"><div className="catalog-admin__toolbar"><div><span className="eyebrow">SESSÕES</span><h2>Calendário da formação</h2></div><button type="button" className="ds-button ds-button--secondary" onClick={() => { setSelectedCourseId(null); resetSession() }}>Fechar</button></div>{sessions.isLoading ? <LoadingState label="A carregar sessões." /> : sessions.isError ? <ErrorState title="Não foi possível carregar as sessões." /> : sessions.data?.items.length ? <div className="catalog-admin__list">{sessions.data.items.map((raw) => { const item = raw as CourseSessionAdminView; return <article key={item.id} className={`catalog-admin__row${item.active ? '' : ' is-inactive'}`}><div className="catalog-admin__row-copy"><strong>{item.label || formatDateTime(item.startAt)}</strong><small>{item.label ? `${formatDateTime(item.startAt)} · até ${formatDateTime(item.endAt)}` : `até ${formatDateTime(item.endAt)}`}</small></div><div className="catalog-admin__statuses"><Status enabled={item.active} on="Ativa" off="Inativa" /></div>{can('course.manage') ? <div className="catalog-admin__actions"><button type="button" onClick={() => editSession(item)}><Pencil size={16} /></button><button type="button" onClick={() => deactivateSession.mutate(item.id)} disabled={!item.active}><Trash2 size={16} /></button></div> : null}</article> })}</div> : <div className="catalog-admin__empty"><h3>Sem sessões.</h3><p>Adicione uma edição quando existir uma data real confirmada.</p></div>}</section> : null}

        <section className="catalog-admin__sessions"><div className="catalog-admin__toolbar"><div><span className="eyebrow">INSCRIÇÕES</span><h2>Participação nas sessões</h2></div><small>{pendingRegistrations} a aguardar decisão</small></div>{registrations.isLoading ? <LoadingState label="A carregar inscrições." /> : registrations.isError ? <ErrorState title="Não foi possível carregar as inscrições." /> : registrations.data?.items.length ? <div className="catalog-admin__list">{registrations.data.items.map((item) => <article key={item.id} className={`catalog-admin__row${item.status === 'CANCELLED' ? ' is-inactive' : ''}`}><div className="catalog-admin__row-order"><span>{item.participantCount}</span><small>pessoas</small></div><div className="catalog-admin__row-copy"><div className="catalog-admin__row-title"><strong>{[item.firstName, item.lastName].filter(Boolean).join(' ') || item.email}</strong></div><small>{item.reference} · {item.courseName ?? 'Formação'}</small><p>{formatDateTime(item.sessionStartAt)}{item.organizationName ? ` · ${item.organizationName}` : ''}</p></div><div className="catalog-admin__statuses"><span className={`catalog-admin__status${item.status === 'CONFIRMED' ? ' is-on' : ''}`}><span />{registrationStatusLabel(item.status)}</span></div>{can('course.manage') && item.status !== 'CANCELLED' ? <div className="catalog-admin__actions">{item.status === 'PENDING' ? <button type="button" disabled={updateRegistration.isPending} onClick={() => updateRegistration.mutate({ id: item.id, status: 'CONFIRMED' })} aria-label={`Confirmar ${item.reference}`}><Check size={16} /></button> : null}<button type="button" disabled={updateRegistration.isPending} onClick={() => updateRegistration.mutate({ id: item.id, status: 'CANCELLED' })} aria-label={`Cancelar ${item.reference}`}><X size={16} /></button></div> : null}</article>)}</div> : <div className="catalog-admin__empty"><h3>Sem inscrições.</h3><p>As inscrições submetidas no website serão apresentadas aqui.</p></div>}</section>
      </div>

      <aside className="catalog-admin__editor">
        <div className="catalog-admin__editor-heading"><div><span className="eyebrow">{selectedCourseId ? editingSessionId ? 'EDITAR EDIÇÃO' : 'NOVA EDIÇÃO' : editingId ? 'EDITAR FORMAÇÃO' : 'NOVA FORMAÇÃO'}</span><h2>{selectedCourseId ? 'Calendário' : 'Conteúdo do curso'}</h2></div>{(editingId || editingSessionId) ? <button type="button" className="catalog-admin__close" onClick={selectedCourseId ? resetSession : resetCourse}><X size={17} /></button> : null}</div>
        {selectedCourseId ? <div className="catalog-admin__form"><label><span>Nome da edição</span><input maxLength={160} value={sessionDraft.label ?? ''} onChange={(event) => setSessionDraft((current) => ({ ...current, label: event.target.value }))} placeholder="Edição de Outubro" /></label><label><span>Início</span><input type="datetime-local" value={sessionDraft.startAt} onChange={(event) => setSessionDraft((current) => ({ ...current, startAt: event.target.value }))} /></label><label><span>Fim</span><input type="datetime-local" value={sessionDraft.endAt} onChange={(event) => setSessionDraft((current) => ({ ...current, endAt: event.target.value }))} /></label><Toggle checked={sessionDraft.active} label="Sessão ativa" onChange={(active) => setSessionDraft((current) => ({ ...current, active }))} />{saveSession.isError ? <p className="field-error">Não foi possível guardar a sessão.</p> : null}<button type="button" className="ds-button ds-button--primary" disabled={!can('course.manage') || !sessionValid || saveSession.isPending} onClick={() => saveSession.mutate()}>{editingSessionId ? <Check size={16} /> : <Plus size={16} />}{saveSession.isPending ? 'A guardar…' : editingSessionId ? 'Guardar edição' : 'Adicionar edição'}</button></div> : <div className="catalog-admin__form">
          <label><span>Nome</span><input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label>
          <label><span>Slug</span><input value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value.toLocaleLowerCase('pt-PT').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }))} placeholder="nome-da-formacao" /></label>
          <label><span>Resumo para o card</span><textarea rows={3} value={draft.shortDescription ?? ''} onChange={(event) => setDraft((current) => ({ ...current, shortDescription: event.target.value }))} placeholder="Mensagem curta usada no catálogo público." /></label>
          <label><span>Descrição completa</span><textarea rows={6} value={draft.description ?? ''} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label>
          <label><span>Modalidade</span><input maxLength={40} value={draft.modality ?? ''} onChange={(event) => setDraft((current) => ({ ...current, modality: event.target.value }))} placeholder="PRESENCIAL" /></label>
          <label><span>Duração</span><input maxLength={80} value={draft.durationLabel ?? ''} onChange={(event) => setDraft((current) => ({ ...current, durationLabel: event.target.value }))} placeholder="1 mês" /></label>
          <label><span>Horário / frequência</span><textarea rows={3} value={draft.scheduleSummary ?? ''} onChange={(event) => setDraft((current) => ({ ...current, scheduleSummary: event.target.value }))} placeholder="Terças e quintas, 17h–19h" /></label>
          <label><span>Investimento</span><input type="number" min="0" step="0.01" value={draft.investmentAmount ?? ''} onChange={(event) => setDraft((current) => ({ ...current, investmentAmount: event.target.value === '' ? null : Number(event.target.value) }))} placeholder="1200" /></label>
          <label><span>Moeda</span><input maxLength={10} value={draft.investmentCurrency ?? ''} onChange={(event) => setDraft((current) => ({ ...current, investmentCurrency: event.target.value.toUpperCase() }))} placeholder="MZN" /></label>
          <label><span>O que o participante irá desenvolver</span><textarea rows={7} value={draft.learningOutcomes.join('\n')} onChange={(event) => setDraft((current) => ({ ...current, learningOutcomes: event.target.value.split('\n') }))} placeholder={'Comunicação eficaz\nLinguagem corporal\nEstrutura de discursos'} /><small>Uma linha por resultado de aprendizagem.</small></label>
          <Toggle checked={draft.certificateIncluded} label="Certificado incluído" onChange={(certificateIncluded) => setDraft((current) => ({ ...current, certificateIncluded }))} />
          <Toggle checked={draft.featured} label="Destacar no catálogo" onChange={(featured) => setDraft((current) => ({ ...current, featured }))} />
          <Toggle checked={draft.active} label="Formação publicada" onChange={(active) => setDraft((current) => ({ ...current, active }))} />
          {save.isError ? <p className="field-error">Não foi possível guardar a formação.</p> : null}<button type="button" className="ds-button ds-button--primary" disabled={!can('course.manage') || !valid || save.isPending} onClick={() => save.mutate()}>{editingId ? <Check size={16} /> : <Plus size={16} />}{save.isPending ? 'A guardar…' : editingId ? 'Guardar alterações' : 'Criar formação'}</button>
        </div>}
      </aside>
    </section>
  </section>
}

function Status({ enabled, on, off }: { enabled: boolean; on: string; off: string }) { return <span className={`catalog-admin__status${enabled ? ' is-on' : ''}`}><span />{enabled ? on : off}</span> }
function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) { return <label className="catalog-admin__toggle"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="catalog-admin__toggle-control"><span /></span><span>{label}</span></label> }
function formatDateTime(value?: string | null) { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium', timeStyle: 'short' }).format(date) }
function toLocalInput(value: string) { const date = new Date(value); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16) }
function registrationStatusLabel(value: CourseRegistrationStatus) { return value === 'PENDING' ? 'Pendente' : value === 'CONFIRMED' ? 'Confirmada' : 'Cancelada' }
function formatMoney(amount: number, currency?: string | null) { return new Intl.NumberFormat('pt-PT', { style: currency ? 'currency' : 'decimal', currency: currency || undefined, maximumFractionDigits: 2 }).format(amount) }
