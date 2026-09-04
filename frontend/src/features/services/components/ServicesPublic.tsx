import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Clock3, Headphones, Scale, UsersRound, Presentation } from 'lucide-react'
import { useService, useServices } from '../hooks'
import { Alert, EmptyState, ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'
import { Breadcrumbs } from '../../../design-system/patterns/navigation'
import { Badge } from '../../../design-system/primitives'
import type { Service } from '../../../domain/models'
import { bookingRoute } from '../../booking/routes'
import { contactHref } from '../../contact/intent'
import { PublicContactChannels } from '../../contact/PublicContactChannels'

export type CollectionResource<T> = { isLoading: boolean; isError: boolean; data?: { items: T[] } }
export type DetailResource<T> = { isLoading: boolean; isError: boolean; data?: T }

const confirmedAreas = [
  { number: '01', title: 'Atendimento ao Cliente', description: 'Relações de atendimento como parte da experiência, da confiança e da presença de uma organização.', icon: Headphones },
  { number: '02', title: 'Ética & Liderança Organizacional', description: 'Conversas e desenvolvimento em torno de responsabilidade, liderança e cultura organizacional.', icon: Scale },
  { number: '03', title: 'Palestras, Workshops & Formação', description: 'Formatos de aprendizagem e partilha para equipas, organizações e diferentes contextos profissionais.', icon: Presentation },
  { number: '04', title: 'Treinamento Corporativo Personalizado', description: 'Formação desenhada em torno das necessidades e do contexto de cada organização.', icon: UsersRound },
]

function ServicesIntro({ detail = false }: { detail?: boolean }) {
  return <header className={`services-v2-intro ${detail ? 'services-v2-intro--detail' : ''}`}>
    <div><span className="eyebrow">CASTRO’S · SERVIÇOS</span><h1>{detail ? 'Um serviço começa por compreender o contexto.' : <>Clareza para relações, <em>liderança</em> e organizações.</>}</h1></div>
    <div className="services-v2-intro__side"><span className="services-v2-index">SERVIÇOS / 01</span><p>Consultoria e desenvolvimento para contextos onde atendimento, ética, liderança e capacidade interna precisam avançar juntos.</p></div>
  </header>
}

export function ServicesCatalog() {
  return <ServiceCollectionView resource={useServices()} />
}

export function ServiceCollectionView({ resource }: { resource: CollectionResource<Service> }) {
  return <div className="services-v2-page">
    <section className="container public-v2-page"><ServicesIntro />
      <div className="services-v2-areas" aria-label="Áreas de atuação Castro’s">
        {confirmedAreas.map(({ number, title, description, icon: Icon }) => <article key={title} className="services-v2-area"><div className="services-v2-area__top"><span>{number}</span><Icon size={20} aria-hidden="true" /></div><h2>{title}</h2><p>{description}</p></article>)}
      </div>
    </section>

    <section className="services-v2-catalog">
      <div className="container services-v2-catalog__grid">
        <div className="services-v2-catalog__heading"><span className="eyebrow eyebrow--light">CATÁLOGO</span><h2>Serviços publicados</h2><p>Cada serviço pode ser configurado pela Castro’s como agendável ou apenas orientado a pedido. O website segue essa decisão automaticamente.</p></div>
        <div className="services-v2-catalog__content">
          {resource.isLoading && <LoadingState label="A carregar serviços." />}
          {resource.isError && <ErrorState title="Não foi possível carregar os serviços." />}
          {!resource.isLoading && !resource.isError && !resource.data?.items.length && <EmptyState title="Catálogo em preparação">A estrutura está pronta para receber os serviços publicados sem inventar informação comercial.</EmptyState>}
          {resource.data?.items.length ? <div className="services-v2-list">{resource.data.items.map((service, index) => <article key={service.slug}><span className="services-v2-list__number">{String(index + 1).padStart(2, '0')}</span><div><h3>{service.name}</h3>{service.summary && <p>{service.summary}</p>}{service.bookingEnabled === true && <Badge tone="accent">Agendamento online</Badge>}</div><Link to={`/servicos/${service.slug}`} aria-label={`Ver ${service.name}`}><ArrowUpRight size={20} /></Link></article>)}</div> : null}
        </div>
      </div>
    </section>

    <section className="container services-v2-close"><div><span className="eyebrow">CONVERSA INICIAL</span><h2>Nem todos os desafios começam com um serviço pronto.</h2></div><div><p>Se a necessidade ainda não cabe numa categoria, comece pelo contexto. A nossa equipa recebe o pedido e pode encaminhá-lo sem o obrigar a escolher novamente uma área.</p><Link className="ds-button ds-button--primary" to={contactHref({ type: 'CONSULTATION', sourceType: 'GENERAL', cta: 'SERVICES_GENERAL_CONTACT' })}>Partilhar o contexto <ArrowRight size={17} /></Link></div></section>
  </div>
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
  const bookingBase = bookingRoute('SERVICE', service.id, 'selection')
  const bookingHref = service.durationMinutes && service.durationMinutes > 0 ? `${bookingBase}?duration=${service.durationMinutes}` : bookingBase
  const contact = contactHref({ type: 'CONSULTATION', sourceType: 'SERVICE', entityId: service.id, cta: 'SERVICE_CONTACT', message: `Gostaria de falar sobre ${service.name}.` })
  const schedulingReady = service.bookingEnabled === true && Boolean(service.durationMinutes && service.durationMinutes > 0)
  const manualConfirmation = service.confirmationMode !== 'AUTOMATIC'

  return <div className="service-detail-v2">
    <section className="container public-v2-page"><Breadcrumbs items={[{ label: 'Serviços', href: '/servicos' }, { label: service.name }]} /><ServicesIntro detail />
      <div className="service-detail-v2__grid">
        <div className="service-detail-v2__main"><span className="eyebrow">SERVIÇO</span><h2>{service.name}</h2><p className="service-detail-v2__description">{service.description ?? service.summary ?? 'Conteúdo detalhado pendente de publicação.'}</p>{service.durationMinutes !== undefined && <p className="metadata"><Clock3 size={16} />{service.durationMinutes} minutos</p>}{schedulingReady && <Alert tone="info" title="Agendamento online disponível">Escolha uma data e um horário livre. {manualConfirmation ? 'A marcação fica pendente até confirmação da Castro’s.' : 'A marcação pode ser confirmada automaticamente se o slot continuar disponível.'}</Alert>}</div>
        <aside className="service-detail-v2__aside"><div className="service-detail-v2__art" aria-hidden="true"><span>CASTRO’S</span><strong>{service.name}</strong><i /><i /><i /></div><div className="service-detail-v2__action"><span className="eyebrow">PRÓXIMO PASSO</span><h3>{schedulingReady ? 'Quer agendar uma conversa ou esclarecer algo primeiro?' : 'Quer conversar sobre este serviço?'}</h3>{schedulingReady ? <Link className="ds-button ds-button--primary" to={bookingHref}>Agendar uma conversa <ArrowRight size={16} /></Link> : null}<Link className={schedulingReady ? 'text-link' : 'ds-button ds-button--primary'} to={contact}>Falar com a Castro’s {schedulingReady ? null : <ArrowRight size={16} />}</Link><PublicContactChannels contextMessage={`Olá. Estou no website da Castro’s Services e gostaria de esclarecer uma questão sobre ${service.name}.`} contactHref={contact} /></div></aside>
      </div>
    </section>
  </div>
}
