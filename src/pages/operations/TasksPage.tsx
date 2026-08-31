import { FormEvent, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import type { OperationsTaskItemDto, TaskPriority, TaskStatus } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

const emptyForm = { title: '', description: '', status: 'OPEN' as TaskStatus, priority: 'NORMAL' as TaskPriority, dueAt: '', assignedUserId: '' }

export function TasksPage() {
  const api = useApi()
  const can = useCan()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<OperationsTaskItemDto | null>(null)
  const [form, setForm] = useState(emptyForm)

  const tasks = useQuery({ queryKey: ['operations', 'tasks'], queryFn: () => api.operations.listTasks(), enabled: can('task.read') })
  const users = useQuery({ queryKey: ['operations', 'access', 'users'], queryFn: () => api.operations.listAdminUsers(), enabled: can('user.read') })

  const rows = useMemo(() => (tasks.data?.items ?? []).filter((task) => `${task.title} ${task.description ?? ''} ${task.assignedUserName ?? ''}`.toLowerCase().includes(search.toLowerCase())), [tasks.data, search])
  const openCount = (tasks.data?.items ?? []).filter((task) => task.status === 'OPEN').length
  const progressCount = (tasks.data?.items ?? []).filter((task) => task.status === 'IN_PROGRESS').length
  const overdueCount = (tasks.data?.items ?? []).filter((task) => task.dueAt && task.status !== 'DONE' && task.status !== 'CANCELLED' && new Date(task.dueAt).getTime() < Date.now()).length

  const save = useMutation({
    mutationFn: () => {
      const input = { title: form.title, description: form.description || undefined, status: form.status, priority: form.priority, dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null, assignedUserId: form.assignedUserId || null }
      return editing ? api.operations.updateTask(editing.id, input) : api.operations.createTask(input)
    },
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['operations', 'tasks'] }); reset() },
  })
  const changeStatus = useMutation({ mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => api.operations.updateTaskStatus(id, status), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['operations', 'tasks'] }) })
  const remove = useMutation({ mutationFn: (id: string) => api.operations.deleteTask(id), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['operations', 'tasks'] }) })

  function reset() { setEditing(null); setForm(emptyForm) }
  function edit(task: OperationsTaskItemDto) {
    setEditing(task)
    setForm({ title: task.title, description: task.description ?? '', status: task.status, priority: task.priority, dueAt: task.dueAt ? toLocalInput(task.dueAt) : '', assignedUserId: task.assignedUserId ?? '' })
  }
  function submit(event: FormEvent) { event.preventDefault(); save.mutate() }

  return <section className="catalog-admin">
    <header className="ops-v2__hero"><div><span className="eyebrow">OPERAÇÕES</span><h1>Tarefas e follow-ups</h1><p>Acompanhamento interno de ações, prazos e responsáveis da organização.</p></div></header>
    <section className="catalog-admin__summary">
      <article><small>Total</small><strong>{tasks.data?.total ?? '—'}</strong></article>
      <article><small>Por iniciar</small><strong>{openCount}</strong></article>
      <article><small>Em curso</small><strong>{progressCount}</strong></article>
      <article><small>Em atraso</small><strong>{overdueCount}</strong></article>
    </section>
    <div className="catalog-admin__layout">
      <main className="catalog-admin__main">
        <div className="catalog-admin__toolbar"><div><span className="eyebrow">FOLLOW-UP</span><h2>Plano de ações</h2></div><label className="catalog-admin__search"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar tarefa" /></label></div>
        {tasks.isLoading ? <LoadingState label="A carregar tarefas." /> : tasks.isError ? <ErrorState title="Não foi possível carregar as tarefas." /> : <div className="catalog-admin__list">
          {rows.length ? rows.map((task) => <article className={`catalog-admin__row ${task.status === 'DONE' || task.status === 'CANCELLED' ? 'is-inactive' : ''}`} key={task.id}>
            <div className="catalog-admin__row-order"><CheckCircle2 size={18}/></div>
            <div className="catalog-admin__row-copy"><div className="catalog-admin__row-title"><strong>{task.title}</strong></div><p>{task.description || 'Sem descrição adicional.'}</p><small>{task.assignedUserName || 'Sem responsável'}{task.dueAt ? ` · ${formatDate(task.dueAt)}` : ''}</small></div>
            <div className="catalog-admin__statuses"><span className={`catalog-admin__status ${task.status === 'DONE' ? 'is-on' : ''}`}><span/>{statusLabel(task.status)}</span><span className="catalog-admin__status"><span/>{priorityLabel(task.priority)}</span></div>
            <div className="catalog-admin__actions">{task.status !== 'DONE' && <button type="button" disabled={!can('task.manage') || changeStatus.isPending} onClick={() => changeStatus.mutate({ id: task.id, status: 'DONE' })} aria-label="Concluir tarefa"><CheckCircle2 size={16}/></button>}<button type="button" disabled={!can('task.manage')} onClick={() => edit(task)} aria-label="Editar tarefa"><Pencil size={16}/></button><button type="button" disabled={!can('task.manage') || remove.isPending} onClick={() => remove.mutate(task.id)} aria-label="Eliminar tarefa"><Trash2 size={16}/></button></div>
          </article>) : <div className="catalog-admin__empty"><h3>Sem tarefas.</h3><p>Crie uma tarefa quando existir uma ação real que precise de acompanhamento.</p></div>}
        </div>}
      </main>
      <aside className="catalog-admin__editor">
        <div className="catalog-admin__editor-heading"><div><span className="eyebrow">{editing ? 'EDITAR' : 'NOVA'}</span><h2>{editing ? 'Tarefa' : 'Criar tarefa'}</h2></div>{editing && <button className="catalog-admin__close" type="button" onClick={reset}><X size={16}/></button>}</div>
        <form className="catalog-admin__form" onSubmit={submit}>
          <label>Título<input required maxLength={180} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label>Descrição<textarea maxLength={4000} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <div className="catalog-admin__two"><label>Estado<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TaskStatus })}><option value="OPEN">Por iniciar</option><option value="IN_PROGRESS">Em curso</option><option value="DONE">Concluída</option><option value="CANCELLED">Cancelada</option></select></label><label>Prioridade<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as TaskPriority })}><option value="LOW">Baixa</option><option value="NORMAL">Normal</option><option value="HIGH">Alta</option><option value="URGENT">Urgente</option></select></label></div>
          <label>Prazo<input type="datetime-local" value={form.dueAt} onChange={(event) => setForm({ ...form, dueAt: event.target.value })} /></label>
          <label>Responsável<select value={form.assignedUserId} onChange={(event) => setForm({ ...form, assignedUserId: event.target.value })}><option value="">Sem responsável</option>{users.data?.items.filter((user) => user.active).map((user) => <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>)}</select><small>A lista depende da permissão de leitura de utilizadores.</small></label>
          {save.isError && <p className="field-error" role="alert">Não foi possível guardar a tarefa.</p>}
          <button className="button button--primary" type="submit" disabled={!can('task.manage') || save.isPending}><Plus size={16}/>{save.isPending ? 'A guardar…' : 'Guardar tarefa'}</button>
        </form>
      </aside>
    </div>
  </section>
}

function toLocalInput(value: string) { const date = new Date(value); const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000); return local.toISOString().slice(0, 16) }
function formatDate(value: string) { return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) }
function statusLabel(status: TaskStatus) { return ({ OPEN: 'Por iniciar', IN_PROGRESS: 'Em curso', DONE: 'Concluída', CANCELLED: 'Cancelada' } as const)[status] }
function priorityLabel(priority: TaskPriority) { return ({ LOW: 'Baixa', NORMAL: 'Normal', HIGH: 'Alta', URGENT: 'Urgente' } as const)[priority] }
