import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Inbox, UsersRound } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import type { OperationsBookingItemDto, OperationsRequestItemDto } from '../../api/contracts'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

export function OwnerAgendaPage() {
  const api = useApi(); const can = useCan()
  const query = useQuery({ queryKey:['owner','agenda'], queryFn:()=>api.operations.listBookings(), enabled:can('booking.read') })
  const items = useMemo(() => (query.data?.items ?? []).filter(item=>new Date(item.endAt).getTime()>=Date.now()).sort((a,b)=>new Date(a.startAt).getTime()-new Date(b.startAt).getTime()),[query.data])
  return <OwnerPage eyebrow="AGENDA" title="Próxima atividade" description="Leitura executiva das reservas futuras da Castro’s.">
    {query.isLoading?<LoadingState label="A carregar agenda."/>:query.isError?<ErrorState title="Não foi possível carregar a agenda."/>:items.length?<div className="owner-table"><div className="owner-table__head"><span>Data</span><span>Reserva</span><span>Cliente</span><span>Tipo</span><span>Estado</span></div>{items.map(item=><BookingRow key={item.id} item={item}/>)}</div>:<OwnerEmpty icon={CalendarDays} title="Sem atividade futura." text="Não existem reservas futuras para mostrar neste momento."/>}
  </OwnerPage>
}

export function OwnerActivityPage() {
  const api=useApi(); const can=useCan()
  const requests=useQuery({queryKey:['owner','activity','requests'],queryFn:()=>api.operations.listRequests(),enabled:can('request.read')})
  const bookings=useQuery({queryKey:['owner','activity','bookings'],queryFn:()=>api.operations.listBookings(),enabled:can('booking.read')})
  const activeRequests=(requests.data?.items??[]).filter(item=>!['CLOSED','CANCELLED','CONVERTED'].includes(item.status))
  const activeBookings=(bookings.data?.items??[]).filter(item=>['PENDING','CONFIRMED'].includes(item.status))
  return <OwnerPage eyebrow="ATIVIDADE" title="O que merece atenção" description="Pedidos em aberto e reservas ativas, sem misturar a CEO com o fluxo operacional de edição.">
    {(requests.isLoading||bookings.isLoading)?<LoadingState label="A carregar atividade."/>:(requests.isError||bookings.isError)?<ErrorState title="Não foi possível carregar a atividade."/>:<div className="owner-split">
      <section><header><span>PEDIDOS</span><strong>{activeRequests.length}</strong></header>{activeRequests.length?<div className="owner-compact-list">{activeRequests.slice(0,12).map(item=><RequestRow key={item.id} item={item}/>)}</div>:<OwnerEmpty icon={Inbox} title="Sem pedidos ativos." text="Não existem pedidos em acompanhamento neste momento."/>}</section>
      <section><header><span>RESERVAS</span><strong>{activeBookings.length}</strong></header>{activeBookings.length?<div className="owner-compact-list">{activeBookings.slice(0,12).map(item=><BookingCompact key={item.id} item={item}/>)}</div>:<OwnerEmpty icon={CalendarDays} title="Sem reservas ativas." text="Não existem reservas pendentes ou confirmadas neste momento."/>}</section>
    </div>}
  </OwnerPage>
}

export function OwnerCustomersPage(){
  const api=useApi(); const can=useCan()
  const query=useQuery({queryKey:['owner','customers'],queryFn:()=>api.operations.listCustomers(),enabled:can('customer.read')})
  return <OwnerPage eyebrow="CLIENTES" title="Base de clientes" description="Visão de relacionamento para acompanhar quem já interagiu com a Castro’s.">
    {query.isLoading?<LoadingState label="A carregar clientes."/>:query.isError?<ErrorState title="Não foi possível carregar os clientes."/>:(query.data?.items.length??0)>0?<div className="owner-customer-grid">{query.data!.items.slice(0,40).map(customer=><article key={customer.id}><strong>{[customer.firstName,customer.lastName].filter(Boolean).join(' ')}</strong><span>{customer.company||customer.email||customer.phone||'Sem detalhe adicional'}</span><small>{customer.source?`Origem: ${customer.source}`:'Origem não registada'}</small></article>)}</div>:<OwnerEmpty icon={UsersRound} title="Sem clientes registados." text="A base de clientes aparecerá aqui quando existirem interações reais."/>}
  </OwnerPage>
}

function OwnerPage({eyebrow,title,description,children}:{eyebrow:string;title:string;description:string;children:React.ReactNode}){return <section className="owner-page"><header className="owner-page__hero"><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>{children}</section>}
function BookingRow({item}:{item:OperationsBookingItemDto}){return <article className="owner-table__row"><span>{formatDateTime(item.startAt)}</span><strong>{item.reference}</strong><span>{personName(item)}</span><span>{item.bookableType.replaceAll('_',' ')}</span><span className={`owner-status owner-status--${item.status.toLowerCase()}`}>{translateStatus(item.status)}</span></article>}
function BookingCompact({item}:{item:OperationsBookingItemDto}){return <article><div><strong>{item.reference}</strong><span>{personName(item)}</span></div><small>{formatDateTime(item.startAt)} · {translateStatus(item.status)}</small></article>}
function RequestRow({item}:{item:OperationsRequestItemDto}){return <article><div><strong>{personName(item)}</strong><span>{item.type.replaceAll('_',' ')}</span></div><small>{translateStatus(item.status)} · {formatDateTime(item.createdAt)}</small></article>}
function OwnerEmpty({icon:Icon,title,text}:{icon:typeof CalendarDays;title:string;text:string}){return <div className="owner-empty"><Icon size={22}/><strong>{title}</strong><p>{text}</p></div>}
function personName(value:{firstName?:string|null;lastName?:string|null;email?:string|null}){return [value.firstName,value.lastName].filter(Boolean).join(' ')||value.email||'Cliente'}
function translateStatus(value:string){const labels:Record<string,string>={PENDING:'Pendente',CONFIRMED:'Confirmada',COMPLETED:'Concluída',CANCELLED:'Cancelada',NO_SHOW:'Não compareceu',NEW:'Novo',CONTACTED:'Contactado',QUALIFIED:'Qualificado',WAITING_CUSTOMER:'Aguarda cliente',CONVERTED:'Convertido',CLOSED:'Fechado'};return labels[value]??value.replaceAll('_',' ')}
function formatDateTime(value:string){return new Intl.DateTimeFormat('pt-PT',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))}
