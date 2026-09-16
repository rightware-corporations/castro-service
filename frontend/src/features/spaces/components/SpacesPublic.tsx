import { projectPanoramaPoint } from './panoramaGeometry'
import './spaces-catalog-focus.css'
import { PublishedCatalogFocus } from '../../../design-system/patterns/PublishedCatalogFocus'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, Compass, Expand, Eye, GraduationCap, MapPin, Maximize2, Minus, Plus, RotateCw, UsersRound } from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'
import { Breadcrumbs } from '../../../design-system/patterns/navigation'
import { Button } from '../../../design-system/primitives'
import type { Space } from '../../../domain/models'
import { bookingRoute } from '../../booking/routes'
import { useSpace, useSpaces } from '../hooks'
import { spacePublicExperience } from '../../../api/client/spacePublicExperience'

const purposeOptions = [
  { value: 'meeting', label: 'Reunião', icon: UsersRound },
  { value: 'training', label: 'Formação', icon: GraduationCap },
  { value: 'workshop', label: 'Workshop', icon: Compass },
  { value: 'other', label: 'Outro encontro', icon: Building2 },
]

export function SpacesCatalog() {
  const query = useSpaces()
  return <div className="spaces-v2-page">
    <section className="container spaces-v2-intro">
      <div><span className="eyebrow">CASTRO’S · ESPAÇOS</span><h1>Um espaço para <em>encontrar, aprender</em> e trabalhar.</h1></div>
      <div className="spaces-v2-intro__side"><span>ESPAÇOS</span><p>Conheça os ambientes Castro’s antes do encontro. Consulte os detalhes e prepare o espaço para o seu encontro.</p></div>
    </section>

    <section className="container spaces-v2-catalog" aria-label="Espaços publicados">
      {query.isLoading && <LoadingState label="A carregar espaços." />}
      {query.isError && <ErrorState title="Não foi possível carregar os espaços." />}
      {!query.isLoading && !query.isError && !query.data?.items.length && <EmptyState title="Catálogo em preparação">Os espaços surgirão aqui assim que forem publicados no sistema.</EmptyState>}
      {!query.isLoading && !query.isError && query.data?.items.length ? <PublishedCatalogFocus items={query.data.items} label="Selecionar espaço publicado" frame="P03">{(space) => <SpaceCatalogItem key={space.id} space={space} index={query.data!.items.findIndex((item) => item.id === space.id)} />}</PublishedCatalogFocus> : null}
    </section>

    <section className="spaces-v2-experience-band"><div className="container"><div><span className="eyebrow eyebrow--light">EXPERIÊNCIA DIGITAL</span><h2>Veja primeiro. Configure depois. Reserve quando fizer sentido.</h2></div><div className="spaces-v2-experience-flow"><span>01 <strong>Explorar</strong></span><ArrowRight size={17} /><span>02 <strong>Configurar</strong></span><ArrowRight size={17} /><span>03 <strong>Reservar</strong></span></div></div></section>
  </div>
}

function SpaceMediaPreview({ space, index, variant }: { space: Space; index?: number; variant: 'catalog' | 'detail' | 'config' }) {
  const scenes = useQuery({
    queryKey: ['public', 'spaces', space.id, 'scenes'],
    queryFn: () => spacePublicExperience.listScenes(space.id),
    enabled: Boolean(space.id),
    staleTime: 5 * 60 * 1000,
  })
  const [failedUrl, setFailedUrl] = useState('')
  const scene = !scenes.isLoading && !scenes.isError ? scenes.data?.[0] : undefined
  const mediaReady = Boolean(scene && failedUrl !== scene.panoramaUrl)
  const prefix = variant === 'detail' ? 'space-detail-v2' : variant === 'config' ? 'space-config-v2' : 'space-v2-card'
  const sceneCount = scenes.data?.length ?? 0
  const status = scenes.isLoading
    ? 'A preparar pré-visualização'
    : scenes.isError || Boolean(scene && !mediaReady)
      ? 'Pré-visualização indisponível'
      : scene
        ? `${sceneCount} ${sceneCount === 1 ? 'cena publicada' : 'cenas publicadas'}`
        : 'Imagem a publicar'
  const label = variant === 'detail' ? 'EXPERIÊNCIA ESPACIAL' : variant === 'config' ? 'PRÉ-VISUALIZAÇÃO' : `ESPAÇO ${String((index ?? 0) + 1).padStart(2, '0')}`

  return <div className={`${prefix}__visual ${mediaReady ? 'has-media' : 'is-empty'}`} aria-label={`Pré-visualização de ${space.name}`}>
    {scene && mediaReady ? <img onError={() => setFailedUrl(scene.panoramaUrl)} className={`${prefix}__image`} src={scene.panoramaUrl} alt={scene.title ? `${scene.title} — ${space.name}` : `Vista panorâmica de ${space.name}`} loading={variant === 'detail' ? 'eager' : 'lazy'} draggable={false} /> : <div className={`${prefix}__media-empty`} aria-hidden="true" />}
    <div className={`${prefix}__media-overlay`}><span>{label}</span><small>{status}</small></div>
  </div>
}

