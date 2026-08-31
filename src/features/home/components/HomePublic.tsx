import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpenText, Building2, Compass, GraduationCap, Handshake, MessageCircle, MoveRight, Sparkles } from 'lucide-react'
import { usePublicConfig } from '../hooks'
import { useCourses } from '../../courses/hooks'
import { useServices } from '../../services/hooks'
import { useSpacesPreview } from '../../spaces/hooks'
import { EmptyState, ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'

const experiences = [
  {
    number: '01',
    title: 'Serviços',
    eyebrow: 'CONSULTORIA & DESENVOLVIMENTO',
    description: 'Atendimento ao cliente, ética, liderança e soluções construídas em torno do contexto de cada organização.',
    href: '/servicos',
    icon: Handshake,
  },
  {
    number: '02',
    title: 'Formação',
    eyebrow: 'PALESTRAS · WORKSHOPS · FORMAÇÃO',
    description: 'Momentos de aprendizagem e treinamento corporativo preparados para pessoas, equipas e organizações.',
    href: '/formacao',
    icon: GraduationCap,
  },
  {
    number: '03',
    title: 'Espaços',
    eyebrow: 'ENCONTRO & EXPERIÊNCIA',
    description: 'Um espaço físico para reuniões, formação, workshops e outros encontros que pedem foco e proximidade.',
    href: '/espacos',
    icon: Compass,
  },
]

const practiceLines = [
  'Atendimento ao Cliente',
  'Ética & Liderança Organizacional',
  'Palestras, Workshops & Formação',
  'Treinamento Corporativo Personalizado',
]

export function HomePublic() {
  const configQuery = usePublicConfig()
  const servicesQuery = useServices()
  const coursesQuery = useCourses()
  const spacesQuery = useSpacesPreview()

  return <div className="home-v2">
    <section className="home-v2-hero">
      <div className="container home-v2-hero__grid">
        <div className="home-v2-hero__copy">
          <span className="eyebrow">CASTRO’S SERVICES · MAPUTO</span>
          <h1>Onde pessoas, liderança e <em>experiência</em> se encontram.</h1>
          <p className="home-v2-hero__lead">Consultoria, formação e espaços pensados para criar conversas mais claras, equipas mais preparadas e encontros com intenção.</p>
          <div className="home-v2-hero__actions">
            <Link className="ds-button ds-button--primary home-v2-primary" to="/contacto">Começar uma conversa <ArrowUpRight size={17} /></Link>
            <Link className="home-v2-link" to="/servicos">Descobrir a Castro’s <ArrowDownRight size={17} /></Link>
          </div>
          <div className="home-v2-hero__meta" aria-label="Áreas Castro’s">
            <span>Consultoria</span><i aria-hidden="true" /><span>Formação</span><i aria-hidden="true" /><span>Espaços</span>
          </div>
        </div>

        <div className="home-v2-hero__art" aria-label="Composição visual inspirada na identidade Castro’s">
          <div className="home-v2-orbit home-v2-orbit--one" aria-hidden="true" />
          <div className="home-v2-orbit home-v2-orbit--two" aria-hidden="true" />
          <div className="home-v2-node home-v2-node--a" aria-hidden="true" />
          <div className="home-v2-node home-v2-node--b" aria-hidden="true" />
          <div className="home-v2-node home-v2-node--c" aria-hidden="true" />
          <div className="home-v2-art__statement">
            <span>CASTRO’S</span>
            <strong>Serviços que começam por compreender.</strong>
            <small>{configQuery.data?.businessTimezone ? `Experiência digital preparada para ${configQuery.data.businessTimezone}.` : 'Experiência digital em construção.'}</small>
          </div>
          <div className="home-v2-art__index" aria-hidden="true"><span>01</span><span>02</span><span>03</span></div>
        </div>
      </div>
      <div className="container home-v2-hero__scroll"><span>Explore</span><ArrowDownRight size={16} /></div>
    </section>

    <section className="home-v2-experiences container" aria-labelledby="experiences-title">
      <div className="home-v2-section-head">
        <div><span className="eyebrow">TRÊS PORTAS DE ENTRADA</span><h2 id="experiences-title">Comece pelo que a sua realidade pede agora.</h2></div>
        <p>A Castro’s reúne diferentes formas de apoiar pessoas e organizações — da conversa estratégica à formação e ao espaço onde o encontro acontece.</p>
      </div>
      <ExperienceSelector />
    </section>

    <section className="home-v2-practice">
      <div className="container home-v2-practice__grid">
        <div className="home-v2-practice__intro">
          <span className="eyebrow eyebrow--light">ÁREAS DE ATUAÇÃO</span>
          <h2>Clareza no atendimento. Ética na liderança. Formação com contexto.</h2>
          <p>Uma presença transversal para organizações que precisam desenvolver relações, liderança e capacidade interna.</p>
          <Link className="home-v2-link home-v2-link--light" to="/servicos">Explorar serviços <MoveRight size={18} /></Link>
        </div>
        <div className="home-v2-practice__list">
          {practiceLines.map((line, index) => <div className="home-v2-practice__row" key={line}><span>0{index + 1}</span><strong>{line}</strong><ArrowUpRight size={18} aria-hidden="true" /></div>)}
        </div>
      </div>
    </section>

    <section className="home-v2-live container" aria-label="Conteúdo publicado">
      <div className="home-v2-live__column">
        <div className="home-v2-live__heading"><Handshake size={22} aria-hidden="true" /><span className="eyebrow">SERVIÇOS PUBLICADOS</span></div>
        <h2>Do contexto à ação.</h2>
        <PublicPreview query={servicesQuery} empty="Os serviços publicados surgirão aqui assim que o catálogo estiver configurado." href="/servicos" label="Ver todos os serviços" renderItems={(items) => <div className="home-v2-live__items">{items.slice(0, 3).map((item, index) => <Link key={item.slug} to={`/servicos/${item.slug}`}><span>0{index + 1}</span><strong>{item.name}</strong><ArrowRight size={17} /></Link>)}</div>} />
      </div>
      <div className="home-v2-live__column home-v2-live__column--cream">
        <div className="home-v2-live__heading"><BookOpenText size={22} aria-hidden="true" /><span className="eyebrow">FORMAÇÃO</span></div>
        <h2>Aprender também é transformar a forma de trabalhar.</h2>
        <PublicPreview query={coursesQuery} empty="As formações publicadas surgirão aqui quando o catálogo estiver configurado." href="/formacao" label="Explorar formação" renderItems={(items) => <div className="home-v2-live__items">{items.slice(0, 3).map((item, index) => <Link key={item.slug} to={`/formacao/${item.slug}`}><span>0{index + 1}</span><strong>{item.name}</strong><ArrowRight size={17} /></Link>)}</div>} />
      </div>
    </section>

    <section className="home-v2-space container">
      <div className="home-v2-space__visual" aria-label="Área preparada para fotografia real do espaço Castro’s">
        <div className="home-v2-space__frame" aria-hidden="true"><span /><span /><span /></div>
        <div className="home-v2-space__caption"><span>ESPAÇO CASTRO’S</span><small>Fotografia e experiência 360 entram na próxima etapa visual.</small></div>
      </div>
      <div className="home-v2-space__copy">
        <span className="eyebrow">ESPAÇOS</span>
        <h2>O lugar também faz parte da experiência.</h2>
        <p>Um ambiente físico preparado para reuniões, treinamentos e workshops — e uma experiência digital que será capaz de o explorar antes mesmo da visita.</p>
        <div className="home-v2-space__features">
          <span><Building2 size={18} /> Reuniões</span>
          <span><GraduationCap size={18} /> Formação</span>
          <span><Sparkles size={18} /> Workshops</span>
        </div>
        <Link className="ds-button ds-button--secondary" to="/espacos">Conhecer o espaço <ArrowRight size={17} /></Link>
        {spacesQuery.data?.items.length ? <small className="home-v2-space__status">{spacesQuery.data.items.length} espaço(s) disponível(eis) no catálogo.</small> : null}
      </div>
    </section>

    <section className="home-v2-process container">
      <div className="home-v2-section-head home-v2-section-head--compact"><div><span className="eyebrow">COMO COMEÇAMOS</span><h2>Uma experiência simples. Sem saltar o contexto.</h2></div></div>
      <div className="home-v2-process__steps">
        <article><span>01</span><MessageCircle size={21} aria-hidden="true" /><h3>Converse</h3><p>Partilhe a necessidade, o desafio ou o tipo de encontro que pretende criar.</p></article>
        <article><span>02</span><Compass size={21} aria-hidden="true" /><h3>Explore</h3><p>Conheça serviços, formação e espaços com informação organizada para decidir melhor.</p></article>
        <article><span>03</span><ArrowUpRight size={21} aria-hidden="true" /><h3>Avance</h3><p>Siga para o pedido, configuração ou reserva quando a opção certa estiver clara.</p></article>
      </div>
    </section>

    <section className="home-v2-contact">
      <div className="container home-v2-contact__inner">
        <div><span className="eyebrow eyebrow--light">PRÓXIMO PASSO</span><h2>Começamos pela conversa certa.</h2></div>
        <div><p>Conte-nos o que pretende desenvolver, organizar ou transformar. A experiência digital encaminha o pedido para o contexto certo.</p><Link className="ds-button home-v2-contact__button" to="/contacto">Falar com a Castro’s <ArrowUpRight size={18} /></Link></div>
      </div>
    </section>
  </div>
}

export function ExperienceSelector() {
  return <nav className="home-v2-experience-grid" aria-label="Experiências Castro’s">
    {experiences.map(({ number, title, eyebrow, description, href, icon: Icon }) => <Link className="home-v2-experience" key={href} to={href}>
      <div className="home-v2-experience__top"><span>{number}</span><Icon size={21} aria-hidden="true" /></div>
      <div><small>{eyebrow}</small><h3>{title}</h3><p>{description}</p></div>
      <span className="home-v2-experience__action">Explorar <ArrowUpRight size={16} /></span>
    </Link>)}
  </nav>
}

function PublicPreview<T extends { slug: string; name: string }>({ query, empty, renderItems, href, label }: { query: { isLoading: boolean; isError: boolean; data?: { items: T[] } }; empty: string; renderItems: (items: T[]) => ReactNode; href: string; label: string }) {
  if (query.isLoading) return <LoadingState label="A carregar conteúdo." />
  if (query.isError) return <ErrorState title="Não foi possível carregar esta área." />
  return <div className="home-v2-preview-content">
    {!query.data?.items.length ? <EmptyState title="Catálogo em preparação">{empty}</EmptyState> : renderItems(query.data.items)}
    <Link className="home-v2-link" to={href}>{label} <ArrowRight size={16} /></Link>
  </div>
}
