import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, ArrowUpRight, Clock3, Headphones, Scale, UsersRound, Presentation, CheckCircle2 } from 'lucide-react'
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
  {
    number: '01',
    title: 'Atendimento ao Cliente',
    description: 'Relações de atendimento como parte da experiência, da confiança e da presença de uma organização.',
    icon: Headphones,
    themes: ['Experiência do cliente', 'Comunicação', 'Consistência no atendimento'],
    matchTerms: ['atendimento', 'cliente'],
  },
  {
    number: '02',
    title: 'Ética & Liderança Organizacional',
    description: 'Conversas e desenvolvimento em torno de responsabilidade, liderança e cultura organizacional.',
    icon: Scale,
    themes: ['Ética aplicada', 'Liderança', 'Cultura organizacional'],
    matchTerms: ['ética', 'liderança'],
  },
  {
    number: '03',
    title: 'Palestras, Workshops & Formação',
    description: 'Formatos de aprendizagem e partilha para equipas, organizações e diferentes contextos profissionais.',
    icon: Presentation,
    themes: ['Palestras', 'Workshops', 'Aprendizagem em equipa'],
    matchTerms: ['palestra', 'workshop', 'formação'],
  },
  {
    number: '04',
    title: 'Treinamento Corporativo Personalizado',
    description: 'Formação desenhada em torno das necessidades e do contexto de cada organização.',
    icon: UsersRound,
    themes: ['Diagnóstico', 'Programa à medida', 'Aplicação no trabalho'],
    matchTerms: ['treinamento', 'corporativo', 'personalizado'],
  },
]

function ServicesIntro({ detail = false }: { detail?: boolean }) {
  return <header className={`services-v2-intro ${detail ? 'services-v2-intro--detail' : ''}`}>
    <div><span className="eyebrow">CASTRO’S · SERVIÇOS</span><h1>{detail ? 'Um serviço começa por compreender o contexto.' : <>Clareza para relações, <em>liderança</em> e organizações.</>}</h1></div>
    <div className="services-v2-intro__side"><span className="services-v2-index">SERVIÇOS / 01</span><p>Consultoria e desenvolvimento para contextos onde atendimento, ética, liderança e capacidade interna precisam avançar juntos.</p></div>
  </header>
}

function findPublishedService(area: typeof confirmedAreas[number], services: Service[]) {
  return services.find((service) => {
    const haystack = `${service.name} ${service.summary ?? ''} ${service.description ?? ''}`.toLocaleLowerCase('pt-PT')
    return area.matchTerms.some((term) => haystack.includes(term.toLocaleLowerCase('pt-PT')))
  })
}

