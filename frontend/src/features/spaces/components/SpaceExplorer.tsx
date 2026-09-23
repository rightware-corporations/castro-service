import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Expand, Maximize2, Minus, Plus, RotateCw } from 'lucide-react'
import { ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'
import { useSpace } from '../hooks'
import { spacePublicExperience } from '../../../api/client/spacePublicExperience'
import { projectPanoramaPoint } from './panoramaGeometry'
import { formatCapacity } from './spacePresentation'
import './spaces-catalog-focus.css'

export function SpaceExplorer() {
  const { slug } = useParams()
  const query = useSpace(slug)
  const [infoOpen, setInfoOpen] = useState(false)
  const [selectedSceneId, setSelectedSceneId] = useState('')
  const [activeHotspotId, setActiveHotspotId] = useState('')
  const [zoom, setZoom] = useState(1)
  const [failedPanorama, setFailedPanorama] = useState('')
  const [imageSize, setImageSize] = useState({ url: '', width: 0, height: 0 })
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const infoTriggerRef = useRef<HTMLButtonElement>(null)
  const infoCloseRef = useRef<HTMLButtonElement>(null)
  const hotspotTriggerRef = useRef<HTMLButtonElement | null>(null)
  const spaceId = query.data?.id ?? ''
  const scenes = useQuery({ queryKey: ['public', 'spaces', spaceId, 'scenes'], queryFn: () => spacePublicExperience.listScenes(spaceId), enabled: Boolean(spaceId) })
  const scene = !scenes.isLoading && !scenes.isError ? scenes.data?.find((item) => item.id === selectedSceneId) ?? scenes.data?.[0] : undefined
  const panoramaReady = Boolean(scene && failedPanorama !== scene.panoramaUrl)
  const sceneId = scene?.id ?? ''
  const hotspots = useQuery({ queryKey: ['public', 'spaces', spaceId, 'scenes', sceneId, 'hotspots'], queryFn: () => spacePublicExperience.listHotspots(spaceId, sceneId), enabled: Boolean(spaceId && sceneId) })
  const visibleHotspots = !hotspots.isLoading && !hotspots.isError && panoramaReady ? hotspots.data ?? [] : []
  const activeHotspot = visibleHotspots.find((item) => item.id === activeHotspotId)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const measure = () => setViewport({ width: canvas.clientWidth, height: canvas.clientHeight })
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [scene?.panoramaUrl, query.data?.id])

  useEffect(() => {
    if (infoOpen) infoCloseRef.current?.focus()
  }, [infoOpen])

  useEffect(() => {
    if (!infoOpen && !activeHotspotId) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (infoOpen) { setInfoOpen(false); infoTriggerRef.current?.focus() }
      else { setActiveHotspotId(''); hotspotTriggerRef.current?.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [infoOpen, activeHotspotId])

  if (query.isLoading) return <section className="public-page container"><LoadingState label="A preparar o explorador." /></section>
  if (query.isError || !query.data) return <section className="public-page container"><ErrorState title="Não foi possível abrir este espaço." /><Link className="text-link" to="/espacos">Voltar aos espaços</Link></section>
  const space = query.data
  const selectScene = (id: string) => { setSelectedSceneId(id); setActiveHotspotId(''); setZoom(1) }
  const nextScene = () => {
    const items = scenes.data ?? []
    if (!items.length) return
    const current = Math.max(items.findIndex((item) => item.id === scene?.id), 0)
    selectScene(items[(current + 1) % items.length].id)
  }
  const fullScreen = () => { void canvasRef.current?.requestFullscreen?.().catch(() => { /* Keep the normal explorer usable when fullscreen is denied. */ }) }
  const closeInfo = () => { setInfoOpen(false); infoTriggerRef.current?.focus() }
  const sceneCount = scene ? scenes.data?.length ?? 0 : 0

  return <div className="space-explorer-v2">
    <div className="space-explorer-v2__top"><Link to={`/espacos/${encodeURIComponent(space.slug)}`}><ArrowLeft size={16} />Voltar</Link><span>{space.name}</span><button ref={infoTriggerRef} type="button" onClick={() => { setActiveHotspotId(''); setInfoOpen((value) => !value) }} aria-expanded={infoOpen} aria-controls="space-explorer-information">Informação</button></div>
    <div ref={canvasRef} className="space-explorer-v2__canvas" aria-label="Explorador panorâmico do espaço">
      {scenes.isLoading && <LoadingState label="A carregar cenas do espaço." />}
      {scenes.isError && <ErrorState title="Não foi possível carregar as cenas deste espaço." />}
      {!scenes.isLoading && !scenes.isError && !scene && <div className="space-explorer-v2__empty"><span className="eyebrow eyebrow--light">EXPLORADOR</span><strong>Panorama ainda não publicado.</strong><p>O explorador ficará disponível quando existir uma cena real publicada para este espaço.</p></div>}
      {scene && <>
        {panoramaReady ? <img onLoad={(event) => setImageSize({ url: scene.panoramaUrl, width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} onError={() => setFailedPanorama(scene.panoramaUrl)} className="space-explorer-v2__panorama" src={scene.panoramaUrl} alt={scene.title ? `Panorama: ${scene.title}` : `Panorama de ${space.name}`} draggable={false} style={{ transform: `scale(${zoom})` }} /> : <ErrorState title="Não foi possível apresentar este panorama." /> }
        <div className="space-explorer-v2__scene-label" aria-live="polite"><span>{scene.title || 'CENA PANORÂMICA'}</span><small>{sceneCount} {sceneCount === 1 ? 'cena publicada' : 'cenas publicadas'}</small></div>
        {visibleHotspots.map((hotspot) => {
          const position = imageSize.url === scene.panoramaUrl ? projectPanoramaPoint(hotspot.yaw, hotspot.pitch, imageSize.width, imageSize.height, viewport.width, viewport.height, zoom) : null
          if (!position) return null
          return <button key={hotspot.id} className={`space-explorer-v2__hotspot ${activeHotspotId === hotspot.id ? 'is-active' : ''}`} type="button" aria-label={hotspot.targetSceneId ? `${hotspot.title}. Abrir outra cena.` : `${hotspot.title}. Ver informação.`} aria-expanded={hotspot.targetSceneId ? undefined : activeHotspotId === hotspot.id} onClick={(event) => { hotspotTriggerRef.current = event.currentTarget; if (hotspot.targetSceneId) selectScene(hotspot.targetSceneId); else setActiveHotspotId((value) => value === hotspot.id ? '' : hotspot.id) }} style={position}><span aria-hidden="true">{hotspot.targetSceneId ? '↗' : 'i'}</span></button> })}
        {activeHotspot && <div className="space-explorer-v2__hotspot-card" role="status"><span className="eyebrow eyebrow--light">PONTO DO ESPAÇO</span><strong>{activeHotspot.title}</strong>{activeHotspot.description && <p>{activeHotspot.description}</p>}{activeHotspot.resourceName && <small>{activeHotspot.resourceName}</small>}<button type="button" onClick={() => { setActiveHotspotId(''); hotspotTriggerRef.current?.focus() }}>Fechar</button></div>}
        {sceneCount > 1 && <nav className="space-explorer-v2__scenes" aria-label="Cenas publicadas">{(scenes.data ?? []).map((item, index) => <button key={item.id} type="button" aria-pressed={item.id === scene.id} onClick={() => selectScene(item.id)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.title || `Cena ${index + 1}`}</strong></button>)}</nav>}
      </>}
      <div className="space-explorer-v2__controls" aria-label="Controlos do explorador"><button type="button" aria-label="Cena seguinte" onClick={nextScene} disabled={sceneCount < 2}><RotateCw size={18} /></button><button type="button" aria-label="Aumentar zoom" onClick={() => setZoom((value) => Math.min(2, value + 0.15))} disabled={!panoramaReady || zoom >= 2}><Plus size={18} /></button><button type="button" aria-label="Diminuir zoom" onClick={() => setZoom((value) => Math.max(1, value - 0.15))} disabled={!panoramaReady || zoom <= 1}><Minus size={18} /></button><button type="button" aria-label="Ecrã inteiro" onClick={fullScreen}><Maximize2 size={18} /></button></div>
      <div className="space-explorer-v2__hint"><Expand size={15} /><span>{panoramaReady ? 'Use os pontos publicados para conhecer detalhes ou mudar de cena.' : scenes.isLoading ? 'A carregar panorama.' : scenes.isError || scene ? 'Panorama indisponível.' : 'Sem panorama publicado.'}</span></div>
    </div>
    {infoOpen && <aside id="space-explorer-information" className="space-explorer-v2__info" aria-label={`Informação sobre ${space.name}`}><button ref={infoCloseRef} type="button" onClick={closeInfo} aria-label="Fechar informação">Fechar</button><span className="eyebrow">SOBRE O ESPAÇO</span><h2>{space.name}</h2><p>{space.description ?? 'Conteúdo detalhado pendente.'}</p><div><small>Capacidade</small><strong>{formatCapacity(space)}</strong></div>{space.location && <div><small>Localização</small><strong>{space.location}</strong></div>}{scene && <div><small>Cena atual</small><strong>{scene.title || 'Sem título'}</strong></div>}<Link className="ds-button ds-button--primary" to={`/espacos/${encodeURIComponent(space.slug)}/configurar`}>Configurar este espaço <ArrowRight size={16} /></Link></aside>}
  </div>
}
