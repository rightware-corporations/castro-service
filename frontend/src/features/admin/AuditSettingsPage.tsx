import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useCan } from '../../app/providers/AppProviders'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'
import { auditAdmin } from '../../api/client/auditAdmin'

export function AuditSettingsPage(){
  const can=useCan(); const [query,setQuery]=useState('')
  const events=useQuery({queryKey:['operations','audit'],queryFn:()=>auditAdmin.list(),enabled:can('audit.read')})
  const filtered=useMemo(()=>{const term=query.trim().toLowerCase(); const items=events.data??[]; return term?items.filter((item)=>`${item.action} ${item.entityType} ${item.actorEmail??''} ${item.details??''}`.toLowerCase().includes(term)):items},[events.data,query])
  return <section className="ops-v2 catalog-admin">
    <header className="ops-v2__hero"><div><span className="eyebrow">ADMINISTRAÇÃO · AUDITORIA</span><h1>Audit trail</h1><p>Registo cronológico de mutações privilegiadas que o sistema passou a auditar.</p></div></header>
    <section className="catalog-admin__layout"><main className="catalog-admin__main">
      <div className="catalog-admin__toolbar"><div><span className="eyebrow">EVENTOS</span><h2>Atividade recente</h2></div><label className="catalog-admin__search"><Search size={16}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Pesquisar auditoria" aria-label="Pesquisar auditoria"/></label></div>
      {events.isLoading?<LoadingState label="A carregar auditoria."/>:events.isError?<ErrorState title="Não foi possível carregar a auditoria."/>:filtered.length?<div className="catalog-admin__list">{filtered.map((item)=><article className="catalog-admin__row" key={item.id}><div className="catalog-admin__row-order"><span>{item.action}</span></div><div className="catalog-admin__row-copy"><strong>{item.entityType}</strong><p>{item.details||'Sem detalhe adicional.'}</p><small>{actor(item)} · {formatDate(item.createdAt)}{item.entityId?` · ${item.entityId}`:''}</small></div></article>)}</div>:<div className="catalog-admin__empty"><h3>Sem eventos auditados.</h3><p>Os eventos aparecem aqui quando uma mutação instrumentada é executada.</p></div>}
    </main></section>
  </section>
}

function actor(item:{actorFirstName?:string|null;actorLastName?:string|null;actorEmail?:string|null}){return [item.actorFirstName,item.actorLastName].filter(Boolean).join(' ')||item.actorEmail||'Sistema'}
function formatDate(value:string){return new Intl.DateTimeFormat('pt-PT',{dateStyle:'short',timeStyle:'short'}).format(new Date(value))}
