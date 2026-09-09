import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  Building2,
  CheckCircle2,
  Compass,
  GraduationCap,
  Handshake,
  MessageCircle,
  Quote,
} from 'lucide-react'
import { usePublicConfig } from '../hooks'
import { useCourses } from '../../courses/hooks'
import { useServices } from '../../services/hooks'
import { useSpacesPreview } from '../../spaces/hooks'
import { EmptyState, ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'

const paths = [
  { id: 'services', number: '01', label: 'Serviços', eyebrow: 'CONSULTORIA & DESENVOLVIMENTO', title: 'Quando o desafio começa nas relações e na liderança.', description: 'Atendimento ao cliente, ética, liderança e desenvolvimento organizacional a partir do contexto real de cada organização.', themes: ['Atendimento', 'Ética', 'Liderança'], href: '/servicos', action: 'Explorar serviços', icon: Handshake },
  { id: 'training', number: '02', label: 'Formação', eyebrow: 'PALESTRAS · WORKSHOPS · FORMAÇÃO', title: 'Quando a equipa precisa aprender, praticar e avançar.', description: 'Experiências de aprendizagem para pessoas e equipas, com formatos publicados e percursos corporativos preparados para necessidades específicas.', themes: ['Palestras', 'Workshops', 'Treinamento'], href: '/formacao', action: 'Explorar formação', icon: GraduationCap },
  { id: 'spaces', number: '03', label: 'Espaços', eyebrow: 'ENCONTRO & EXPERIÊNCIA', title: 'Quando o próprio lugar precisa apoiar o encontro.', description: 'Espaços para reuniões, formação e workshops, com informação que conduz da descoberta até ao pedido ou reserva.', themes: ['Reuniões', 'Formação', 'Workshops'], href: '/espacos', action: 'Conhecer os espaços', icon: Compass },
] as const

const proofFixtures = [
  { context: 'Formação', quote: 'Depoimento real em recolha.', detail: 'Participante e organização serão apresentados após autorização.' },
  { context: 'Consultoria', quote: 'Depoimento real em recolha.', detail: 'Cliente e contexto serão apresentados após autorização.' },
  { context: 'Espaços', quote: 'Depoimento real em recolha.', detail: 'Organização e tipo de encontro serão apresentados após autorização.' },
] as const

type PublishedItem = { slug: string; name: string }
type PublishedResource = { isLoading: boolean; isError: boolean; data?: { items: PublishedItem[] } }

export function HomePublic() {
  const configQuery = usePublicConfig()
  const servicesQuery = useServices()
  const coursesQuery = useCourses()
  const spacesQuery = useSpacesPreview()
  const reducedMotion = useReducedMotion()
  const founderPortraitUrl = import.meta.env.VITE_ELIZABETH_PORTRAIT_URL?.trim()
  const [activePath, setActivePath] = useState(0)
  const currentPath = paths[activePath]
  const CurrentIcon = currentPath.icon

  return (
    <main className="castros-home">
      <section className="castros-home__hero">
        <div className="container castros-home__hero-inner">
          <motion.div className="castros-home__hero-copy" initial={reducedMotion ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.55 }}>
            <span className="eyebrow">CASTRO’S SERVICES · MAPUTO</span>
            <h1>Pessoas. Conhecimento. Espaço.</h1>
            <p>Consultoria, formação e espaços para organizações que precisam transformar contexto em decisões, aprendizagem e encontros com intenção.</p>
            <div className="castros-home__hero-actions">
              <Link className="ds-button ds-button--primary" to="/contacto">Começar uma conversa <ArrowUpRight size={17} /></Link>
              <Link className="castros-home__text-link" to="/sobre">Conhecer a Castro’s <ArrowRight size={17} /></Link>
            </div>
          </motion.div>
          <div className="castros-home__hero-stage" aria-label="Visão geral da experiência Castro’s">
            <div className="castros-home__hero-index"><span>01</span><span>02</span><span>03</span></div>
            <div className="castros-home__hero-wordmark" aria-hidden="true">CASTRO’S</div>
            <div className="castros-home__hero-orbit" aria-hidden="true" />
            <div className="castros-home__hero-note"><span>PRESENÇA HUMANA</span><strong>Começar pelo contexto antes de escolher a solução.</strong><small>{configQuery.data?.businessTimezone ? `Operação preparada para ${configQuery.data.businessTimezone}.` : 'Maputo · Moçambique'}</small></div>
          </div>
        </div>
      </section>

      <section className="castros-home__path" aria-labelledby="castros-path-title">
        <div className="container">
          <div className="castros-home__section-heading"><div><span className="eyebrow">ESCOLHER O PONTO DE PARTIDA</span><h2 id="castros-path-title">Três caminhos. Uma experiência contínua.</h2></div><p>Selecione a área mais próxima da sua necessidade. A cena muda e conduz diretamente ao próximo passo real.</p></div>
          <div className="castros-home__path-grid">
            <nav className="castros-home__path-nav" aria-label="Áreas Castro’s">
              {paths.map((path, index) => <button key={path.id} type="button" aria-pressed={index === activePath} onClick={() => setActivePath(index)} onFocus={() => setActivePath(index)}><span>{path.number}</span><strong>{path.label}</strong><path.icon size={20} aria-hidden="true" /></button>)}
            </nav>
            <motion.article key={currentPath.id} className="castros-home__path-focus" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="castros-home__path-focus-top"><span>{currentPath.eyebrow}</span><CurrentIcon size={28} aria-hidden="true" /></div>
              <div><h3>{currentPath.title}</h3><p>{currentPath.description}</p></div>
              <div className="castros-home__path-themes">{currentPath.themes.map((theme) => <span key={theme}><CheckCircle2 size={14} />{theme}</span>)}</div>
              <Link className="ds-button ds-button--primary" to={currentPath.href}>{currentPath.action} <ArrowRight size={16} /></Link>
            </motion.article>
          </div>
        </div>
      </section>

      <section className="castros-home__founder" aria-labelledby="castros-founder-title">
        <div className="container castros-home__founder-grid">
          <div className="castros-home__founder-media">
            {founderPortraitUrl ? <img src={founderPortraitUrl} alt="Elizabeth Castro, fundadora da Castro’s" /> : <div className="castros-home__founder-placeholder" role="img" aria-label="Retrato oficial de Elizabeth Castro em preparação"><strong>EC</strong><span>Retrato oficial em preparação</span></div>}
            <div className="castros-home__founder-caption"><strong>Elizabeth Castro</strong><span>Fundadora · Consultora · Formadora</span></div>
          </div>
          <div className="castros-home__founder-copy"><span className="eyebrow">AUTORIDADE HUMANA</span><h2 id="castros-founder-title">A experiência tem rosto, método e presença.</h2><p>Elizabeth Castro dá origem à Castro’s Services e conduz uma atuação centrada em comunicação, liderança e desenvolvimento organizacional.</p><p>A plataforma não substitui essa relação: organiza o caminho até à conversa, à formação ou ao espaço certo.</p><Link className="castros-home__text-link" to="/sobre">Conhecer Elizabeth e a Castro’s <ArrowRight size={17} /></Link></div>
        </div>
      </section>

      <section className="castros-home__published" aria-label="Conteúdo publicado">
        <div className="container castros-home__published-grid">
          <PublishedLane icon={<Handshake size={21} />} eyebrow="SERVIÇOS PUBLICADOS" title="Do contexto para um serviço concreto." query={servicesQuery} href="/servicos" empty="Os serviços publicados aparecerão aqui quando estiverem disponíveis." />
          <PublishedLane icon={<BookOpenText size={21} />} eyebrow="FORMAÇÃO PUBLICADA" title="Aprendizagem com um próximo passo claro." query={coursesQuery} href="/formacao" empty="As formações publicadas aparecerão aqui quando estiverem disponíveis." />
        </div>
      </section>

      <section className="castros-home__proof" aria-labelledby="castros-proof-title">
        <div className="container castros-home__proof-grid">
          <div><span className="eyebrow">PROVA HUMANA</span><h2 id="castros-proof-title">Sem depoimentos inventados.</h2><p>A estrutura está pronta. A publicação espera apenas testemunhos reais e autorizados.</p></div>
          <div className="castros-home__proof-list">{proofFixtures.map((item, index) => <article key={item.context}><span>0{index + 1}</span><Quote size={20} aria-hidden="true" /><div><strong>{item.context}</strong><p>{item.quote}</p><small>{item.detail}</small></div></article>)}</div>
        </div>
      </section>

      <section className="castros-home__space" aria-labelledby="castros-space-title">
        <div className="container castros-home__space-grid">
          <div className="castros-home__space-stage" role="img" aria-label="Área visual preparada para fotografia ou panorama real do espaço Castro’s"><div className="castros-home__space-lines" aria-hidden="true"><span /><span /><span /></div><div className="castros-home__space-status"><span>ESPAÇO CASTRO’S</span><strong>{spacesQuery.data?.items.length ? `${spacesQuery.data.items.length} espaço(s) publicado(s)` : 'Media oficial em preparação'}</strong></div></div>
          <div className="castros-home__space-copy"><span className="eyebrow">ESPAÇOS</span><h2 id="castros-space-title">O ambiente também participa da experiência.</h2><p>Reuniões, formação e workshops precisam de um lugar que apoie foco, proximidade e intenção.</p><div className="castros-home__space-tags"><span><Building2 size={17} /> Reuniões</span><span><GraduationCap size={17} /> Formação</span><span><Compass size={17} /> Workshops</span></div><Link className="ds-button ds-button--secondary" to="/espacos">Explorar espaços <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className="castros-home__process" aria-labelledby="castros-process-title">
        <div className="container"><div className="castros-home__section-heading"><div><span className="eyebrow">COMO COMEÇAMOS</span><h2 id="castros-process-title">Contexto primeiro. Decisão depois.</h2></div></div><div className="castros-home__process-list"><article><span>01</span><MessageCircle size={20} /><h3>Converse</h3><p>Partilhe a necessidade, o desafio ou o encontro que pretende criar.</p></article><article><span>02</span><Compass size={20} /><h3>Explore</h3><p>Compare serviços, formação e espaços com informação útil para decidir.</p></article><article><span>03</span><ArrowUpRight size={20} /><h3>Avance</h3><p>Siga para contacto, inscrição ou reserva quando o caminho estiver claro.</p></article></div></div>
      </section>

      <section className="castros-home__closing"><div className="container castros-home__closing-inner"><div><span className="eyebrow">PRÓXIMO PASSO</span><h2>Não precisa chegar com a resposta pronta.</h2></div><div><p>Comece pelo contexto. A Castro’s ajuda a transformar isso num próximo passo claro.</p><Link className="ds-button ds-button--primary" to="/contacto">Falar com a Castro’s <ArrowUpRight size={17} /></Link></div></div></section>
    </main>
  )
}

function PublishedLane({ icon, eyebrow, title, query, href, empty }: { icon: ReactNode; eyebrow: string; title: string; query: PublishedResource; href: string; empty: string }) {
  const items = query.data?.items ?? []
  return <article className="castros-home__published-lane"><div className="castros-home__published-head">{icon}<span className="eyebrow">{eyebrow}</span></div><h2>{title}</h2>{query.isLoading ? <LoadingState label="A carregar conteúdo." /> : null}{query.isError ? <ErrorState title="Não foi possível carregar este conteúdo." /> : null}{!query.isLoading && !query.isError && !items.length ? <EmptyState title="Conteúdo em preparação">{empty}</EmptyState> : null}{items.length ? <div className="castros-home__published-list">{items.slice(0, 3).map((item, index) => <Link key={item.slug} to={`${href}/${item.slug}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.name}</strong><ArrowUpRight size={17} /></Link>)}</div> : null}<Link className="castros-home__text-link" to={href}>Ver tudo <ArrowRight size={16} /></Link></article>
}
