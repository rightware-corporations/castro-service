import { ArrowRight, ArrowUpRight, BookOpenText, Building2, CheckCircle2, GraduationCap, Handshake, MessageCircle, Mic2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCourses } from '../../courses/hooks'
import { useServices } from '../../services/hooks'
import { useSpacesPreview } from '../../spaces/hooks'

const founderPortrait = import.meta.env.VITE_ELIZABETH_PORTRAIT_URL?.trim()

export function HomeLaunchPublic() {
  const coursesQuery = useCourses()
  const servicesQuery = useServices()
  const spacesQuery = useSpacesPreview()
  const featuredCourse = coursesQuery.data?.items.find((course) => course.slug === 'oratoria-comunicacao-eficaz') ?? coursesQuery.data?.items.find((course) => course.featured)

  return <div className="launch-home">
    <section className="launch-hero">
      <div className="container launch-hero__grid">
        <div className="launch-hero__copy">
          <span className="eyebrow">CASTRO’S SERVICES · CONSULTORIA · FORMAÇÃO · ESPAÇOS</span>
          <h1>Comunicação, liderança e soluções que aproximam <em>pessoas e organizações.</em></h1>
          <p>Consultoria, formação, palestras e experiências concebidas para desenvolver pessoas, equipas e organizações com mais clareza, confiança e intenção.</p>
          <div className="launch-hero__actions">
            <Link className="ds-button ds-button--primary" to="/servicos">Explorar serviços <ArrowRight size={17} /></Link>
            <Link className="launch-text-link" to="/contacto">Falar com a Castro’s <ArrowUpRight size={16} /></Link>
          </div>
          {featuredCourse && <Link className="launch-course-ribbon" to={`/formacao/${featuredCourse.slug}`}><span>AGORA NA CASTRO’S</span><strong>{featuredCourse.name}</strong><small>Inscrições abertas · {featuredCourse.modality ? humanize(featuredCourse.modality) : 'Formação'} · {featuredCourse.durationLabel || 'Ver detalhes'}</small><ArrowUpRight size={18} /></Link>}
        </div>

        <FounderPortrait compact={false} />
      </div>
    </section>

    <section className="container launch-pillars" aria-labelledby="launch-pillars-title">
      <div className="launch-section-heading"><span className="eyebrow">COMO PODEMOS APOIAR</span><h2 id="launch-pillars-title">Uma marca. Três formas de criar valor.</h2></div>
      <div className="launch-pillars__grid">
        <Link to="/servicos"><Handshake size={22}/><span>01</span><h3>Consultoria</h3><p>Atendimento ao cliente, ética, liderança e desenvolvimento organizacional.</p><strong>Explorar <ArrowRight size={15}/></strong></Link>
        <Link to="/formacao"><GraduationCap size={22}/><span>02</span><h3>Formação</h3><p>Cursos, workshops, palestras e treinamento corporativo com aplicação prática.</p><strong>Explorar <ArrowRight size={15}/></strong></Link>
        <Link to="/espacos"><Building2 size={22}/><span>03</span><h3>Espaços</h3><p>Ambientes para reuniões, formação, workshops e encontros com propósito.</p><strong>Explorar <ArrowRight size={15}/></strong></Link>
      </div>
    </section>

    {featuredCourse && <section className="launch-featured-course">
      <div className="container launch-featured-course__grid">
        <div className="launch-featured-course__intro"><span className="eyebrow eyebrow--light">CURSO EM DESTAQUE</span><h2>{featuredCourse.name}</h2><p>{featuredCourse.summary || 'Formação para desenvolver competências com aplicação prática e acompanhamento da Castro’s.'}</p><Link className="ds-button launch-featured-course__button" to={`/formacao/${featuredCourse.slug}`}>Ver curso e inscrição <ArrowRight size={17}/></Link></div>
        <div className="launch-featured-course__facts">
          <Fact icon={<Mic2 size={18}/>} label="Modalidade" value={featuredCourse.modality ? humanize(featuredCourse.modality) : 'A confirmar'} />
          <Fact icon={<BookOpenText size={18}/>} label="Duração" value={featuredCourse.durationLabel || 'A confirmar'} />
          <Fact icon={<CheckCircle2 size={18}/>} label="Investimento" value={formatInvestment(featuredCourse.investmentAmount, featuredCourse.investmentCurrency)} />
          {featuredCourse.certificateIncluded && <Fact icon={<GraduationCap size={18}/>} label="Inclui" value="Inscrição e certificado" />}
          {featuredCourse.scheduleSummary && <div className="launch-featured-course__schedule"><span>HORÁRIOS</span><strong>{featuredCourse.scheduleSummary}</strong></div>}
        </div>
      </div>
    </section>}

    <section className="container launch-founder">
      <FounderPortrait compact />
      <div className="launch-founder__copy"><span className="eyebrow">ELIZABETH CASTRO</span><h2>Uma empresa com rosto, visão e estrutura para crescer.</h2><p>Elizabeth Castro é a fundadora, consultora e formadora por detrás da Castro’s. A sua presença dá rosto à confiança já construída pela marca, enquanto a Castro’s organiza essa experiência em serviços, formação e soluções capazes de crescer como empresa.</p><blockquote>Elizabeth dá rosto à confiança. A Castro’s transforma essa confiança numa estrutura de valor para pessoas e organizações.</blockquote><Link className="launch-text-link" to="/sobre">Conhecer a história e a visão <ArrowRight size={16}/></Link></div>
    </section>

    <section className="container launch-proof">
      <div><span className="eyebrow">OFERTA REAL</span><h2>Explore o que já está disponível.</h2><p>O catálogo é alimentado pelo sistema. Serviços, formações e espaços só aparecem quando estão publicados.</p></div>
      <div className="launch-proof__lists">
        <section><span>SERVIÇOS</span>{servicesQuery.data?.items.slice(0, 4).map((service) => <Link key={service.slug} to={`/servicos/${service.slug}`}>{service.name}<ArrowUpRight size={15}/></Link>)}{!servicesQuery.data?.items.length && <small>Catálogo em preparação.</small>}</section>
        <section><span>FORMAÇÃO</span>{coursesQuery.data?.items.slice(0, 4).map((course) => <Link key={course.slug} to={`/formacao/${course.slug}`}>{course.name}<ArrowUpRight size={15}/></Link>)}{!coursesQuery.data?.items.length && <small>Catálogo em preparação.</small>}</section>
        <section><span>ESPAÇOS</span>{spacesQuery.data?.items.slice(0, 3).map((space) => <Link key={space.slug} to={`/espacos/${space.slug}`}>{space.name}<ArrowUpRight size={15}/></Link>)}{!spacesQuery.data?.items.length && <small>Experiência visual em preparação.</small>}</section>
      </div>
    </section>

    <section className="launch-insights">
      <div className="container"><div className="launch-section-heading launch-section-heading--split"><div><span className="eyebrow">CONHECIMENTO CASTRO’S</span><h2>Conteúdo que prolonga a conversa.</h2></div><Link className="launch-text-link" to="/insights">Explorar insights <ArrowRight size={16}/></Link></div>
        <div className="launch-insights__grid"><Insight index="01" title="A importância de fazer follow-up"/><Insight index="02" title="Transformar contactos em relações profissionais"/><Insight index="03" title="Comunicação e liderança para novas gerações"/></div>
      </div>
    </section>

    <section className="launch-final-cta"><div className="container launch-final-cta__inner"><div><span className="eyebrow eyebrow--light">PRÓXIMO PASSO</span><h2>O seu contexto vem primeiro.</h2></div><div><p>Conte-nos o que pretende desenvolver, organizar ou transformar. O pedido chega à equipa com o contexto certo para o acompanhamento.</p><Link className="ds-button launch-final-cta__button" to="/contacto">Começar uma conversa <MessageCircle size={17}/></Link></div></div></section>
  </div>
}

