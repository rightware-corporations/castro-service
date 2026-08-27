import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CircleDot } from 'lucide-react'

const routeLabels: Record<string, string> = {
  '/': 'Início',
  '/servicos': 'Serviços',
  '/formacao': 'Formação',
  '/espacos': 'Espaços',
  '/contacto': 'Contacto',
}

export function PublicFoundationPage() {
  const { pathname } = useLocation()
  const label = routeLabels[pathname] ?? 'Experiência pública'
  const isHome = pathname === '/'

  return (
    <section className="public-foundation container">
      <div className="public-foundation__copy">
        <span className="eyebrow">CASTRO’S SERVICES · FOUNDATION</span>
        <h1>{isHome ? 'Desenvolvemos pessoas, equipas e organizações.' : label}</h1>
        <p>
          A base pública está pronta. O conteúdo editorial, os serviços, a formação, os espaços e os fluxos de contacto serão implementados nas fases de produto, sempre com informação validada.
        </p>
        <div className="public-foundation__actions">
          <Link className="button button--primary" to="/contacto">Falar connosco <ArrowRight size={17} /></Link>
          <Link className="text-link" to="/espacos">Conhecer os espaços <ArrowRight size={16} /></Link>
        </div>
      </div>
      <div className="public-foundation__visual" aria-label="Área reservada para fotografia real Castro’s">
        <CircleDot size={32} aria-hidden="true" />
        <strong>FOTO REAL DA CASTRO’S</strong>
        <span>Placeholder de Foundation — asset aprovado pendente.</span>
      </div>
    </section>
  )
}
