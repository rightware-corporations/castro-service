import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'
import { spaceScenesAdmin } from '../../api/client/spaceScenesAdmin'
import { spaceHotspotsAdmin, type SpaceHotspotDto, type SpaceHotspotInputDto } from '../../api/client/spaceHotspotsAdmin'

const emptyDraft: SpaceHotspotInputDto = { title:'', description:'', yaw:0, pitch:0, type:'INFO', targetSceneId:null, resourceId:null }

export function SpaceHotspotsSettingsPage(){
  const api=useApi(); const can=useCan(); const queryClient=useQueryClient()
  const [spaceId,setSpaceId]=useState(''); const [sceneId,setSceneId]=useState(''); const [editing,setEditing]=useState<SpaceHotspotDto|null>(null); const [draft,setDraft]=useState<SpaceHotspotInputDto>(emptyDraft)
  const spaces=useQuery({queryKey:['operations','catalog','spaces'],queryFn:()=>api.operations.listAdminSpaces(),enabled:can('space.read')})
  const scenes=useQuery({queryKey:['operations','spaces',spaceId,'scenes'],queryFn:()=>spaceScenesAdmin.list(spaceId),enabled:Boolean(spaceId)&&can('space.read')})
  const hotspots=useQuery({queryKey:['operations','spaces',spaceId,'scenes',sceneId,'hotspots'],queryFn:()=>spaceHotspotsAdmin.list(spaceId,sceneId),enabled:Boolean(spaceId&&sceneId)&&can('space.read')})
  const save=useMutation({mutationFn:()=>editing?spaceHotspotsAdmin.update(spaceId,sceneId,editing.id,draft):spaceHotspotsAdmin.create(spaceId,sceneId,draft),onSuccess:()=>{reset();void queryClient.invalidateQueries({queryKey:['operations','spaces',spaceId,'scenes',sceneId,'hotspots']})}})
  const remove=useMutation({mutationFn:(id:string)=>spaceHotspotsAdmin.delete(spaceId,sceneId,id),onSuccess:()=>void queryClient.invalidateQueries({queryKey:['operations','spaces',spaceId,'scenes',sceneId,'hotspots']})})
  function reset(){setEditing(null);setDraft(emptyDraft)}
  function edit(item:SpaceHotspotDto){setEditing(item);setDraft({title:item.title,description:item.description??'',yaw:item.yaw,pitch:item.pitch,type:item.type,targetSceneId:item.targetSceneId??null,resourceId:item.resourceId??null})}
  return <section className="ops-v2 catalog-admin">
    <header className="ops-v2__hero"><div><span className="eyebrow">ADMINISTRAÇÃO · ESPAÇOS</span><h1>Hotspots</h1><p>Pontos interativos ligados a cenas 360 reais. Nenhum hotspot é criado automaticamente.</p></div></header>
    <section className="catalog-admin__layout"><main className="catalog-admin__main">
      <div className="catalog-admin__toolbar"><div><span className="eyebrow">CONTEXTO</span><h2>Hotspots configurados</h2></div><div className="catalog-admin__two"><label><span>Espaço</span><select value={spaceId} onChange={(e)=>{setSpaceId(e.target.value);setSceneId('');reset()}}><option value="">Selecionar espaço</option>{spaces.data?.items.filter((item)=>item.active).map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span>Cena</span><select value={sceneId} onChange={(e)=>{setSceneId(e.target.value);reset()}} disabled={!spaceId}><option value="">Selecionar cena</option>{scenes.data?.map((item)=><option key={item.id} value={item.id}>{item.title||item.panoramaUrl}</option>)}</select></label></div></div>
      {spaces.isLoading||scenes.isLoading?<LoadingState label="A carregar contexto."/>:spaces.isError||scenes.isError?<ErrorState title="Não foi possível carregar o contexto."/>:!sceneId?<div className="catalog-admin__empty"><h3>Selecione uma cena.</h3></div>:hotspots.isLoading?<LoadingState label="A carregar hotspots."/>:hotspots.isError?<ErrorState title="Não foi possível carregar os hotspots."/>:(hotspots.data?.length??0)?<div className="catalog-admin__list">{hotspots.data?.map((item)=><article key={item.id} className="catalog-admin__row"><div className="catalog-admin__row-order"><span>{item.type}</span></div><div className="catalog-admin__row-copy"><strong>{item.title}</strong><p>{item.description||'Sem descrição.'}</p><small>Yaw {item.yaw} · Pitch {item.pitch}{item.targetSceneId?' · liga a outra cena':''}</small></div>{can('space.manage')?<div className="catalog-admin__actions"><button type="button" onClick={()=>edit(item)} aria-label="Editar hotspot"><Pencil size={16}/></button><button type="button" onClick={()=>remove.mutate(item.id)} disabled={remove.isPending} aria-label="Eliminar hotspot"><Trash2 size={16}/></button></div>:null}</article>)}</div>:<div className="catalog-admin__empty"><h3>Sem hotspots configurados.</h3></div>}
    </main><aside className="catalog-admin__editor"><div className="catalog-admin__editor-heading"><div><span className="eyebrow">{editing?'EDITAR':'NOVO'}</span><h2>Hotspot</h2></div>{editing?<button type="button" className="catalog-admin__close" onClick={reset}><X size={17}/></button>:null}</div><div className="catalog-admin__form">
      <label><span>Título</span><input maxLength={200} value={draft.title} onChange={(e)=>setDraft({...draft,title:e.target.value})}/></label>
      <label><span>Descrição</span><textarea rows={4} value={draft.description??''} onChange={(e)=>setDraft({...draft,description:e.target.value})}/></label>
      <label><span>Tipo</span><select value={draft.type} onChange={(e)=>setDraft({...draft,type:e.target.value,targetSceneId:e.target.value==='SCENE'?draft.targetSceneId:null})}><option value="INFO">Informação</option><option value="SCENE">Ligação a cena</option><option value="RESOURCE">Recurso</option></select></label>
      {draft.type==='SCENE'?<label><span>Cena de destino</span><select value={draft.targetSceneId??''} onChange={(e)=>setDraft({...draft,targetSceneId:e.target.value||null})}><option value="">Selecionar cena</option>{scenes.data?.filter((item)=>item.id!==sceneId).map((item)=><option key={item.id} value={item.id}>{item.title||item.panoramaUrl}</option>)}</select></label>:null}
      <div className="catalog-admin__two"><label><span>Yaw</span><input type="number" step="0.1" value={draft.yaw} onChange={(e)=>setDraft({...draft,yaw:Number(e.target.value)})}/></label><label><span>Pitch</span><input type="number" step="0.1" value={draft.pitch} onChange={(e)=>setDraft({...draft,pitch:Number(e.target.value)})}/></label></div>
      {save.isError?<p className="field-error" role="alert">Não foi possível guardar o hotspot.</p>:null}
      <button type="button" className="ds-button ds-button--primary" disabled={!can('space.manage')||!sceneId||!draft.title.trim()||save.isPending} onClick={()=>save.mutate()}>{editing?<Check size={16}/>:<Plus size={16}/>} {save.isPending?'A guardar…':'Guardar hotspot'}</button>
    </div></aside></section>
  </section>
}
