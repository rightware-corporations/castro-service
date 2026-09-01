import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <section className="route-placeholder container">
      <span className="eyebrow">404 · CASTRO’S SERVICES</span>
      <h1>Página não encontrada.</h1>
      <p>O endereço indicado não corresponde a uma área disponível. Volte ao início para continuar a navegar.</p>
      <Link className="button button--primary" to="/">Voltar ao início</Link>
    </section>
  )
}
