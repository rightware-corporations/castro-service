import { ArrowRight, ArrowUpRight, Building2, GraduationCap, Handshake, MessageCircle, Route, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const founderPortrait = import.meta.env.VITE_ELIZABETH_PORTRAIT_URL?.trim()

const pillars = [
  {
    eyebrow: 'CONSULTORIA',
    title: 'Compreender antes de propor.',
    description: 'Soluções ligadas ao atendimento, ética, liderança e contexto organizacional.',
    topics: ['Atendimento ao cliente', 'Ética & liderança', 'Contexto organizacional'],
    href: '/servicos',
    cta: 'Explorar serviços',
    icon: Handshake,
  },
  {
    eyebrow: 'FORMAÇÃO',
    title: 'Conhecimento com aplicação.',
    description: 'Cursos, palestras, workshops e formação para pessoas, equipas e organizações.',
    topics: ['Palestras & workshops', 'Formação', 'Treinamento personalizado'],
    href: '/formacao',
    cta: 'Explorar formação',
    icon: GraduationCap,
  },
  {
    eyebrow: 'ESPAÇOS',
    title: 'O ambiente também comunica.',
    description: 'Espaços para reuniões, aprendizagem, colaboração e encontros profissionais.',
    topics: ['Reuniões', 'Formação', 'Workshops'],
    href: '/espacos',
    cta: 'Explorar espaços',
    icon: Building2,
  },
] as const

export function AboutPublic() {
  return <div className="launch-about">
    <section className="container launch-about__hero">
      <div>
        <span className="eyebrow">SOBRE A CASTRO’S</span>
        <h1>Uma empresa com rosto, visão e <em>estrutura para crescer.</em></h1>
        <p>A Castro’s reúne consultoria, formação e espaços para apoiar pessoas e organizações. Elizabeth Castro é fundadora, consultora e formadora e dá rosto à relação de confiança que sustenta a marca.</p>
        <div className="launch-about__hero-actions"><Link className="ds-button ds-button--primary" to="/servicos">Conhecer a atuação <ArrowRight size={17} /></Link><Link className="home-v2-link" to="/contacto">Falar com a Castro’s <ArrowUpRight size={16} /></Link></div>
      </div>
      <FounderMedia />
    </section>

    <section className="launch-about__founder">
      <div className="container launch-about__founder-grid">
        <div><span className="eyebrow eyebrow--light">ELIZABETH CASTRO</span><h2>Experiência que se transforma em impacto.</h2></div>
        <div className="launch-about__founder-copy">
          <p>Elizabeth atua na Castro’s como fundadora, consultora e formadora, com foco em comunicação, liderança e desenvolvimento de pessoas e organizações.</p>
          <p>A Castro’s organiza essa presença numa única experiência de empresa: consultoria, formação e espaços permanecem ligados à mesma marca, ao mesmo atendimento e ao mesmo percurso do cliente.</p>
          <div className="launch-about__founder-themes" aria-label="Áreas de presença da fundadora"><span>Comunicação</span><span>Liderança</span><span>Desenvolvimento organizacional</span></div>
        </div>
      </div>
    </section>

    <section className="container launch-about__method" aria-labelledby="about-method-title">
      <div className="launch-about__method-head"><span className="eyebrow">COMO TRABALHAMOS</span><h2 id="about-method-title">Do contexto a uma decisão que pode avançar.</h2><p>O percurso não começa numa lista de produtos. Começa por perceber a necessidade e encaminhar a pessoa para o serviço, formação ou espaço que faz sentido.</p></div>
      <div className="launch-about__method-flow">
        <article><span>01</span><MessageCircle size={20} aria-hidden="true" /><h3>Contexto</h3><p>Começamos pela conversa e pela realidade de quem procura apoio.</p></article>
        <article><span>02</span><Route size={20} aria-hidden="true" /><h3>Caminho</h3><p>Organizamos a necessidade entre consultoria, formação, espaço ou uma combinação desses caminhos.</p></article>
        <article><span>03</span><Sparkles size={20} aria-hidden="true" /><h3>Próximo passo</h3><p>Seguimos para informação específica, configuração, pedido ou reserva quando a decisão estiver clara.</p></article>
      </div>
    </section>

    <section className="container launch-about__pillars" aria-label="Áreas Castro’s">
      {pillars.map(({ eyebrow, title, description, topics, href, cta, icon: Icon }) => <article key={href}>
        <div className="launch-about__pillar-top"><Icon size={22} aria-hidden="true" /><span>{eyebrow}</span></div>
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="launch-about__pillar-topics">{topics.map((topic) => <span key={topic}>{topic}</span>)}</div>
        <Link className="launch-about__pillar-link" to={href}>{cta} <ArrowUpRight size={16} /></Link>
      </article>)}
    </section>

    <section className="container launch-about__cta"><div><span className="eyebrow">PRÓXIMO PASSO</span><h2>Conheça a Castro’s pelo que podemos construir consigo.</h2></div><Link className="ds-button ds-button--primary" to="/contacto">Começar uma conversa <ArrowRight size={17}/></Link></section>
  </div>
}

function FounderMedia() { return <figure className="launch-founder-portrait launch-founder-portrait--about">{founderPortrait ? <img src={founderPortrait} alt="Elizabeth Castro, fundadora da Castro’s"/> : <div className="launch-founder-portrait__placeholder" role="img" aria-label="Área reservada para o retrato oficial de Elizabeth Castro"><span>EC</span><small>Retrato oficial em preparação</small></div>}<figcaption><strong>Elizabeth Castro</strong><span>Fundadora · Consultora · Formadora</span></figcaption></figure> }
