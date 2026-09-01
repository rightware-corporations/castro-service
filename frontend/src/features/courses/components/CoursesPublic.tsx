import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, CalendarDays, Presentation, Sparkles, UsersRound } from 'lucide-react'
import { useCourse, useCourseSessions, useCourses } from '../hooks'
import { EmptyState, ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'
import { Breadcrumbs } from '../../../design-system/patterns/navigation'
import type { Course, CourseSession } from '../../../domain/models'
import { bookingRoute } from '../../booking/routes'

function CoursesIntro({ detailTitle }: { detailTitle?: string }) {
  return <header className="courses-v2-intro">
    <div><span className="eyebrow">CASTRO’S · FORMAÇÃO</span><h1>{detailTitle ?? <>Aprender para mudar a forma de <em>agir.</em></>}</h1></div>
    <div className="courses-v2-intro__side"><span>FORMAÇÃO / 02</span><p>Palestras, workshops, formação e treinamento corporativo com espaço para contexto, conversa e aplicação.</p></div>
  </header>
}

export function CoursesCatalog() { return <CourseCollectionView resource={useCourses()} /> }

export function CourseCollectionView({ resource }: { resource: { isLoading: boolean; isError: boolean; data?: { items: Course[] } } }) {
  return <div className="courses-v2-page">
    <section className="container public-v2-page"><CoursesIntro />
      <div className="courses-v2-formats">
        <article><div><Presentation size={21} aria-hidden="true" /><span>01</span></div><h2>Palestras & Workshops</h2><p>Encontros para provocar reflexão, partilhar práticas e criar linguagem comum dentro das organizações.</p></article>
        <article><div><UsersRound size={21} aria-hidden="true" /><span>02</span></div><h2>Formação</h2><p>Experiências de aprendizagem estruturadas para desenvolver capacidades e apoiar o trabalho das equipas.</p></article>
        <article><div><Sparkles size={21} aria-hidden="true" /><span>03</span></div><h2>Treinamento Personalizado</h2><p>Formação corporativa preparada a partir do contexto e das necessidades específicas da organização.</p></article>
      </div>
    </section>

    <section className="courses-v2-catalog">
      <div className="container courses-v2-catalog__grid">
        <div><span className="eyebrow">FORMAÇÃO PUBLICADA</span><h2>Escolha um ponto de partida.</h2><p>O catálogo abaixo é alimentado pelo backend. Datas e sessões só aparecem quando estiverem realmente publicadas.</p></div>
        <div>
          {resource.isLoading && <LoadingState label="A carregar formação." />}
          {resource.isError && <ErrorState title="Não foi possível carregar a formação." />}
          {!resource.isLoading && !resource.isError && !resource.data?.items.length && <EmptyState title="Catálogo em preparação">A oferta será apresentada aqui quando as formações estiverem publicadas.</EmptyState>}
          {resource.data?.items.length ? <div className="courses-v2-list">{resource.data.items.map((course, index) => <Link key={course.slug} to={`/formacao/${course.slug}`}><span>{String(index + 1).padStart(2, '0')}</span><div><small>FORMAÇÃO</small><strong>{course.name}</strong>{course.summary && <p>{course.summary}</p>}</div><ArrowUpRight size={20} /></Link>)}</div> : null}
        </div>
      </div>
    </section>

    <section className="courses-v2-corporate">
      <div className="container courses-v2-corporate__inner"><div><span className="eyebrow eyebrow--light">PARA ORGANIZAÇÕES</span><h2>Quando o contexto pede uma formação própria.</h2></div><div><p>O treinamento corporativo personalizado parte da realidade da organização, em vez de obrigar a realidade a caber num programa genérico.</p><Link className="ds-button courses-v2-corporate__button" to="/contacto">Conversar sobre formação <ArrowRight size={17} /></Link></div></div>
    </section>
  </div>
}

export function CourseDetail() { const { slug } = useParams(); const courseQuery = useCourse(slug); return <CourseDetailView courseResource={courseQuery} sessionsResource={useCourseSessions(courseQuery.data?.id)} /> }

export function CourseDetailView({ courseResource, sessionsResource }: { courseResource: { isLoading: boolean; isError: boolean; data?: Course }; sessionsResource: { isLoading: boolean; isError: boolean; data?: { items: CourseSession[] } } }) {
  if (courseResource.isLoading) return <section className="public-page container"><LoadingState label="A carregar formação." /></section>
  if (courseResource.isError) return <section className="public-page container"><ErrorState title="Não foi possível carregar esta formação." /><Link className="text-link" to="/formacao">Voltar à formação</Link></section>
  if (!courseResource.data) return <section className="public-page container"><EmptyState title="Formação não encontrada.">O endereço não corresponde a uma formação disponível.</EmptyState><Link className="text-link" to="/formacao">Voltar à formação</Link></section>
  const course = courseResource.data
  return <div className="course-detail-v2"><section className="container public-v2-page"><Breadcrumbs items={[{ label: 'Formação', href: '/formacao' }, { label: course.name }]} /><CoursesIntro detailTitle={course.name} />
    <div className="course-detail-v2__grid"><div className="course-detail-v2__about"><span className="eyebrow">SOBRE</span><p>{course.description ?? course.summary ?? 'Conteúdo detalhado pendente de publicação.'}</p><Link className="home-v2-link" to="/contacto">Pedir informação <ArrowRight size={16} /></Link></div><section className="course-detail-v2__sessions"><div className="course-detail-v2__sessions-head"><CalendarDays size={20} /><div><span className="eyebrow">SESSÕES</span><h2>Próximas sessões</h2></div></div><CourseSessionsView resource={sessionsResource} /></section></div>
  </section></div>
}

export function CourseSessionsView({ resource }: { resource: { isLoading: boolean; isError: boolean; data?: { items: CourseSession[] } } }) {
  if (resource.isLoading) return <LoadingState label="A carregar sessões." />
  if (resource.isError) return <ErrorState title="Não foi possível carregar as sessões." />
  if (!resource.data?.items.length) return <EmptyState title="Não existem sessões disponíveis.">As próximas sessões serão apresentadas quando forem confirmadas.</EmptyState>
  return <div className="sessions-v2-list">{resource.data.items.map((session, index) => {
    const href = sessionBookingHref(session)
    return <article key={session.id}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{formatSessionDateTime(session.startAt)}</strong><small>até {formatSessionDateTime(session.endAt)}</small></div>{href ? <Link to={href} aria-label={`Reservar sessão de ${formatSessionDateTime(session.startAt)}`}><ArrowUpRight size={17} /></Link> : <ArrowUpRight size={17} aria-hidden="true" />}</article>
  })}</div>
}

function sessionBookingHref(session: CourseSession) {
  const start = new Date(session.startAt)
  const end = new Date(session.endAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null
  const duration = Math.round((end.getTime() - start.getTime()) / 60000)
  if (duration <= 0) return null
  const date = session.startAt.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  return `${bookingRoute('COURSE_SESSION', session.id, 'selection')}?date=${encodeURIComponent(date)}&duration=${duration}&fixed=1`
}

function formatSessionDateTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
