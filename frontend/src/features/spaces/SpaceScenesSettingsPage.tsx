import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'
import { spaceScenesAdmin, type SpaceSceneDto, type SpaceSceneInputDto } from '../../api/client/spaceScenesAdmin'

const emptyDraft: SpaceSceneInputDto = { panoramaUrl: '', title: '', initialYaw: 0, initialPitch: 0, sortOrder: 0 }

export function SpaceScenesSettingsPage() {
  const api = useApi(); const can = useCan(); const queryClient = useQueryClient()
  const [spaceId, setSpaceId] = useState(''); const [editing, setEditing] = useState<SpaceSceneDto | null>(null); const [draft, setDraft] = useState<SpaceSceneInputDto>(emptyDraft)
  const spaces = useQuery({ queryKey: ['operations','catalog','spaces'], queryFn: () => api.operations.listAdminSpaces(), enabled: can('space.read') })
  const scenes = useQuery({ queryKey: ['operations','spaces',spaceId,'scenes'], queryFn: () => spaceScenesAdmin.list(spaceId), enabled: Boolean(spaceId) && can('space.read') })
  const save = useMutation({ mutationFn: () => editing ? spaceScenesAdmin.update(spaceId, editing.id, draft) : spaceScenesAdmin.create(spaceId, draft), onSuccess: () => { reset(); void queryClient.invalidateQueries({ queryKey: ['operations','spaces',spaceId,'scenes'] }) } })
  const remove = useMutation({ mutationFn: (id:string) => spaceScenesAdmin.delete(spaceId,id), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['operations','spaces',spaceId,'scenes'] }) })
  function reset(){ setEditing(null); setDraft(emptyDraft) }
  function edit(item:SpaceSceneDto){ setEditing(item); setDraft({ panoramaUrl:item.panoramaUrl, title:item.title ?? '', initialYaw:item.initialYaw, initialPitch:item.initialPitch, sortOrder:item.sortOrder }) }
  const valid = Boolean(spaceId && draft.panoramaUrl.trim())

  return <section className="ops-v2 catalog-admin">
    <header className="ops-v2__hero"><div><span className="eyebrow">ADMINISTRAÇÃO · ESPAÇOS</span><h1>Cenas 360</h1><p>Registe apenas panoramas reais e aprovados. O sistema não cria imagens ou URLs fictícias.</p></div></header>
    <section className="catalog-admin__layout">
      <main className="catalog-admin__main">
        <div className="catalog-admin__toolbar"><div><span className="eyebrow">ESPAÇO</span><h2>Cenas configuradas</h2></div><label><span>Espaço</span><select value={spaceId} onChange={(event)=>{setSpaceId(event.target.value);reset()}}><option value="">Selecionar espaço</option>{spaces.data?.items.filter((item)=>item.active).map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
        {spaces.isLoading ? <LoadingState label="A carregar espaços."/> : spaces.isError ? <ErrorState title="Não foi possível carregar os espaços."/> : !spaceId ? <div className="catalog-admin__empty"><h3>Selecione um espaço.</h3></div> : scenes.isLoading ? <LoadingState label="A carregar cenas."/> : scenes.isError ? <ErrorState title="Não foi possível carregar as cenas."/> : (scenes.data?.length ?? 0) ? <div className="catalog-admin__list">{scenes.data?.map((item)=><article key={item.id} className="catalog-admin__row"><div className="catalog-admin__row-order"><span>{item.sortOrder}</span><small>ordem</small></div><div className="catalog-admin__row-copy"><strong>{item.title || 'Cena sem título'}</strong><p>{item.panoramaUrl}</p><small>Yaw {item.initialYaw} · Pitch {item.initialPitch}</small></div>{can('space.manage')?<div className="catalog-admin__actions"><button type="button" onClick={()=>edit(item)} aria-label="Editar cena"><Pencil size={16}/></button><button type="button" onClick={()=>remove.mutate(item.id)} disabled={remove.isPending} aria-label="Eliminar cena"><Trash2 size={16}/></button></div>:null}</article>)}</div> : <div className="catalog-admin__empty"><h3>Sem cenas configuradas.</h3><p>Adicione um panorama apenas quando existir um asset 360 real.</p></div>}
      </main>
      <aside className="catalog-admin__editor"><div className="catalog-admin__editor-heading"><div><span className="eyebrow">{editing?'EDITAR':'NOVA'}</span><h2>Cena 360</h2></div>{editing?<button type="button" className="catalog-admin__close" onClick={reset}><X size={17}/></button>:null}</div><div className="catalog-admin__form">
        <label><span>Título</span><input maxLength={200} value={draft.title ?? ''} onChange={(e)=>setDraft({...draft,title:e.target.value})}/></label>
        <label><span>URL do panorama</span><input required value={draft.panoramaUrl} onChange={(e)=>setDraft({...draft,panoramaUrl:e.target.value})} placeholder="https://…"/></label>
        <div className="catalog-admin__two"><label><span>Yaw inicial</span><input type="number" step="0.1" value={draft.initialYaw} onChange={(e)=>setDraft({...draft,initialYaw:Number(e.target.value)})}/></label><label><span>Pitch inicial</span><input type="number" step="0.1" value={draft.initialPitch} onChange={(e)=>setDraft({...draft,initialPitch:Number(e.target.value)})}/></label></div>
        <label><span>Ordem</span><input type="number" value={draft.sortOrder} onChange={(e)=>setDraft({...draft,sortOrder:Number(e.target.value)})}/></label>
        {save.isError?<p className="field-error" role="alert">Não foi possível guardar a cena.</p>:null}
        <button type="button" className="ds-button ds-button--primary" disabled={!can('space.manage')||!valid||save.isPending} onClick={()=>save.mutate()}>{editing?<Check size={16}/>:<Plus size={16}/>} {save.isPending?'A guardar…':'Guardar cena'}</button>
      </div></aside>
    </section>
  </section>
}