function ServicesAreaExplorer({ services }: { services: Service[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const reducedMotion = useReducedMotion()
  const activeArea = confirmedAreas[activeIndex]
  const ActiveIcon = activeArea.icon
  const publishedService = findPublishedService(activeArea, services)
  const contact = contactHref({
    type: 'CONSULTATION',
    sourceType: 'GENERAL',
    cta: `SERVICES_AREA_${activeArea.number}`,
    message: `Gostaria de conversar sobre ${activeArea.title}.`,
  })

  return <section className="services-experience" aria-labelledby="services-experience-title">
    <div className="services-experience__head">
      <div><span className="eyebrow">ÁREAS DE ATUAÇÃO</span><h2 id="services-experience-title">Escolha o contexto. Veja o caminho seguinte.</h2></div>
      <p>Cada área liga a um serviço publicado quando existe correspondência no catálogo. Quando ainda não existe um serviço específico, a conversa segue com o contexto já preservado.</p>
    </div>

    <div className="services-experience__grid">
      <div className="services-experience__index" aria-label="Selecionar área de atuação">
        {confirmedAreas.map((area, index) => {
          const selected = index === activeIndex
          const Icon = area.icon
          return <button
            key={area.number}
            type="button"
            className={`services-experience__option ${selected ? 'services-experience__option--active' : ''}`}
            aria-pressed={selected}
            onClick={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
          >
            <span className="services-experience__number">{area.number}</span>
            <span className="services-experience__option-title">{area.title}</span>
            <Icon size={19} aria-hidden="true" />
          </button>
        })}
      </div>

      <div className="services-experience__focus" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={activeArea.number}
            className="services-experience__focus-card"
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: reducedMotion ? 0 : 0.22 }}
          >
            <div className="services-experience__focus-top"><span>ÁREA {activeArea.number}</span><ActiveIcon size={24} aria-hidden="true" /></div>
            <div className="services-experience__focus-copy">
              <div><h3>{activeArea.title}</h3><p>{activeArea.description}</p></div>
              <div className="services-experience__themes" aria-label="Temas desta área">{activeArea.themes.map((theme) => <span key={theme}><CheckCircle2 size={14} aria-hidden="true" />{theme}</span>)}</div>
            </div>
            <div className="services-experience__focus-actions">
              {publishedService ? <Link className="ds-button ds-button--primary" to={`/servicos/${publishedService.slug}`}>Ver serviço publicado <ArrowRight size={16} /></Link> : null}
              <Link className="services-experience__focus-link" to={contact}>{publishedService ? 'Falar sobre esta área' : 'Começar por esta área'} <ArrowUpRight size={18} /></Link>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  </section>
}

export function ServicesCatalog() {
  return <ServiceCollectionView resource={useServices()} />
}

export function ServiceCollectionView({ resource }: { resource: CollectionResource<Service> }) {
  const services = resource.data?.items ?? []
  return <div className="services-v2-page">
    <section className="container public-v2-page"><ServicesIntro /><ServicesAreaExplorer services={services} /></section>

    <section className="services-v2-catalog">
      <div className="container services-v2-catalog__grid">
        <div className="services-v2-catalog__heading"><span className="eyebrow eyebrow--light">CATÁLOGO</span><h2>Serviços publicados</h2><p>Abra um serviço para ver enquadramento, descrição e o próximo passo disponível — pedido de informação ou agendamento, conforme a configuração real.</p></div>
        <div className="services-v2-catalog__content">
          {resource.isLoading && <LoadingState label="A carregar serviços." />}
          {resource.isError && <ErrorState title="Não foi possível carregar os serviços." />}
          {!resource.isLoading && !resource.isError && !services.length && <EmptyState title="Catálogo em preparação">A estrutura está pronta para receber os serviços publicados sem inventar informação comercial.</EmptyState>}
          {services.length ? <div className="services-v2-list">{services.map((service, index) => <article key={service.slug}><span className="services-v2-list__number">{String(index + 1).padStart(2, '0')}</span><div><h3><Link to={`/servicos/${service.slug}`}>{service.name}</Link></h3>{service.summary && <p>{service.summary}</p>}<div className="services-v2-list__meta">{service.bookingEnabled === true ? <Badge tone="accent">Agendamento online</Badge> : <span>Pedido orientado</span>}{service.durationMinutes ? <span>{service.durationMinutes} min</span> : null}</div></div><Link className="services-v2-list__arrow" to={`/servicos/${service.slug}`} aria-label={`Ver ${service.name}`}><ArrowUpRight size={20} /></Link></article>)}</div> : null}
        </div>
      </div>
    </section>

    <section className="container services-v2-close">
      <div><span className="eyebrow">COMO COMEÇAMOS</span><h2>Do contexto para uma decisão útil.</h2></div>
      <div className="services-v2-close__content"><p>Não precisa chegar com o serviço certo escolhido. O percurso pode começar pelo problema, passar pela área mais próxima e terminar num pedido claro.</p><div className="services-v2-close__steps"><span><b>01</b> Partilhe o contexto</span><span><b>02</b> Identifique a área</span><span><b>03</b> Avance para serviço ou conversa</span></div><Link className="ds-button ds-button--primary" to={contactHref({ type: 'CONSULTATION', sourceType: 'GENERAL', cta: 'SERVICES_GENERAL_CONTACT' })}>Partilhar o contexto <ArrowRight size={17} /></Link></div>
    </section>
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
