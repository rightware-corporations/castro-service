import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Building2, Compass, GraduationCap, UsersRound } from 'lucide-react'
import { ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'
import { Breadcrumbs } from '../../../design-system/patterns/navigation'
import { Button } from '../../../design-system/primitives'
import { bookingRoute } from '../../booking/routes'
import { useSpace } from '../hooks'
import { SpaceMediaPreview } from './SpaceMediaPreview'
import { formatCapacity } from './spacePresentation'
import './spaces-catalog-focus.css'

const purposeOptions = [
  { value: 'meeting', label: 'Reunião', icon: UsersRound },
  { value: 'training', label: 'Formação', icon: GraduationCap },
  { value: 'workshop', label: 'Workshop', icon: Compass },
  { value: 'other', label: 'Outro encontro', icon: Building2 },
]

export function SpaceConfigurator() {
  const { slug } = useParams()
  const query = useSpace(slug)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [purpose, setPurpose] = useState(parsePurpose(searchParams.get('purpose')))
  const initialPeople = parsePeople(searchParams.get('people'))
  const [people, setPeople] = useState<number | ''>(initialPeople)

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (purpose) next.set('purpose', purpose); else next.delete('purpose')
    if (people !== '') next.set('people', String(people)); else next.delete('people')
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true })
  }, [people, purpose, searchParams, setSearchParams])

  if (query.isLoading) return <section className="public-page container"><LoadingState label="A preparar configuração." /></section>
  if (query.isError || !query.data) return <section className="public-page container"><ErrorState title="Não foi possível configurar este espaço." /><Link className="text-link" to="/espacos">Voltar aos espaços</Link></section>
  const space = query.data
  const peopleTooLow = typeof people === 'number' && people < 1
  const peopleTooHigh = typeof people === 'number' && space.capacityMax !== undefined && people > space.capacityMax
  const peopleNotInteger = typeof people === 'number' && !Number.isSafeInteger(people)
  const peopleInvalid = peopleTooLow || peopleTooHigh || peopleNotInteger
  const peopleError = peopleNotInteger ? 'Indique um número inteiro de participantes.' : peopleTooLow ? 'O número de participantes deve ser pelo menos 1.' : peopleTooHigh ? `O valor ultrapassa a capacidade publicada de ${space.capacityMax}.` : ''
  const purposeLabel = purposeOptions.find((item) => item.value === purpose)?.label
  const bookingParams = new URLSearchParams()
  if (purpose) bookingParams.set('purpose', purpose)
  if (people !== '') bookingParams.set('people', String(people))
  const bookingHref = `${bookingRoute('SPACE', space.id, 'selection')}?${bookingParams.toString()}`

  return <div className="space-config-v2">
    <section className="container space-config-v2__header"><Breadcrumbs items={[{ label: 'Espaços', href: '/espacos' }, { label: space.name, href: `/espacos/${encodeURIComponent(space.slug)}` }, { label: 'Configurar' }]} /><div><span className="eyebrow">CONFIGURAR ESPAÇO</span><h1>Prepare o encontro <em>à sua maneira.</em></h1><p>Indique a finalidade do encontro e o número previsto de participantes.</p></div></section>
    <section className="container space-config-v2__layout">
      <div className="space-config-v2__controls">
        <div className="space-config-v2__section"><div className="space-config-v2__section-title"><span>01</span><div><h2>Qual é o tipo de encontro?</h2><p>Selecione a opção que melhor descreve o seu encontro.</p></div></div><div className="space-config-v2__purpose">{purposeOptions.map(({ value, label, icon: Icon }) => <button className={purpose === value ? 'is-selected' : ''} key={value} type="button" onClick={() => setPurpose(value)} aria-pressed={purpose === value}><Icon size={19} /><span>{label}</span><ArrowUpRight size={15} /></button>)}</div></div>
        <div className="space-config-v2__section"><div className="space-config-v2__section-title"><span>02</span><div><h2>Quantas pessoas?</h2><p>{space.capacityMax !== undefined ? `O espaço publicado indica capacidade máxima de ${space.capacityMax}.` : 'Indique o número previsto de participantes.'}</p></div></div><label className="space-config-v2__people"><span>Participantes</span><input type="number" step="1" min="1" max={space.capacityMax} value={people} onChange={(event) => setPeople(event.target.value === '' ? '' : Number(event.target.value))} aria-invalid={peopleInvalid} aria-describedby={peopleInvalid ? 'space-config-people-error' : undefined} />{peopleInvalid && <small id="space-config-people-error">{peopleError}</small>}</label></div>
        <div className="space-config-v2__section space-config-v2__pending"><div className="space-config-v2__section-title"><span>03</span><div><h2>Layout & recursos</h2><p>As opções serão apresentadas quando existirem configurações reais publicadas para este espaço.</p><small className="space-config-v2__pending-label">AINDA NÃO PUBLICADO</small></div></div></div>
      </div>
      <aside className="space-config-v2__summary"><SpaceMediaPreview space={space} variant="config" /><span className="eyebrow">RESUMO</span><h2>{space.name}</h2><dl><div><dt>Finalidade</dt><dd>{purposeLabel ?? 'A escolher'}</dd></div><div><dt>Participantes</dt><dd>{people === '' ? 'A indicar' : people}</dd></div><div><dt>Capacidade</dt><dd>{formatCapacity(space)}</dd></div></dl><Button disabled={!purpose || people === '' || peopleInvalid} onClick={() => navigate(bookingHref)}>Ver disponibilidade <ArrowRight size={16} /></Button><small>A disponibilidade será calculada pelo sistema no próximo passo.</small></aside>
    </section>
  </div>
}

function parsePurpose(value: string | null) {
  return purposeOptions.some((option) => option.value === value) ? value ?? '' : ''
}

function parsePeople(value: string | null): number | '' {
  if (!value) return ''
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : ''
}