function SpaceCatalogItem({ space, index }: { space: Space; index: number }) {
  const summary = space.summary ?? space.description
  return <article className="space-v2-card">
    <SpaceMediaPreview space={space} index={index} variant="catalog" />
    <div className="space-v2-card__content">
      <div className="space-v2-card__meta"><span>ESPAÇO</span>{space.location && <span><MapPin size={14} />{space.location}</span>}</div>
      <h2>{space.name}</h2>
      {summary && <p>{summary}</p>}
      <div className="space-v2-card__facts">{space.capacityMin !== undefined || space.capacityMax !== undefined ? <span><UsersRound size={16} />{formatCapacity(space)}</span> : <span><UsersRound size={16} />Capacidade a confirmar</span>}</div>
      <div className="space-v2-card__actions"><Link className="ds-button ds-button--primary" to={`/espacos/${encodeURIComponent(space.slug)}`}>Conhecer espaço <ArrowRight size={16} /></Link><Link className="home-v2-link" to={`/espacos/${encodeURIComponent(space.slug)}/explorar`}>Explorar <Eye size={16} /></Link></div>
    </div>
  </article>
}

export function SpaceDetail() {
  const { slug } = useParams()
  const query = useSpace(slug)
  if (query.isLoading) return <section className="public-page container"><LoadingState label="A carregar espaço." /></section>
  if (query.isError) return <section className="public-page container"><ErrorState title="Não foi possível carregar este espaço." /><Link className="text-link" to="/espacos">Voltar aos espaços</Link></section>
  if (!query.data) return <section className="public-page container"><EmptyState title="Espaço não encontrado.">O endereço não corresponde a um espaço publicado.</EmptyState><Link className="text-link" to="/espacos">Voltar aos espaços</Link></section>
  const space = query.data
  return <div className="space-detail-v2">
    <section className="container public-v2-page"><Breadcrumbs items={[{ label: 'Espaços', href: '/espacos' }, { label: space.name }]} />
      <header className="space-detail-v2__hero"><div><span className="eyebrow">CASTRO’S · ESPAÇO</span><h1>{space.name}</h1><p>{space.description ?? 'A descrição detalhada será apresentada quando o conteúdo do espaço estiver publicado.'}</p></div><div className="space-detail-v2__index"><span>ESPAÇO</span>{space.location && <p><MapPin size={15} />{space.location}</p>}</div></header>
      <div className="space-detail-v2__stage"><SpaceMediaPreview space={space} variant="detail" /><aside className="space-detail-v2__panel"><span className="eyebrow">INFORMAÇÃO</span><h2>Prepare o encontro antes de chegar.</h2><div className="space-detail-v2__facts"><div><small>Capacidade</small><strong>{formatCapacity(space)}</strong></div>{space.location && <div><small>Localização</small><strong>{space.location}</strong></div>}</div><Link className="ds-button ds-button--primary" to={`/espacos/${encodeURIComponent(space.slug)}/explorar`}>Explorar espaço <Eye size={17} /></Link><Link className="ds-button ds-button--secondary" to={`/espacos/${encodeURIComponent(space.slug)}/configurar`}>Configurar encontro <ArrowRight size={17} /></Link></aside></div>
    </section>
  </div>
}

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

