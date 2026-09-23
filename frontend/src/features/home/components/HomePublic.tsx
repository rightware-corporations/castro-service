import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ArrowRight, ArrowUpRight, Compass, GraduationCap, Handshake } from 'lucide-react'
import { HomeEntry } from './HomeEntry'
import { useCourses } from '../../courses/hooks'
import { useServices } from '../../services/hooks'
import { HomeSpaces } from './HomeSpaces'
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

export function HomePublic() {
  const servicesQuery = useServices()
  const coursesQuery = useCourses()

  return <div className="home-v2">
    <HomeEntry spaces={<HomeSpaces />} closing consulting={<PublicPreview query={servicesQuery} empty="Os serviços publicados surgirão aqui assim que o catálogo estiver configurado." href="/servicos" label="Ver todos os serviços" renderItems={(items) => <ol className="home-entry__service-index" aria-label="Serviços publicados">{items.slice(0, 3).map((item, index) => <li key={item.slug}><Link to={`/servicos/${item.slug}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.name}</strong><ArrowRight size={17} aria-hidden="true" /></Link></li>)}</ol>} />}  training={<PublicPreview query={coursesQuery} empty="As formações publicadas surgirão aqui quando o catálogo estiver configurado." href="/formacao" label="Ver toda a formação" renderItems={(items) => <ol className="home-entry__service-index" aria-label="Formações publicadas">{items.slice(0, 3).map((item, index) => <li key={item.slug}><Link to={`/formacao/${item.slug}`}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{item.name}</strong>{(item.modality || item.durationLabel) && <small className="home-entry__course-meta">{[item.modality, item.durationLabel].filter(Boolean).join(' · ')}</small>}</div><ArrowRight size={17} aria-hidden="true" /></Link></li>)}</ol>} />} />

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
  return <div className="home-v2-preview-content">
    {query.isLoading ? <LoadingState label="A carregar conteúdo." /> : query.isError ? <ErrorState title="Não foi possível carregar esta área." /> : !query.data?.items.length ? <EmptyState title="Catálogo em preparação">{empty}</EmptyState> : renderItems(query.data.items)}
    <Link className="home-v2-link" to={href}>{label} <ArrowRight size={16} /></Link>
  </div>
}