function FounderPortrait({ compact }: { compact: boolean }) {
  return <figure className={`launch-founder-portrait ${compact ? 'launch-founder-portrait--compact' : ''}`}>
    {founderPortrait ? <img src={founderPortrait} alt="Elizabeth Castro, fundadora da Castro’s" /> : <div className="launch-founder-portrait__placeholder" role="img" aria-label="Área reservada para o retrato oficial de Elizabeth Castro"><span>EC</span><small>Retrato oficial em preparação</small></div>}
    <figcaption><strong>Elizabeth Castro</strong><span>Fundadora · Consultora · Formadora</span></figcaption>
  </figure>
}
function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="launch-featured-course__fact">{icon}<div><span>{label}</span><strong>{value}</strong></div></div> }
function Insight({ index, title }: { index: string; title: string }) { return <Link to="/insights"><span>{index}</span><h3>{title}</h3><strong>Ler tema <ArrowUpRight size={15}/></strong></Link> }
function humanize(value: string) { return value.replaceAll('_', ' ').toLocaleLowerCase('pt-PT').replace(/^./, (letter) => letter.toUpperCase()) }
function formatInvestment(value?: number, currency?: string) { if (value == null) return 'Consultar'; const amount = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(value); return currency === 'MZN' || !currency ? `${amount} MT` : `${amount} ${currency}` }
