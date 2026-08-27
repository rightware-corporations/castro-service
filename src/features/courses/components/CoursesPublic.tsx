import { Link, useParams } from 'react-router-dom'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { useCourse, useCourseSessions, useCourses } from '../hooks'
import { EmptyState, ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'
import { Breadcrumbs } from '../../../design-system/patterns/navigation'
import type { Course, CourseSession } from '../../../domain/models'

function CoursesIntro() { return <header className="public-page-intro"><span className="eyebrow">CASTRO’S · FORMAÇÃO</span><h1>Formação para abrir novas possibilidades.</h1><p>Conheça a oferta de formação quando os conteúdos estiverem publicados e validados. Não são assumidas datas, formatos, instrutores ou preços.</p></header> }

export function CoursesCatalog() { return <CourseCollectionView resource={useCourses()} /> }

export function CourseCollectionView({ resource }: { resource: { isLoading: boolean; isError: boolean; data?: { items: Course[] } } }) {
  if (resource.isLoading) return <section className="public-page container"><CoursesIntro /><LoadingState label="A carregar formação." /></section>
  if (resource.isError) return <section className="public-page container"><CoursesIntro /><ErrorState title="Não foi possível carregar a formação." /></section>
  if (!resource.data?.items.length) return <section className="public-page container"><CoursesIntro /><EmptyState title="Ainda não existem cursos publicados.">A oferta será apresentada quando o conteúdo estiver confirmado.</EmptyState><CorporateTrainingPrompt /></section>
  return <section className="public-page container"><CoursesIntro /><div className="editorial-list" aria-label="Formação publicada">{resource.data.items.map((course) => <article className="editorial-list__item" key={course.slug}><div><span className="eyebrow">FORMAÇÃO</span><h2>{course.name}</h2>{course.summary && <p>{course.summary}</p>}</div><Link className="text-link" to={`/formacao/${course.slug}`}>Ver formação <ArrowRight size={16} /></Link></article>)}</div><CorporateTrainingPrompt /></section>
}

export function CourseDetail() { const { slug } = useParams(); const courseQuery = useCourse(slug); return <CourseDetailView courseResource={courseQuery} sessionsResource={useCourseSessions(courseQuery.data?.id)} /> }

export function CourseDetailView({ courseResource, sessionsResource }: { courseResource: { isLoading: boolean; isError: boolean; data?: Course }; sessionsResource: { isLoading: boolean; isError: boolean; data?: { items: CourseSession[] } } }) {
  if (courseResource.isLoading) return <section className="public-page container"><LoadingState label="A carregar formação." /></section>
  if (courseResource.isError) return <section className="public-page container"><ErrorState title="Não foi possível carregar esta formação." /><Link className="text-link" to="/formacao">Voltar à formação</Link></section>
  if (!courseResource.data) return <section className="public-page container"><EmptyState title="Formação não encontrada.">O endereço não corresponde a uma formação disponível.</EmptyState><Link className="text-link" to="/formacao">Voltar à formação</Link></section>
  const course = courseResource.data
  return <section className="public-page container"><Breadcrumbs items={[{ label: 'Formação', href: '/formacao' }, { label: course.name }]} /><header className="public-page-intro"><span className="eyebrow">FORMAÇÃO</span><h1>{course.name}</h1><p>{course.description ?? course.summary ?? '[CONTENT TBD]'}</p></header><section className="sessions-region"><div><span className="eyebrow">SESSÕES</span><h2>Próximas sessões</h2></div><CourseSessionsView resource={sessionsResource} /></section><CorporateTrainingPrompt /></section>
}

export function CourseSessionsView({ resource }: { resource: { isLoading: boolean; isError: boolean; data?: { items: CourseSession[] } } }) {
  if (resource.isLoading) return <LoadingState label="A carregar sessões." />
  if (resource.isError) return <ErrorState title="Não foi possível carregar as sessões." />
  if (!resource.data?.items.length) return <EmptyState title="Não existem sessões disponíveis.">As próximas sessões serão apresentadas quando forem confirmadas.</EmptyState>
  return <div className="sessions-list">{resource.data.items.map((session) => <article className="session-row" key={session.id}><CalendarDays size={18} aria-hidden="true" /><div><strong>{session.startAt}</strong><span>{session.endAt}</span></div><span className="session-row__note">Detalhes a confirmar</span></article>)}</div>
}

function CorporateTrainingPrompt() { return <div className="contact-prompt"><h2>Formação para a sua organização?</h2><p>Envie um pedido de informação sem assumir formato, datas ou condições antes da confirmação.</p><Link className="ds-button ds-button--primary" to="/contacto">Pedir informação <ArrowRight size={16} /></Link></div> }
