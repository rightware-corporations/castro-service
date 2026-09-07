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
      <div className="spaces-v2-intro__side"><span>ESPAÇOS</span><p>Conheça os ambientes Castro’s antes do encontro. A experiência evolui de descoberta para exploração, configuração e reserva.</p></div>
    </section>

    <section className="container spaces-v2-catalog" aria-label="Espaços publicados">
      {query.isLoading && <LoadingState label="A carregar espaços." />}
      {query.isError && <ErrorState title="Não foi possível carregar os espaços." />}
      {!query.isLoading && !query.isError && !query.data?.items.length && <EmptyState title="Catálogo em preparação">Os espaços surgirão aqui assim que forem publicados no sistema.</EmptyState>}
      {query.data?.items.length ? <div className="spaces-v2-list">{query.data.items.map((space, index) => <SpaceCatalogItem key={space.slug} space={space} index={index} />)}</div> : null}
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
  const scene = scenes.data?.[0]
  const prefix = variant === 'detail' ? 'space-detail-v2' : variant === 'config' ? 'space-config-v2' : 'space-v2-card'
  const sceneCount = scenes.data?.length ?? 0
  const status = scenes.isLoading
    ? 'A preparar pré-visualização'
    : scenes.isError
      ? 'Pré-visualização indisponível'
      : scene
        ? `${sceneCount} ${sceneCount === 1 ? 'cena publicada' : 'cenas publicadas'}`
        : 'Imagem a publicar'
  const label = variant === 'detail' ? 'EXPERIÊNCIA ESPACIAL' : variant === 'config' ? 'PRÉ-VISUALIZAÇÃO' : `ESPAÇO ${String((index ?? 0) + 1).padStart(2, '0')}`

  return <div className={`${prefix}__visual ${scene ? 'has-media' : 'is-empty'}`} aria-label={`Pré-visualização de ${space.name}`}>
    {scene ? <img className={`${prefix}__image`} src={scene.panoramaUrl} alt={scene.title ? `${scene.title} — ${space.name}` : `Vista panorâmica de ${space.name}`} loading={variant === 'detail' ? 'eager' : 'lazy'} draggable={false} /> : <div className={`${prefix}__media-empty`} aria-hidden="true" />}
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
      <div className="space-v2-card__actions"><Link className="ds-button ds-button--primary" to={`/espacos/${space.slug}`}>Conhecer espaço <ArrowRight size={16} /></Link><Link className="home-v2-link" to={`/espacos/${space.slug}/explorar`}>Explorar <Eye size={16} /></Link></div>
    </div>
  </article>
}

