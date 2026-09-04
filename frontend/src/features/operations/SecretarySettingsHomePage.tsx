import { BookOpenText, CalendarClock, FileText, GraduationCap, MapPinned } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCan } from '../../app/providers/AppProviders'
import type { Permission } from '../../domain'

const settings = [
  { to: '/app/configuracoes/servicos', label: 'Serviços', description: 'Gerir o catálogo de serviços apresentado ao público.', permission: 'service.read' as Permission, icon: BookOpenText },
  { to: '/app/configuracoes/formacao', label: 'Formação', description: 'Gerir formações e sessões publicadas.', permission: 'course.read' as Permission, icon: GraduationCap },
  { to: '/app/configuracoes/espacos', label: 'Espaços', description: 'Gerir informação, capacidade, media e publicação dos espaços.', permission: 'space.read' as Permission, icon: MapPinned },
  { to: '/app/configuracoes/disponibilidade', label: 'Disponibilidade', description: 'Gerir horários, exceções e bloqueios da operação.', permission: 'availability.read' as Permission, icon: CalendarClock },
  { to: '/app/configuracoes/conteudo', label: 'Conteúdo', description: 'Atualizar conteúdo público e institucional aprovado.', permission: 'content.read' as Permission, icon: FileText },
]

export function SecretarySettingsHomePage() {
  const can = useCan()
  const visible = settings.filter((item) => can(item.permission))

  return <section className="ops-v2">
    <header className="ops-v2__hero"><div><span className="eyebrow">OPERAÇÃO</span><h1>Configurações do negócio</h1><p>Áreas que a Secretária pode manter no trabalho diário. Utilizadores, funções e permissões pertencem à administração RIGHTWARE.</p></div></header>
    <section className="ops-v2__modules" aria-label="Configurações operacionais">
      <div className="ops-v2__module-grid">
        {visible.map(({ to, label, description, icon: Icon }) => <Link key={to} to={to}><span className="ops-v2__module-icon"><Icon size={20} /></span><div><strong>{label}</strong><p>{description}</p></div></Link>)}
      </div>
    </section>
  </section>
}
