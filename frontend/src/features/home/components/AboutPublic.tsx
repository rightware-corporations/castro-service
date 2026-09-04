import { ArrowRight, Building2, GraduationCap, Handshake } from 'lucide-react'
import { Link } from 'react-router-dom'

const founderPortrait = import.meta.env.VITE_ELIZABETH_PORTRAIT_URL?.trim()

export function AboutPublic() {
  return <div className="launch-about">
    <section className="container launch-about__hero"><div><span className="eyebrow">SOBRE A CASTRO’S</span><h1>Uma empresa com rosto, visão e <em>estrutura para crescer.</em></h1><p>A Castro’s reúne consultoria, formação e espaços para apoiar pessoas e organizações. Elizabeth Castro é fundadora, consultora e formadora e dá rosto à relação de confiança que sustenta a marca.</p></div><FounderMedia /></section>
    <section className="launch-about__founder"><div className="container launch-about__founder-grid"><div><span className="eyebrow eyebrow--light">ELIZABETH CASTRO</span><h2>Experiência que se transforma em impacto.</h2></div><div><p>Elizabeth atua na Castro’s como fundadora, consultora e formadora, com foco em comunicação, liderança e desenvolvimento de pessoas e organizações.</p><p>A Castro’s organiza essa presença numa única experiência de empresa: consultoria, formação e espaços permanecem ligados à mesma marca, ao mesmo atendimento e ao mesmo percurso do cliente.</p></div></div></section>
    <section className="container launch-about__pillars"><article><Handshake size={22}/><span>CONSULTORIA</span><h3>Compreender antes de propor.</h3><p>Soluções ligadas ao atendimento, ética, liderança e contexto organizacional.</p></article><article><GraduationCap size={22}/><span>FORMAÇÃO</span><h3>Conhecimento com aplicação.</h3><p>Cursos, palestras, workshops e formação para pessoas, equipas e organizações.</p></article><article><Building2 size={22}/><span>ESPAÇOS</span><h3>O ambiente também comunica.</h3><p>Espaços para reuniões, aprendizagem, colaboração e encontros profissionais.</p></article></section>
    <section className="container launch-about__cta"><div><span className="eyebrow">PRÓXIMO PASSO</span><h2>Conheça a Castro’s pelo que podemos construir consigo.</h2></div><Link className="ds-button ds-button--primary" to="/contacto">Começar uma conversa <ArrowRight size={17}/></Link></section>
  </div>
}

function FounderMedia() { return <figure className="launch-founder-portrait launch-founder-portrait--about">{founderPortrait ? <img src={founderPortrait} alt="Elizabeth Castro, fundadora da Castro’s"/> : <div className="launch-founder-portrait__placeholder" role="img" aria-label="Área reservada para o retrato oficial de Elizabeth Castro"><span>EC</span><small>Retrato oficial em preparação</small></div>}<figcaption><strong>Elizabeth Castro</strong><span>Fundadora · Consultora · Formadora</span></figcaption></figure> }
