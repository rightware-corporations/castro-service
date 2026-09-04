import { ArrowRight, Building2, GraduationCap, Handshake } from 'lucide-react'
import { Link } from 'react-router-dom'

const founderPortrait = import.meta.env.VITE_ELIZABETH_PORTRAIT_URL?.trim()

export function AboutPublic() {
  return <div className="launch-about">
    <section className="container launch-about__hero"><div><span className="eyebrow">SOBRE A CASTRO’S</span><h1>Uma marca construída para transformar experiência em <em>valor organizado.</em></h1><p>A Castro’s reúne consultoria, formação e espaços numa estrutura orientada a pessoas e organizações. Elizabeth Castro é a fundadora, consultora e formadora que dá rosto a essa proposta.</p></div><FounderMedia /></section>
    <section className="launch-about__founder"><div className="container launch-about__founder-grid"><div><span className="eyebrow eyebrow--light">ELIZABETH CASTRO</span><h2>O rosto da confiança. A empresa como estrutura de crescimento.</h2></div><div><p>A presença pública de Elizabeth em formação, comunicação e liderança é integrada à Castro’s sem transformar a empresa numa marca pessoal. A lógica é simples: a confiança nasce numa pessoa reconhecível e passa a ser sustentada por uma organização capaz de servir, acompanhar e crescer.</p><p>Esta página não inventa uma biografia. Marcos profissionais, história, formação e percurso serão acrescentados apenas quando forem confirmados pela própria Elizabeth e pela Castro’s.</p></div></div></section>
    <section className="container launch-about__pillars"><article><Handshake size={22}/><span>CONSULTORIA</span><h3>Compreender antes de propor.</h3><p>Soluções ligadas ao atendimento, ética, liderança e contexto organizacional.</p></article><article><GraduationCap size={22}/><span>FORMAÇÃO</span><h3>Conhecimento com aplicação.</h3><p>Cursos, palestras, workshops e formação para pessoas, equipas e organizações.</p></article><article><Building2 size={22}/><span>ESPAÇOS</span><h3>O ambiente também comunica.</h3><p>Espaços para reuniões, aprendizagem, colaboração e encontros profissionais.</p></article></section>
    <section className="container launch-about__cta"><div><span className="eyebrow">PRÓXIMO PASSO</span><h2>Conheça a Castro’s pelo que podemos construir consigo.</h2></div><Link className="ds-button ds-button--primary" to="/contacto">Começar uma conversa <ArrowRight size={17}/></Link></section>
  </div>
}

function FounderMedia() { return <figure className="launch-founder-portrait launch-founder-portrait--about">{founderPortrait ? <img src={founderPortrait} alt="Elizabeth Castro, fundadora da Castro’s"/> : <div className="launch-founder-portrait__placeholder" role="img" aria-label="Área reservada para o retrato oficial de Elizabeth Castro"><span>EC</span><small>Retrato oficial em preparação</small></div>}<figcaption><strong>Elizabeth Castro</strong><span>Fundadora · Consultora · Formadora</span></figcaption></figure> }
