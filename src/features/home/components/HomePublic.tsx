import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ArrowRight, CircleDot, Compass, GraduationCap, Handshake } from 'lucide-react'
import { usePublicConfig } from '../hooks'
import { useCourses } from '../../courses/hooks'
import { useServices } from '../../services/hooks'
import { useSpacesPreview } from '../../spaces/hooks'
import { EmptyState, ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'

const experiences = [
  { title: 'Serviços', description: 'Conteúdos e propostas para o seu contexto.', href: '/servicos', icon: Handshake },
  { title: 'Formação', description: 'Aprendizagem para pessoas e organizações.', href: '/formacao', icon: GraduationCap },
  { title: 'Espaços', description: 'Ambientes a conhecer numa próxima etapa.', href: '/espacos', icon: Compass },
]

export function HomePublic() {
  const configQuery = usePublicConfig()
  const servicesQuery = useServices()
  const coursesQuery = useCourses()
  const spacesQuery = useSpacesPreview()
  const brandName = configQuery.data?.brandName ?? 'Castro’s Services'

  return <div className="home-page">
    <section className="home-hero container">
      <div className="home-hero__copy"><span className="eyebrow">{brandName} · EXPERIÊNCIAS</span><h1>Desenvolvemos pessoas, equipas e organizações.</h1><p>Uma experiência de serviços, formação e espaços pensada com tempo, contexto e intenção. A informação final será apresentada a partir de conteúdos aprovados.</p><div className="home-hero__actions"><Link className="ds-button ds-button--primary" to="/servicos">Conhecer os serviços <ArrowRight size={16} /></Link><Link className="text-link" to="/formacao">Explorar formação <ArrowRight size={16} /></Link></div></div>
      <div className="home-hero__media" aria-label="Fotografia Castro’s por confirmar"><CircleDot size={34} aria-hidden="true" /><strong>FOTOGRAFIA REAL · A CONFIRMAR</strong><span>Asset aprovado pendente.</span></div>
    </section>
    <section className="home-experience container" aria-labelledby="experiences-title"><div className="section-heading"><span className="eyebrow">TRÊS FORMAS DE ESTAR</span><h2 id="experiences-title">Encontre o ponto de partida.</h2></div><ExperienceSelector /></section>
    <section className="home-previews container" aria-label="Pré-visualizações públicas"><PreviewBlock eyebrow="SERVIÇOS" title="Serviços publicados" query={servicesQuery} empty="Ainda não existem serviços publicados." renderItems={(items) => <div className="preview-list">{items.slice(0, 3).map((item) => <Link key={item.slug} to={`/servicos/${item.slug}`}><span>{item.name}</span><ArrowRight size={16} /></Link>)}</div>} href="/servicos" />
      <PreviewBlock eyebrow="FORMAÇÃO" title="Próximas formações" query={coursesQuery} empty="Ainda não existem formações publicadas." renderItems={(items) => <div className="preview-list">{items.slice(0, 3).map((item) => <Link key={item.slug} to={`/formacao/${item.slug}`}><span>{item.name}</span><ArrowRight size={16} /></Link>)}</div>} href="/formacao" />
      <section className="preview-block preview-block--spaces"><div className="preview-block__copy"><span className="eyebrow">ESPAÇOS</span><h2>Ambientes para conhecer.</h2><p>{spacesQuery.data?.items.length ? 'Explore os espaços disponíveis.' : 'A experiência completa de espaços será apresentada numa próxima etapa.'}</p><Link className="text-link" to="/espacos">Conhecer espaços <ArrowRight size={16} /></Link></div><div className="preview-block__media" aria-label="Fotografia dos espaços por confirmar"><span>MEDIA · A CONFIRMAR</span></div></section>
    </section>
    <section className="home-institutional container"><div><span className="eyebrow">INSTITUCIONAL</span><h2>Um espaço para conteúdo com significado.</h2></div><p>Esta secção aguarda conteúdo institucional aprovado. A estrutura está preparada sem antecipar história, equipa, parceiros ou métricas.</p></section>
    <section className="home-contact container"><div><span className="eyebrow">CONTACTO</span><h2>Começamos pela conversa certa.</h2><p>Partilhe o contexto que quer explorar e escolha o tipo de pedido que melhor descreve a sua intenção.</p></div><Link className="ds-button ds-button--primary" to="/contacto">Falar connosco <ArrowRight size={16} /></Link></section>
  </div>
}

export function ExperienceSelector() { return <nav className="experience-selector" aria-label="Experiências Castro’s">{experiences.map(({ title, description, href, icon: Icon }) => <Link className="experience-selector__item" key={href} to={href}><Icon size={22} aria-hidden="true" /><span><strong>{title}</strong><small>{description}</small></span><ArrowRight size={18} aria-hidden="true" /></Link>)}</nav> }

function PreviewBlock<T extends { slug: string; name: string }>({ eyebrow, title, query, empty, renderItems, href }: { eyebrow: string; title: string; query: { isLoading: boolean; isError: boolean; data?: { items: T[] } }; empty: string; renderItems: (items: T[]) => ReactNode; href: string }) {
  return <section className="preview-block"><div className="preview-block__copy"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{query.isLoading && <LoadingState label="A carregar conteúdo." />}{query.isError && <ErrorState title="Não foi possível carregar esta área." />}{!query.isLoading && !query.isError && !query.data?.items.length && <EmptyState title={empty}>A informação será apresentada quando estiver validada.</EmptyState>}{query.data?.items.length ? renderItems(query.data.items) : null}<Link className="text-link" to={href}>Ver todos <ArrowRight size={16} /></Link></div></section>
}
