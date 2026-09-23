import './spaces-catalog-focus.css'
import { PublishedCatalogFocus } from '../../../design-system/patterns/PublishedCatalogFocus'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Eye, MapPin, UsersRound } from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'
import { Breadcrumbs } from '../../../design-system/patterns/navigation'
import type { Space } from '../../../domain/models'
import { useSpace, useSpaces } from '../hooks'
import { SpaceMediaPreview } from './SpaceMediaPreview'
import { formatCapacity } from './spacePresentation'

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