export function SpaceDetail() {
  const { slug } = useParams()
  const query = useSpace(slug)
  if (query.isLoading) return <section className="public-page container"><LoadingState label="A carregar espaço." /></section>
  if (query.isError) return <section className="public-page container"><ErrorState title="Não foi possível carregar este espaço." /></section>
  if (!query.data) return <section className="public-page container"><EmptyState title="Espaço não encontrado.">O endereço não corresponde a um espaço publicado.</EmptyState></section>
  const space = query.data
  return <div className="space-detail-v2">
    <section className="container public-v2-page"><Breadcrumbs items={[{ label: 'Espaços', href: '/espacos' }, { label: space.name }]} />
      <header className="space-detail-v2__hero"><div><span className="eyebrow">CASTRO’S · ESPAÇO</span><h1>{space.name}</h1><p>{space.description ?? 'A descrição detalhada será apresentada quando o conteúdo do espaço estiver publicado.'}</p></div><div className="space-detail-v2__index"><span>ESPAÇO</span>{space.location && <p><MapPin size={15} />{space.location}</p>}</div></header>
      <div className="space-detail-v2__stage"><SpaceMediaPreview space={space} variant="detail" /><aside className="space-detail-v2__panel"><span className="eyebrow">INFORMAÇÃO</span><h2>Prepare o encontro antes de chegar.</h2><div className="space-detail-v2__facts"><div><small>Capacidade</small><strong>{formatCapacity(space)}</strong></div>{space.location && <div><small>Localização</small><strong>{space.location}</strong></div>}</div><Link className="ds-button ds-button--primary" to={`/espacos/${space.slug}/explorar`}>Explorar espaço <Eye size={17} /></Link><Link className="ds-button ds-button--secondary" to={`/espacos/${space.slug}/configurar`}>Configurar encontro <ArrowRight size={17} /></Link></aside></div>
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
  const canvasRef = useRef<HTMLDivElement>(null)
  const infoTriggerRef = useRef<HTMLButtonElement>(null)
  const spaceId = query.data?.id ?? ''
  const scenes = useQuery({ queryKey: ['public', 'spaces', spaceId, 'scenes'], queryFn: () => spacePublicExperience.listScenes(spaceId), enabled: Boolean(spaceId) })
  const scene = scenes.data?.find((item) => item.id === selectedSceneId) ?? scenes.data?.[0]
  const sceneId = scene?.id ?? ''
  const hotspots = useQuery({ queryKey: ['public', 'spaces', spaceId, 'scenes', sceneId, 'hotspots'], queryFn: () => spacePublicExperience.listHotspots(spaceId, sceneId), enabled: Boolean(spaceId && sceneId) })
  const activeHotspot = (hotspots.data ?? []).find((item) => item.id === activeHotspotId)

  useEffect(() => {
    if (!infoOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setInfoOpen(false)
      infoTriggerRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [infoOpen])

  if (query.isLoading) return <section className="public-page container"><LoadingState label="A preparar o explorador." /></section>
  if (query.isError || !query.data) return <section className="public-page container"><ErrorState title="Não foi possível abrir este espaço." /></section>
  const space = query.data
  const selectScene = (id: string) => { setSelectedSceneId(id); setActiveHotspotId(''); setZoom(1) }
  const nextScene = () => {
    const items = scenes.data ?? []
    if (!items.length) return
    const current = Math.max(items.findIndex((item) => item.id === scene?.id), 0)
    selectScene(items[(current + 1) % items.length].id)
  }
  const fullScreen = () => { void canvasRef.current?.requestFullscreen?.() }
  const closeInfo = () => { setInfoOpen(false); infoTriggerRef.current?.focus() }
  const sceneCount = scenes.data?.length ?? 0

  return <div className="space-explorer-v2">
    <div className="space-explorer-v2__top"><Link to={`/espacos/${space.slug}`}><ArrowLeft size={16} />Voltar</Link><span>{space.name}</span><button ref={infoTriggerRef} type="button" onClick={() => setInfoOpen((value) => !value)} aria-expanded={infoOpen} aria-controls="space-explorer-information">Informação</button></div>
    <div ref={canvasRef} className="space-explorer-v2__canvas" aria-label="Explorador panorâmico do espaço">
      {scenes.isLoading && <LoadingState label="A carregar cenas do espaço." />}
      {scenes.isError && <ErrorState title="Não foi possível carregar as cenas deste espaço." />}
      {!scenes.isLoading && !scenes.isError && !scene && <div className="space-explorer-v2__empty"><span className="eyebrow eyebrow--light">EXPLORADOR</span><strong>Panorama ainda não publicado.</strong><p>O explorador ficará disponível quando existir uma cena real publicada para este espaço.</p></div>}
      {scene && <>
        <img className="space-explorer-v2__panorama" src={scene.panoramaUrl} alt={scene.title ? `Panorama: ${scene.title}` : `Panorama de ${space.name}`} draggable={false} style={{ transform: `scale(${zoom})` }} />
        <div className="space-explorer-v2__scene-label" aria-live="polite"><span>{scene.title || 'CENA PANORÂMICA'}</span><small>{sceneCount} {sceneCount === 1 ? 'cena publicada' : 'cenas publicadas'}</small></div>
        {(hotspots.data ?? []).map((hotspot) => <button key={hotspot.id} className={`space-explorer-v2__hotspot ${activeHotspotId === hotspot.id ? 'is-active' : ''}`} type="button" aria-label={hotspot.targetSceneId ? `${hotspot.title}. Abrir outra cena.` : `${hotspot.title}. Ver informação.`} onClick={() => hotspot.targetSceneId ? selectScene(hotspot.targetSceneId) : setActiveHotspotId((value) => value === hotspot.id ? '' : hotspot.id)} style={{ left: `${yawPercent(hotspot.yaw)}%`, top: `${pitchPercent(hotspot.pitch)}%` }}><span aria-hidden="true">{hotspot.targetSceneId ? '↗' : 'i'}</span></button>)}
        {activeHotspot && <div className="space-explorer-v2__hotspot-card" role="status"><span className="eyebrow eyebrow--light">PONTO DO ESPAÇO</span><strong>{activeHotspot.title}</strong>{activeHotspot.description && <p>{activeHotspot.description}</p>}{activeHotspot.resourceName && <small>{activeHotspot.resourceName}</small>}<button type="button" onClick={() => setActiveHotspotId('')}>Fechar</button></div>}
        {sceneCount > 1 && <nav className="space-explorer-v2__scenes" aria-label="Cenas publicadas">{(scenes.data ?? []).map((item, index) => <button key={item.id} type="button" aria-pressed={item.id === scene.id} onClick={() => selectScene(item.id)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.title || `Cena ${index + 1}`}</strong></button>)}</nav>}
      </>}
      <div className="space-explorer-v2__controls" aria-label="Controlos do explorador"><button type="button" aria-label="Cena seguinte" onClick={nextScene} disabled={sceneCount < 2}><RotateCw size={18} /></button><button type="button" aria-label="Aumentar zoom" onClick={() => setZoom((value) => Math.min(2, value + 0.15))} disabled={!scene || zoom >= 2}><Plus size={18} /></button><button type="button" aria-label="Diminuir zoom" onClick={() => setZoom((value) => Math.max(1, value - 0.15))} disabled={!scene || zoom <= 1}><Minus size={18} /></button><button type="button" aria-label="Ecrã inteiro" onClick={fullScreen}><Maximize2 size={18} /></button></div>
      <div className="space-explorer-v2__hint"><Expand size={15} /><span>{scene ? 'Use os pontos publicados para conhecer detalhes ou mudar de cena.' : 'Sem panorama publicado.'}</span></div>
    </div>
    {infoOpen && <aside id="space-explorer-information" className="space-explorer-v2__info" aria-label={`Informação sobre ${space.name}`}><button type="button" onClick={closeInfo} aria-label="Fechar informação">Fechar</button><span className="eyebrow">SOBRE O ESPAÇO</span><h2>{space.name}</h2><p>{space.description ?? 'Conteúdo detalhado pendente.'}</p><div><small>Capacidade</small><strong>{formatCapacity(space)}</strong></div>{space.location && <div><small>Localização</small><strong>{space.location}</strong></div>}{scene && <div><small>Cena atual</small><strong>{scene.title || 'Sem título'}</strong></div>}<Link className="ds-button ds-button--primary" to={`/espacos/${space.slug}/configurar`}>Configurar este espaço <ArrowRight size={16} /></Link></aside>}
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
  if (query.isError || !query.data) return <section className="public-page container"><ErrorState title="Não foi possível configurar este espaço." /></section>
  const space = query.data
  const peopleTooLow = typeof people === 'number' && people < 1
  const peopleTooHigh = typeof people === 'number' && space.capacityMax !== undefined && people > space.capacityMax
  const peopleInvalid = peopleTooLow || peopleTooHigh
  const peopleError = peopleTooLow ? 'O número de participantes deve ser pelo menos 1.' : peopleTooHigh ? `O valor ultrapassa a capacidade publicada de ${space.capacityMax}.` : ''
  const purposeLabel = purposeOptions.find((item) => item.value === purpose)?.label
  const bookingParams = new URLSearchParams()
  if (purpose) bookingParams.set('purpose', purpose)
  if (people !== '') bookingParams.set('people', String(people))
  const bookingHref = `${bookingRoute('SPACE', space.id, 'selection')}?${bookingParams.toString()}`

  return <div className="space-config-v2">
    <section className="container space-config-v2__header"><Breadcrumbs items={[{ label: 'Espaços', href: '/espacos' }, { label: space.name, href: `/espacos/${space.slug}` }, { label: 'Configurar' }]} /><div><span className="eyebrow">CONFIGURAR ESPAÇO</span><h1>Prepare o encontro <em>à sua maneira.</em></h1><p>Escolha apenas o que já pode ser definido sem assumir layouts ou equipamentos ainda não publicados.</p></div></section>
    <section className="container space-config-v2__layout">
      <div className="space-config-v2__controls">
        <div className="space-config-v2__section"><div className="space-config-v2__section-title"><span>01</span><div><h2>Qual é o tipo de encontro?</h2><p>Esta escolha descreve a intenção; não altera regras comerciais.</p></div></div><div className="space-config-v2__purpose">{purposeOptions.map(({ value, label, icon: Icon }) => <button className={purpose === value ? 'is-selected' : ''} key={value} type="button" onClick={() => setPurpose(value)} aria-pressed={purpose === value}><Icon size={19} /><span>{label}</span><ArrowUpRight size={15} /></button>)}</div></div>
        <div className="space-config-v2__section"><div className="space-config-v2__section-title"><span>02</span><div><h2>Quantas pessoas?</h2><p>{space.capacityMax !== undefined ? `O espaço publicado indica capacidade máxima de ${space.capacityMax}.` : 'Indique o número previsto de participantes.'}</p></div></div><label className="space-config-v2__people"><span>Participantes</span><input type="number" min="1" max={space.capacityMax} value={people} onChange={(event) => setPeople(event.target.value === '' ? '' : Number(event.target.value))} aria-invalid={peopleInvalid} aria-describedby={peopleInvalid ? 'space-config-people-error' : undefined} />{peopleInvalid && <small id="space-config-people-error">{peopleError}</small>}</label></div>
        <div className="space-config-v2__section space-config-v2__pending"><div className="space-config-v2__section-title"><span>03</span><div><h2>Layout & recursos</h2><p>As opções serão apresentadas quando existirem configurações reais publicadas para este espaço.</p><small className="space-config-v2__pending-label">AINDA NÃO PUBLICADO</small></div></div></div>
      </div>
      <aside className="space-config-v2__summary"><SpaceMediaPreview space={space} variant="config" /><span className="eyebrow">RESUMO</span><h2>{space.name}</h2><dl><div><dt>Finalidade</dt><dd>{purposeLabel ?? 'A escolher'}</dd></div><div><dt>Participantes</dt><dd>{people === '' ? 'A indicar' : people}</dd></div><div><dt>Capacidade</dt><dd>{formatCapacity(space)}</dd></div></dl><Button disabled={!purpose || people === '' || peopleInvalid} onClick={() => navigate(bookingHref)}>Ver disponibilidade <ArrowRight size={16} /></Button><small>A disponibilidade será calculada pelo sistema no próximo passo.</small></aside>
    </section>
  </div>
}

function yawPercent(yaw: number) { return (((yaw + 180) % 360) + 360) % 360 / 360 * 100 }
function pitchPercent(pitch: number) { return Math.max(4, Math.min(96, (90 - pitch) / 180 * 100)) }

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
  return Number.isFinite(parsed) && parsed > 0 ? parsed : ''
}