export function SpaceConfigurator() {
  const { slug } = useParams()
  const query = useSpace(slug)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [purpose, setPurpose] = useState(parsePurpose(searchParams.get('purpose')))
  const initialPeople = parsePeople(searchParams.get('people'))
  const [people, setPeople] = useState<number | ''>(initialPeople)

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (purpose) next.set('purpose', purpose); else next.delete('purpose')
    if (people !== '') next.set('people', String(people)); else next.delete('people')
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true })
  }, [people, purpose, searchParams, setSearchParams])

  if (query.isLoading) return <section className="public-page container"><LoadingState label="A preparar configuração." /></section>
  if (query.isError || !query.data) return <section className="public-page container"><ErrorState title="Não foi possível configurar este espaço." /><Link className="text-link" to="/espacos">Voltar aos espaços</Link></section>
  const space = query.data
  const peopleTooLow = typeof people === 'number' && people < 1
  const peopleTooHigh = typeof people === 'number' && space.capacityMax !== undefined && people > space.capacityMax
  const peopleNotInteger = typeof people === 'number' && !Number.isSafeInteger(people)
  const peopleInvalid = peopleTooLow || peopleTooHigh || peopleNotInteger
  const peopleError = peopleNotInteger ? 'Indique um número inteiro de participantes.' : peopleTooLow ? 'O número de participantes deve ser pelo menos 1.' : peopleTooHigh ? `O valor ultrapassa a capacidade publicada de ${space.capacityMax}.` : ''
  const purposeLabel = purposeOptions.find((item) => item.value === purpose)?.label
  const bookingParams = new URLSearchParams()
  if (purpose) bookingParams.set('purpose', purpose)
  if (people !== '') bookingParams.set('people', String(people))
  const bookingHref = `${bookingRoute('SPACE', space.id, 'selection')}?${bookingParams.toString()}`

  return <div className="space-config-v2">
    <section className="container space-config-v2__header"><Breadcrumbs items={[{ label: 'Espaços', href: '/espacos' }, { label: space.name, href: `/espacos/${encodeURIComponent(space.slug)}` }, { label: 'Configurar' }]} /><div><span className="eyebrow">CONFIGURAR ESPAÇO</span><h1>Prepare o encontro <em>à sua maneira.</em></h1><p>Indique a finalidade do encontro e o número previsto de participantes.</p></div></section>
    <section className="container space-config-v2__layout">
      <div className="space-config-v2__controls">
        <div className="space-config-v2__section"><div className="space-config-v2__section-title"><span>01</span><div><h2>Qual é o tipo de encontro?</h2><p>Selecione a opção que melhor descreve o seu encontro.</p></div></div><div className="space-config-v2__purpose">{purposeOptions.map(({ value, label, icon: Icon }) => <button className={purpose === value ? 'is-selected' : ''} key={value} type="button" onClick={() => setPurpose(value)} aria-pressed={purpose === value}><Icon size={19} /><span>{label}</span><ArrowUpRight size={15} /></button>)}</div></div>
        <div className="space-config-v2__section"><div className="space-config-v2__section-title"><span>02</span><div><h2>Quantas pessoas?</h2><p>{space.capacityMax !== undefined ? `O espaço publicado indica capacidade máxima de ${space.capacityMax}.` : 'Indique o número previsto de participantes.'}</p></div></div><label className="space-config-v2__people"><span>Participantes</span><input type="number" step="1" min="1" max={space.capacityMax} value={people} onChange={(event) => setPeople(event.target.value === '' ? '' : Number(event.target.value))} aria-invalid={peopleInvalid} aria-describedby={peopleInvalid ? 'space-config-people-error' : undefined} />{peopleInvalid && <small id="space-config-people-error">{peopleError}</small>}</label></div>
        <div className="space-config-v2__section space-config-v2__pending"><div className="space-config-v2__section-title"><span>03</span><div><h2>Layout & recursos</h2><p>As opções serão apresentadas quando existirem configurações reais publicadas para este espaço.</p><small className="space-config-v2__pending-label">AINDA NÃO PUBLICADO</small></div></div></div>
      </div>
      <aside className="space-config-v2__summary"><SpaceMediaPreview space={space} variant="config" /><span className="eyebrow">RESUMO</span><h2>{space.name}</h2><dl><div><dt>Finalidade</dt><dd>{purposeLabel ?? 'A escolher'}</dd></div><div><dt>Participantes</dt><dd>{people === '' ? 'A indicar' : people}</dd></div><div><dt>Capacidade</dt><dd>{formatCapacity(space)}</dd></div></dl><Button disabled={!purpose || people === '' || peopleInvalid} onClick={() => navigate(bookingHref)}>Ver disponibilidade <ArrowRight size={16} /></Button><small>A disponibilidade será calculada pelo sistema no próximo passo.</small></aside>
    </section>
  </div>
}


function formatCapacity(space: Space) {
  if (space.capacityMin !== undefined && space.capacityMax !== undefined) return `${space.capacityMin}–${space.capacityMax} pessoas`
  if (space.capacityMax !== undefined) return `Até ${space.capacityMax} pessoas`
  if (space.capacityMin !== undefined) return `A partir de ${space.capacityMin} pessoas`
  return 'A confirmar'
}

function parsePurpose(value: string | null) {
  return purposeOptions.some((option) => option.value === value) ? value ?? '' : ''
}

function parsePeople(value: string | null): number | '' {
  if (!value) return ''
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : ''
}
