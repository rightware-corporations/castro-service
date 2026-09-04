import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, CalendarDays, Presentation, Sparkles, UsersRound } from 'lucide-react'
import { useCourse, useCourseSessions, useCourses } from '../hooks'
import { EmptyState, ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'
import { Breadcrumbs } from '../../../design-system/patterns/navigation'
import type { Course, CourseSession } from '../../../domain/models'
import { contactHref } from '../../contact/intent'

function CoursesIntro({ detailTitle }: { detailTitle?: string }) {
  return <header className="courses-v2-intro">
    <div><span className="eyebrow">CASTRO’S · FORMAÇÃO</span><h1>{detailTitle ?? <>Aprender para mudar a forma de <em>agir.</em></>}</h1></div>
    <div className="courses-v2-intro__side"><span>FORMAÇÃO / 02</span><p>Palestras, workshops, formação e treinamento corporativo com espaço para contexto, conversa e aplicação.</p></div>
  </header>
}

export function CoursesCatalog() { return <CourseCollectionView resource={useCourses()} /> }

export function CourseCollectionView({ resource }: { resource: { isLoading: boolean; isError: boolean; data?: { items: Course[] } } }) {
  const corporateHref = contactHref({ type: 'TRAINING_INFO', cta: 'CORPORATE_TRAINING', message: 'Gostaria de conversar sobre uma formação para a minha organização.' })
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
        <div><span className="eyebrow">FORMAÇÃO PUBLICADA</span><h2>Escolha um ponto de partida.</h2><p>Todos os cursos publicados usam o mesmo sistema visual. O conteúdo muda; a experiência, os estados e os CTAs permanecem consistentes.</p></div>
        <div>
          {resource.isLoading && <LoadingState label="A carregar formação." />}
          {resource.isError && <ErrorState title="Não foi possível carregar a formação." />}
          {!resource.isLoading && !resource.isError && !resource.data?.items.length && <EmptyState title="Catálogo em preparação">A oferta será apresentada aqui quando as formações estiverem publicadas.</EmptyState>}
          {resource.data?.items.length ? <div className="course-system-grid">{resource.data.items.map((course, index) => <CourseCatalogCard key={course.slug} course={course} index={index} />)}</div> : null}
        </div>
      </div>
    </section>

    <section className="courses-v2-corporate">
      <div className="container courses-v2-corporate__inner"><div><span className="eyebrow eyebrow--light">PARA ORGANIZAÇÕES</span><h2>Quando o contexto pede uma formação própria.</h2></div><div><p>O treinamento corporativo personalizado parte da realidade da organização, em vez de obrigar a realidade a caber num programa genérico.</p><Link className="ds-button courses-v2-corporate__button" to={corporateHref}>Formação para a minha organização <ArrowRight size={17} /></Link></div></div>
    </section>
  </div>
}

function CourseCatalogCard({ course, index }: { course: Course; index: number }) {
  const detailHref = `/formacao/${encodeURIComponent(course.slug)}`
  const infoHref = contactHref({ type: 'TRAINING_INFO', sourceType: 'TRAINING', entityId: course.id, cta: 'TRAINING_INFO', message: `Gostaria de receber informação sobre ${course.name}.` })
  return <article className="course-system-card">
    <div className="course-system-card__top"><span>FORMAÇÃO · {String(index + 1).padStart(2, '0')}</span>{course.featured && <strong>Em destaque</strong>}</div>
    <div className="course-system-card__content"><h3><Link to={detailHref}>{course.name}</Link></h3><p>{course.summary || course.description || 'Detalhes desta formação serão apresentados na página do curso.'}</p></div>
    <dl className="course-system-card__facts">
      <div><dt>Modalidade</dt><dd>{course.modality ? humanize(course.modality) : 'A confirmar'}</dd></div>
      <div><dt>Duração</dt><dd>{course.durationLabel || 'A confirmar'}</dd></div>
      <div><dt>Investimento</dt><dd>{formatInvestment(course.investmentAmount, course.investmentCurrency)}</dd></div>
    </dl>
    <div className="course-system-card__actions"><Link className="ds-button ds-button--primary" to={detailHref}>Ver curso e inscrição <ArrowRight size={16} /></Link><Link className="text-link" to={infoHref}>Pedir informação</Link></div>
  </article>
}

export function CourseDetail() { const { slug } = useParams(); const courseQuery = useCourse(slug); return <CourseDetailView courseResource={courseQuery} sessionsResource={useCourseSessions(courseQuery.data?.id)} /> }

export function CourseDetailView({ courseResource, sessionsResource }: { courseResource: { isLoading: boolean; isError: boolean; data?: Course }; sessionsResource: { isLoading: boolean; isError: boolean; data?: { items: CourseSession[] } } }) {
  if (courseResource.isLoading) return <section className="public-page container"><LoadingState label="A carregar formação." /></section>
  if (courseResource.isError) return <section className="public-page container"><ErrorState title="Não foi possível carregar esta formação." /><Link className="text-link" to="/formacao">Voltar à formação</Link></section>
  if (!courseResource.data) return <section className="public-page container"><EmptyState title="Formação não encontrada.">O endereço não corresponde a uma formação disponível.</EmptyState><Link className="text-link" to="/formacao">Voltar à formação</Link></section>
  const course = courseResource.data
  const infoHref = contactHref({ type: 'TRAINING_INFO', sourceType: 'TRAINING', entityId: course.id, cta: 'TRAINING_INFO', message: `Gostaria de receber informação sobre ${course.name}.` })
  return <div className="course-detail-v2"><section className="container public-v2-page"><Breadcrumbs items={[{ label: 'Formação', href: '/formacao' }, { label: course.name }]} /><CoursesIntro detailTitle={course.name} />
    <div className="course-detail-v2__grid"><div className="course-detail-v2__about"><span className="eyebrow">SOBRE</span><p>{course.description ?? course.summary ?? 'Conteúdo detalhado pendente de publicação.'}</p><Link className="home-v2-link" to={infoHref}>Pedir informação <ArrowRight size={16} /></Link></div><section className="course-detail-v2__sessions"><div className="course-detail-v2__sessions-head"><CalendarDays size={20} /><div><span className="eyebrow">SESSÕES</span><h2>Próximas sessões</h2></div></div><CourseSessionsView resource={sessionsResource} course={course} /></section></div>
  </section></div>
}

export function CourseSessionsView({ resource, course }: { resource: { isLoading: boolean; isError: boolean; data?: { items: CourseSession[] } }; course?: Course }) {
  if (resource.isLoading) return <LoadingState label="A carregar sessões." />
  if (resource.isError) return <ErrorState title="Não foi possível carregar as sessões." />
  if (!resource.data?.items.length) {
    const nextDatesHref = contactHref({ type: 'TRAINING_INFO', sourceType: course ? 'TRAINING' : undefined, entityId: course?.id, cta: 'NEXT_TRAINING_DATES', message: course ? `Gostaria de receber as próximas datas de ${course.name}.` : 'Gostaria de receber as próximas datas de formação.' })
    const corporateHref = contactHref({ type: 'TRAINING_INFO', sourceType: course ? 'TRAINING' : undefined, entityId: course?.id, cta: 'CORPORATE_TRAINING', message: course ? `Gostaria de conversar sobre ${course.name} para a minha organização.` : 'Gostaria de conversar sobre formação para a minha organização.' })
    return <div className="courses-v2-no-sessions"><EmptyState title="Não existem sessões disponíveis.">As próximas sessões serão apresentadas quando forem confirmadas.</EmptyState><div><Link className="ds-button ds-button--primary" to={nextDatesHref}>Receber próximas datas</Link><Link className="text-link" to={corporateHref}>Formação para a minha organização</Link></div></div>
  }
  return <div className="sessions-v2-list">{resource.data.items.map((session, index) => {
    const href = course ? `/formacao/${encodeURIComponent(course.slug)}/sessoes/${encodeURIComponent(session.id)}/inscricao` : null
    return <article key={session.id}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{formatSessionDateTime(session.startAt)}</strong><small>até {formatSessionDateTime(session.endAt)}</small></div>{href ? <Link to={href} aria-label={`Inscrever-se na sessão de ${formatSessionDateTime(session.startAt)}`}><ArrowUpRight size={17} /></Link> : <ArrowUpRight size={17} aria-hidden="true" />}</article>
  })}</div>
}

function humanize(value: string) { return value.replaceAll('_', ' ').toLocaleLowerCase('pt-PT').replace(/^./, (letter) => letter.toUpperCase()) }
function formatInvestment(value?: number, currency?: string) { if (value == null) return 'Consultar'; const amount = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(value); return currency === 'MZN' || !currency ? `${amount} MT` : `${amount} ${currency}` }
function formatSessionDateTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
