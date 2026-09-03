import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell, CalendarDays, CheckSquare2, ChevronRight, ClipboardPlus, Inbox, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApi, useCan, useSession } from '../../app/providers/AppProviders'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

export function SecretaryDashboardPage(){
  const api=useApi(); const can=useCan(); const session=useSession(); const today=new Date().toISOString().slice(0,10)
  const summary=useQuery({queryKey:['operations','secretary','summary'],queryFn:()=>api.operations.getSummary(),enabled:can('dashboard.read')})
  const bookings=useQuery({queryKey:['operations','secretary','bookings'],queryFn:()=>api.operations.listBookings(),enabled:can('booking.read')})
  const requests=useQuery({queryKey:['operations','secretary','requests'],queryFn:()=>api.operations.listRequests(),enabled:can('request.read')})
  const tasks=useQuery({queryKey:['operations','secretary','tasks'],queryFn:()=>api.operations.listTasks(),enabled:can('task.read')})
  const notifications=useQuery({queryKey:['operations','secretary','notifications'],queryFn:()=>api.operations.listNotifications(),enabled:can('notification.read')})

  const todaysBookings=useMemo(()=>(bookings.data?.items??[]).filter(item=>item.startAt.slice(0,10)===today&&['PENDING','CONFIRMED'].includes(item.status)).sort((a,b)=>a.startAt.localeCompare(b.startAt)),[bookings.data,today])
  const newRequests=(requests.data?.items??[]).filter(item=>item.status==='NEW')
  const activeTasks=(tasks.data?.items??[]).filter(item=>!['DONE','CANCELLED'].includes(item.status)).sort((a,b)=>(a.dueAt??'9999').localeCompare(b.dueAt??'9999'))
  const unread=(notifications.data?.items??[]).filter(item=>!item.readAt)
  const loading=[summary,bookings,requests,tasks,notifications].some(query=>query.isLoading)
  const failed=[summary,bookings,requests,tasks,notifications].some(query=>query.isError)

  return <section className="secretary-dashboard">
    <header className="secretary-dashboard__hero"><div><span>OPERAÇÃO DIÁRIA</span><h1>{greeting(session?.displayName)}</h1><p>Reservas, pedidos e seguimentos que precisam de atenção hoje.</p></div>{can('booking.create')&&<Link className="secretary-dashboard__primary" to="/app/reservas/nova"><ClipboardPlus size={18}/>Nova reserva</Link>}</header>
    {loading&&<LoadingState label="A preparar o trabalho do dia."/>}{failed&&<ErrorState title="Parte da operação não pôde ser carregada."/>}
    <section className="secretary-dashboard__today"><div className="secretary-dashboard__today-label"><small>HOJE</small><strong>{formatDate(new Date())}</strong></div><OperationalNumber label="Reservas" value={todaysBookings.length} icon={CalendarDays}/><OperationalNumber label="Pedidos novos" value={newRequests.length} icon={Inbox}/><OperationalNumber label="Tarefas abertas" value={activeTasks.length} icon={CheckSquare2}/><OperationalNumber label="Notificações" value={unread.length} icon={Bell}/></section>
    <div className="secretary-dashboard__work">
      <section className="secretary-dashboard__agenda"><Heading title="Agenda de hoje" to="/app/calendario"/>{todaysBookings.length?<div>{todaysBookings.slice(0,8).map(item=><article key={item.id}><time>{formatTime(item.startAt)}</time><div><strong>{item.reference}</strong><span>{[item.firstName,item.lastName].filter(Boolean).join(' ')||item.email||'Cliente'} · {item.bookableType.replaceAll('_',' ')}</span></div><small data-status={item.status}>{item.status==='CONFIRMED'?'Confirmada':'Pendente'}</small></article>)}</div>:<Empty text="Sem reservas pendentes ou confirmadas para hoje."/>}</section>
      <aside className="secretary-dashboard__queue"><Heading title="Fila de atenção" to="/app/pedidos"/><QueueRow label="Pedidos novos" value={newRequests.length} to="/app/pedidos"/><QueueRow label="Reservas pendentes" value={(bookings.data?.items??[]).filter(item=>item.status==='PENDING').length} to="/app/reservas"/><QueueRow label="Tarefas abertas" value={activeTasks.length} to="/app/tarefas"/><QueueRow label="Notificações não lidas" value={unread.length} to="/app/notificacoes"/></aside>
    </div>
    <section className="secretary-dashboard__tasks"><Heading title="Próximos seguimentos" to="/app/tarefas"/>{activeTasks.length?<div>{activeTasks.slice(0,6).map(task=><article key={task.id}><span data-priority={task.priority}/><div><strong>{task.title}</strong><small>{task.assignedUserName||'Sem responsável indicado'}</small></div><time>{task.dueAt?formatDateTime(task.dueAt):'Sem prazo'}</time></article>)}</div>:<Empty text="Não existem tarefas operacionais abertas."/>}</section>
    <section className="secretary-dashboard__summary" aria-label="Resumo da organização"><div><UsersRound size={18}/><span>Clientes registados</span><strong>{summary.data?.customers??'—'}</strong></div><div><Inbox size={18}/><span>Pedidos registados</span><strong>{summary.data?.requests??'—'}</strong></div><div><CalendarDays size={18}/><span>Reservas registadas</span><strong>{summary.data?.bookings??'—'}</strong></div></section>
  </section>
}

function OperationalNumber({label,value,icon:Icon}:{label:string;value:number;icon:typeof CalendarDays}){return <article><Icon size={18}/><strong>{value}</strong><span>{label}</span></article>}
function Heading({title,to}:{title:string;to:string}){return <header><h2>{title}</h2><Link to={to}>Ver tudo <ChevronRight size={15}/></Link></header>}
function QueueRow({label,value,to}:{label:string;value:number;to:string}){return <Link to={to}><span>{label}</span><strong>{value}</strong><ChevronRight size={15}/></Link>}
function Empty({text}:{text:string}){return <div className="secretary-dashboard__empty">{text}</div>}
function greeting(name?:string){const first=name?.trim().split(/\s+/)[0];return first?`Bom trabalho, ${first}.`:'Bom trabalho.'}
function formatDate(value:Date){return new Intl.DateTimeFormat('pt-PT',{weekday:'long',day:'numeric',month:'long'}).format(value)}
function formatTime(value:string){return new Intl.DateTimeFormat('pt-PT',{hour:'2-digit',minute:'2-digit'}).format(new Date(value))}
function formatDateTime(value:string){return new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value))}
