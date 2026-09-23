import { Component, Suspense, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'

class SpaceRouteBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <section className="public-page container">
      <ErrorState title="Não foi possível abrir esta experiência." />
      <p>Verifique a ligação e tente carregar novamente.</p>
      <button className="ds-button ds-button--primary" type="button" onClick={() => window.location.reload()}>Carregar novamente</button>
      <p><Link className="text-link" to="/espacos">Voltar aos espaços</Link></p>
    </section>
    return this.props.children
  }
}

export function DeferredSpaceRoute({ children, label }: { children: ReactNode; label: string }) {
  return <SpaceRouteBoundary><Suspense fallback={<section className="public-page container"><LoadingState label={label} /></section>}>{children}</Suspense></SpaceRouteBoundary>
}
