import { CourseSessionsView } from './components/CoursesPublic'
import { ArrowLeft, ArrowRight, Award, CalendarDays, CheckCircle2, Clock3, Coins, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCourse, useCourseSessions } from './hooks'
import { contactHref } from '../contact/intent'
import { EmptyState, ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

export function CourseMarketingDetailPage() {
  const { slug } = useParams()
  const courseQuery = useCourse(slug)
  const sessionsQuery = useCourseSessions(courseQuery.data?.id)
  if (courseQuery.isLoading) return <section className="container launch-course-detail"><LoadingState label="A carregar formação." /></section>
  if (courseQuery.isError) return <section className="container launch-course-detail"><ErrorState title="Não foi possível carregar esta formação." /><Link className="text-link" to="/formacao">Voltar à formação</Link></section>
  if (!courseQuery.data) return <section className="container launch-course-detail" data-frame="T12"><EmptyState title="Formação não encontrada.">Consulte os cursos disponíveis para encontrar outra formação.</EmptyState><Link className="text-link" to="/formacao">Voltar à formação</Link></section>
  const course = courseQuery.data
  const session = !sessionsQuery.isLoading && !sessionsQuery.isError ? sessionsQuery.data?.items[0] : undefined
  const infoHref = contactHref({ type: 'TRAINING_INFO', sourceType: 'TRAINING', entityId: course.id, cta: 'TRAINING_INFO', message: `Gostaria de receber informação sobre ${course.name}.` })
  const nextDatesHref = contactHref({ type: 'TRAINING_INFO', sourceType: 'TRAINING', entityId: course.id, cta: 'NEXT_TRAINING_DATES', message: `Gostaria de receber as próximas datas de ${course.name}.` })

  return <div className="launch-course-detail">
    <section className="container launch-course-detail__hero">
      <Link className="launch-text-link" to="/formacao"><ArrowLeft size={15}/> Formação</Link>
      <div className="launch-course-detail__hero-grid">
        <div><span className="eyebrow">CASTRO’S · FORMAÇÃO</span><h1>{course.name}</h1><p>{course.summary || course.description}</p><div className="launch-course-detail__actions">{session ? <Link className="ds-button ds-button--primary" to={`/formacao/${encodeURIComponent(course.slug)}/sessoes/${encodeURIComponent(session.id)}/inscricao`}>Inscrever-me <ArrowRight size={17}/></Link> : !sessionsQuery.isLoading && !sessionsQuery.isError ? <Link className="ds-button ds-button--primary" to={nextDatesHref}>Receber próximas datas</Link> : null}<Link className="launch-text-link" to={infoHref}>Pedir informação</Link></div></div>
        <aside className="launch-course-detail__summary">
          {session && <CourseFact icon={<CalendarDays size={18}/>} label="Início" value={formatDate(session.startAt)} />}
          <CourseFact icon={<MapPin size={18}/>} label="Modalidade" value={course.modality ? humanize(course.modality) : 'A confirmar'} />
          <CourseFact icon={<Clock3 size={18}/>} label="Duração" value={course.durationLabel || 'A confirmar'} />
          <CourseFact icon={<Coins size={18}/>} label="Investimento" value={formatInvestment(course.investmentAmount, course.investmentCurrency)} />
          {course.certificateIncluded && <CourseFact icon={<Award size={18}/>} label="Inclui" value="Inscrição e certificado" />}
        </aside>
      </div>
    </section>

    <section className="container launch-course-detail__body">
      <article><span className="eyebrow">SOBRE O CURSO</span><h2>Sobre esta formação.</h2><p>{course.description || course.summary}</p>{course.scheduleSummary && <div className="launch-course-detail__schedule"><Clock3 size={19}/><div><span>HORÁRIOS</span><strong>{course.scheduleSummary}</strong></div></div>}</article>
      <article><span className="eyebrow">O QUE IRÁ DESENVOLVER</span>{course.learningOutcomes?.length ? <ul className="launch-course-detail__outcomes">{course.learningOutcomes.map((outcome) => <li key={outcome}><CheckCircle2 size={17}/><span>{outcome}</span></li>)}</ul> : <EmptyState title="Programa em preparação">Os conteúdos detalhados serão publicados quando confirmados.</EmptyState>}</article>
    </section>

    <section className="launch-course-detail__registration"><div className="container launch-course-detail__registration-grid"><div><span className="eyebrow eyebrow--light">INSCRIÇÕES</span><h2>Próximas sessões</h2><p>Escolha uma sessão para solicitar a sua inscrição.</p></div><div><CourseSessionsView resource={sessionsQuery} course={course} /></div></div></section>
  </div>
}

function CourseFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div>{icon}<span>{label}</span><strong>{value}</strong></div> }
function humanize(value: string) { return value.replaceAll('_', ' ').toLocaleLowerCase('pt-PT').replace(/^./, (letter) => letter.toUpperCase()) }
function formatDate(value: string) { return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long', timeZone: 'Africa/Maputo' }).format(new Date(value)) }
function formatInvestment(value?: number, currency?: string) { if (value == null) return 'Consultar'; const amount = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(value); return currency === 'MZN' || !currency ? `${amount} MT` : `${amount} ${currency}` }
