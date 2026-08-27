import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Clock3 } from 'lucide-react'
import { useService, useServices } from '../hooks'
import { Alert, EmptyState, ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'
import { Breadcrumbs } from '../../../design-system/patterns/navigation'
import { Badge } from '../../../design-system/primitives'
import type { Service } from '../../../domain/models'

export type CollectionResource<T> = { isLoading: boolean; isError: boolean; data?: { items: T[] } }
export type DetailResource<T> = { isLoading: boolean; isError: boolean; data?: T }

function ServicesIntro({ detail = false }: { detail?: boolean }) {
  return <header className="public-page-intro"><span className="eyebrow">CASTRO’S · SERVIÇOS</span><h1>{detail ? 'Um serviço desenhado para o seu contexto.' : 'Serviços para contextos que pedem clareza.'}</h1><p>Conteúdo editorial e informação de serviço serão apresentados a partir de dados aprovados. Sem promessas, preços ou características não confirmadas.</p></header>
}

export function ServicesCatalog() {
  return <ServiceCollectionView resource={useServices()} />
}

export function ServiceCollectionView({ resource }: { resource: CollectionResource<Service> }) {
  if (resource.isLoading) return <section className="public-page container"><ServicesIntro /><LoadingState label="A carregar serviços." /></section>
  if (resource.isError) return <section className="public-page container"><ServicesIntro /><ErrorState title="Não foi possível carregar os serviços." /></section>
  if (!resource.data?.items.length) return <section className="public-page container"><ServicesIntro /><EmptyState title="Ainda não existem serviços publicados.">Os serviços disponíveis serão apresentados quando o conteúdo estiver confirmado.</EmptyState><ContactPrompt /></section>
  return <section className="public-page container"><ServicesIntro /><div className="editorial-list" aria-label="Serviços publicados">{resource.data.items.map((service) => <article className="editorial-list__item" key={service.slug}><div><span className="eyebrow">SERVIÇO</span><h2>{service.name}</h2>{service.summary && <p>{service.summary}</p>}{service.bookingEnabled === true && <Badge tone="accent">Disponível para pedido</Badge>}</div><Link className="text-link" to={`/servicos/${service.slug}`}>Ver serviço <ArrowRight size={16} /></Link></article>)}</div><ContactPrompt /></section>
}

export function ServiceDetail() {
  const { slug } = useParams()
  return <ServiceDetailView resource={useService(slug)} />
}

export function ServiceDetailView({ resource }: { resource: DetailResource<Service> }) {
  if (resource.isLoading) return <section className="public-page container"><LoadingState label="A carregar serviço." /></section>
  if (resource.isError) return <section className="public-page container"><ErrorState title="Não foi possível carregar este serviço." /><Link className="text-link" to="/servicos">Voltar aos serviços</Link></section>
  if (!resource.data) return <section className="public-page container"><EmptyState title="Serviço não encontrado.">O endereço não corresponde a um serviço disponível.</EmptyState><Link className="text-link" to="/servicos">Voltar aos serviços</Link></section>
  const service = resource.data
  return <section className="public-page container"><Breadcrumbs items={[{ label: 'Serviços', href: '/servicos' }, { label: service.name }]} /><ServicesIntro detail /><div className="editorial-detail"><div className="editorial-detail__main"><h2>{service.name}</h2><p>{service.description ?? service.summary ?? '[CONTENT TBD]'}</p>{service.durationMinutes !== undefined && <p className="metadata"><Clock3 size={16} />{service.durationMinutes} minutos</p>}{service.bookingEnabled === true && <Alert tone="info" title="Pedido disponível">A disponibilidade e as condições serão confirmadas pelo backend.</Alert>}</div><aside className="editorial-detail__aside"><div className="media-placeholder" aria-label="Fotografia do serviço por confirmar"><span>FOTOGRAFIA REAL · A CONFIRMAR</span></div><ContactPrompt /></aside></div></section>
}

function ContactPrompt() { return <div className="contact-prompt"><h2>Quer falar sobre o seu contexto?</h2><p>Envie um pedido de contacto com o tipo de conversa que pretende iniciar.</p><Link className="ds-button ds-button--primary" to="/contacto">Falar connosco <ArrowRight size={16} /></Link></div> }
