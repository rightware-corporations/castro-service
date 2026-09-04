import { ArrowRight, MessageCircle, Network, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'

const topics = [
  { icon: MessageCircle, category: 'COMUNICAÇÃO', title: 'A importância de fazer follow-up', summary: 'O contacto inicial abre uma relação; o acompanhamento ajuda a dar continuidade, contexto e intenção ao que vem depois.' },
  { icon: Network, category: 'RELAÇÕES PROFISSIONAIS', title: 'Transformar contactos em relações profissionais', summary: 'Networking ganha valor quando o contacto não termina na troca de informação e passa a ser cultivado com propósito.' },
  { icon: UsersRound, category: 'LIDERANÇA', title: 'Comunicação e liderança para novas gerações', summary: 'Um tema recorrente na presença pública da Castro’s: como a liderança se adapta a novas formas de comunicar, colaborar e aprender.' },
]

export function InsightsPublic() {
  return <div className="launch-insights-page">
    <section className="container launch-insights-page__hero"><span className="eyebrow">CONHECIMENTO CASTRO’S</span><h1>Ideias que continuam a conversa <em>para além de uma publicação.</em></h1><p>Esta área cria a base editorial para transformar temas já trabalhados pela Castro’s em conteúdo pesquisável, partilhável e ligado aos serviços e formações certos.</p></section>
    <section className="container launch-insights-page__grid">{topics.map(({ icon: Icon, category, title, summary }, index) => <article key={title}><div><Icon size={21}/><span>0{index + 1}</span></div><small>{category}</small><h2>{title}</h2><p>{summary}</p><Link to="/contacto">Conversar sobre este tema <ArrowRight size={15}/></Link></article>)}</section>
    <section className="launch-insights-page__course"><div className="container"><div><span className="eyebrow eyebrow--light">DA IDEIA À PRÁTICA</span><h2>Quer desenvolver a sua comunicação?</h2><p>O Curso de Oratória e Comunicação Eficaz já está disponível na área de formação.</p></div><Link className="ds-button launch-insights-page__button" to="/formacao/oratoria-comunicacao-eficaz">Conhecer o curso <ArrowRight size={16}/></Link></div></section>
  </div>
}
