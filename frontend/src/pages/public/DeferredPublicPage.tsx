import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { EmptyState } from '../../design-system/patterns/feedback-overlays'

export function DeferredPublicPage() {
  const { pathname } = useLocation()
  const subject = pathname.startsWith('/espacos') ? 'Espaços' : 'Esta área'
  return <section className="public-page container"><header className="public-page-intro"><span className="eyebrow">CASTRO’S · PRÓXIMA ETAPA</span><h1>{subject}</h1><p>Esta experiência pertence a uma próxima milestone e não é apresentada como produto concluído nesta fase.</p></header><EmptyState title="Experiência em preparação.">O conteúdo, fotografia e disponibilidade serão ligados quando os contratos e assets estiverem confirmados.</EmptyState><Link className="text-link" to="/"><ArrowLeft size={16} />Voltar ao início</Link></section>
}
