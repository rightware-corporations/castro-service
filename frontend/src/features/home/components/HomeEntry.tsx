import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { flushSync } from 'react-dom'
import { useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import './home-entry.css'

const entryKey = 'castros.home.entry.v1'
let entered = false
function hasEntered() {
  try { return sessionStorage.getItem(entryKey) === 'seen' } catch { return entered }
}
function rememberEntry() {
  entered = true
  try { sessionStorage.setItem(entryKey, 'seen') } catch { /* Storage is optional. */ }
}

const practices = [
  { name: 'Consultoria', route: '/servicos', action: 'Explorar serviços', title: 'Clareza no atendimento. Ética na liderança.', description: 'Atendimento ao cliente, ética, liderança e soluções construídas em torno do contexto de cada organização.' },
  { name: 'Formação', route: '/formacao', action: 'Explorar formação', title: 'Aprender também é transformar a forma de trabalhar.', description: 'Momentos de aprendizagem e treinamento corporativo preparados para pessoas, equipas e organizações.' },
  { name: 'Espaços', route: '/espacos', action: 'Explorar espaços', title: 'O lugar também faz parte da experiência.', description: 'Um espaço físico para reuniões, formação, workshops e outros encontros que pedem foco e proximidade.' },
] as const

export function HomeEntry({ reviewPhase, consulting, training, spaces, closing = false }: { reviewPhase?: 0 | 1 | 2 | 3; consulting?: ReactNode; training?: ReactNode; spaces?: ReactNode; closing?: boolean } = {}) {
  const reduced = useReducedMotion()
  const frozenPhase = import.meta.env.DEV ? reviewPhase : undefined
  const [entry, setEntry] = useState(() => frozenPhase ?? (reduced || hasEntered() ? 3 : 0))
  const initialEntry = useRef(entry)
  const [progress, setProgress] = useState(0)
  const [selected, setSelected] = useState(0)
  const [portraitError, setPortraitError] = useState(false)
  const track = useRef<HTMLElement>(null)
  const gatewayRef = useRef<HTMLDivElement>(null)
  const consultingRef = useRef<HTMLDivElement>(null)
  const trainingRef = useRef<HTMLDivElement>(null)
  const spacesRef = useRef<HTMLDivElement>(null)
  const proofRef = useRef<HTMLDivElement>(null)
  const finalRef = useRef<HTMLDivElement>(null)
  const sceneCount = closing ? 6 : spaces ? 4 : training ? 3 : consulting ? 2 : 1
  const practiceRefs = useRef<(HTMLButtonElement | null)[]>([])
  const finalActive = closing && progress >= 5.2
  const proofActive = closing && progress >= 4.2
  const spacesActive = !!spaces && progress >= 3.2
  const spacesTransition = !!spaces && progress >= 2.95 && !spacesActive
  const trainingActive = !!training && progress >= 2.2
  const trainingTransition = !!training && progress >= 1.95 && !trainingActive
  const consultingActive = !!consulting && progress >= 1.2
  const gateway = progress >= .6
  const frame = entry < 3 ? `H0${entry}` : finalActive ? 'H12' : proofActive ? 'H11' : spacesActive || (spacesTransition && reduced) ? 'H10' : spacesTransition ? 'H09' : trainingActive || (trainingTransition && reduced) ? 'H08' : trainingTransition ? 'H07' : consultingActive ? 'H06' : progress > .08 ? gateway ? 'H05' : 'H04' : 'H03'
  const practice = practices[selected]
  const progressLabel = finalActive ? 'Conversa' : proofActive ? 'Pessoas' : spacesActive || spacesTransition ? 'Espaços' : trainingActive || trainingTransition ? 'Formação' : consultingActive ? 'Consultoria' : gateway ? 'As nossas práticas' : 'Pessoas. Conhecimento. Espaço.'
  const progressNumber = finalActive ? '07' : proofActive ? '06' : spacesActive || spacesTransition ? '05' : trainingActive || trainingTransition ? '04' : consultingActive ? '03' : gateway ? '02' : '01'

  useEffect(() => {
    if (frozenPhase !== undefined) return
    if (initialEntry.current >= 3) { rememberEntry(); return }
    let timers: number[] = []
    const finish = () => { timers.forEach(clearTimeout); rememberEntry(); setEntry(3) }
    timers = reduced ? [window.setTimeout(finish, 0)] : [
      window.setTimeout(() => setEntry(1), 200),
      window.setTimeout(() => setEntry(2), 550),
      window.setTimeout(finish, 1200),
    ]
    for (const event of ['wheel', 'touchstart', 'keydown', 'pointerdown']) window.addEventListener(event, finish, { passive: true, once: true })
    return () => {
      timers.forEach(clearTimeout)
      for (const event of ['wheel', 'touchstart', 'keydown', 'pointerdown']) window.removeEventListener(event, finish)
    }
  }, [reduced, frozenPhase])

  useEffect(() => {
    let pending = 0
    const measure = () => {
      pending = 0
      if (!track.current) return
      const rect = track.current.getBoundingClientRect()
      const mobile = window.matchMedia('(max-width: 767px)').matches
      const distance = mobile ? Math.max(1, (gatewayRef.current?.offsetTop ?? 700) - 150) : Math.max(1, (rect.height - window.innerHeight) / sceneCount)
      const inConsulting = mobile && consultingRef.current && consultingRef.current.getBoundingClientRect().top <= 180
      const trainingTop = mobile && trainingRef.current ? trainingRef.current.getBoundingClientRect().top : Infinity
      const spacesTop = mobile && spacesRef.current ? spacesRef.current.getBoundingClientRect().top : Infinity
      const inProof = mobile && proofRef.current && proofRef.current.getBoundingClientRect().top <= 180
      const inFinal = mobile && finalRef.current && finalRef.current.getBoundingClientRect().top <= 180
      setProgress(inFinal ? 5.5 : inProof ? 4.5 : spacesTop <= 180 ? 3.5 : spacesTop <= 320 ? 3 : trainingTop <= 180 ? 2.5 : trainingTop <= 320 ? 2 : inConsulting ? 1.5 : Math.max(0, Math.min(!mobile ? sceneCount : 1, (84 - rect.top) / distance)))
    }
    const schedule = () => { if (!pending) pending = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => { cancelAnimationFrame(pending); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule) }
  }, [sceneCount])

  function explore() {
    if (!track.current) return
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const top = mobile && gatewayRef.current
      ? gatewayRef.current.getBoundingClientRect().top + window.scrollY - 100
      : track.current.getBoundingClientRect().top + window.scrollY + (track.current.offsetHeight - window.innerHeight) / sceneCount * .7 - 84
    // Expose the destination before moving focus; then resolve the native scroll.
    flushSync(() => setProgress(.7))
    gatewayRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top, behavior: 'instant' })
  }

  return <section ref={track} className="home-entry" data-frame={frame} data-consulting={!!consulting} data-training={!!training} data-spaces={!!spaces} data-closing={closing} data-intro={entry < 3} data-reduced={!!reduced} data-practice={selected} aria-label="A experiência Castro’s">
    <div className="home-entry__stage">
      <div className="home-entry__media" data-content-class="REAL_COPY">
        {portraitError ? <p className="home-entry__media-error" role="status">O retrato de Elizabeth Castro não está disponível neste momento.</p> : <img src="/IMG_3376.JPG.jpeg" alt="Elizabeth Castro, fundadora da Castro’s" width="1104" height="1600" fetchPriority="high" onError={() => setPortraitError(true)} />}
        <Link className="home-entry__identity" to="/sobre"><span>Elizabeth Castro</span><small>Fundadora · Consultora · Formadora</small><ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
      <div className="home-entry__hero" inert={gateway || entry < 3}>
        <span className="home-entry__eyebrow">CASTRO’S SERVICES · MAPUTO</span>
        <h1>Onde pessoas,<br /> liderança e <em>experiência</em><br /> se encontram.</h1>
        <p>Consultoria, formação e espaços pensados para criar conversas mais claras, equipas mais preparadas e encontros com intenção.</p>
        <button className="home-entry__cta" onClick={explore}>Explorar a experiência <ArrowDown size={18} aria-hidden="true" /></button>
        <div className="home-entry__pillars" aria-label="Áreas Castro’s">Consultoria <span>·</span> Formação <span>·</span> Espaços</div>
      </div>
      <div ref={gatewayRef} className="home-entry__gateway" tabIndex={-1} aria-label="Escolher uma prática">
        <span className="home-entry__eyebrow">TRÊS PORTAS DE ENTRADA</span>
        <h2>Comece pelo que a sua<br /> realidade pede agora.</h2>
        <div className="home-entry__choices" role="tablist" aria-label="Práticas Castro’s" aria-orientation="vertical">
          {practices.map((item, index) => <button key={item.route} ref={(node) => { practiceRefs.current[index] = node }} type="button" role="tab" id={`practice-${index}`} aria-controls="practice-detail" aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={(event) => {
            if (event.ctrlKey || event.metaKey || event.altKey) return
            const next = event.key === 'ArrowDown' ? (index + 1) % 3 : event.key === 'ArrowUp' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null
            if (next !== null) { event.preventDefault(); setSelected(next); practiceRefs.current[next]?.focus() }
          }}><span>0{index + 1}</span>{item.name}<ArrowUpRight size={24} aria-hidden="true" /></button>)}
        </div>
        <div className="home-entry__detail" id="practice-detail" role="tabpanel" aria-labelledby={`practice-${selected}`} tabIndex={0}>
          <h3>{practice.title}</h3><p>{practice.description}</p>
          <Link className="home-entry__cta" to={practice.route}>{practice.action}<ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </div>
      {consulting && <div ref={consultingRef} className="home-entry__consulting" id="home-consulting" aria-labelledby="home-consulting-title">
        <div className="home-entry__consulting-mobile-media" aria-hidden="true">
          {!portraitError && <img src="/IMG_3376.JPG.jpeg" alt="" width="1104" height="1600" loading="lazy" onError={() => setPortraitError(true)} />}
        </div>
        <div className="home-entry__consulting-copy">
          <span className="home-entry__eyebrow">01 / CONSULTORIA</span>
          <h2 id="home-consulting-title">Do contexto à ação.</h2>
          <p>Atendimento ao cliente, ética, liderança e soluções construídas em torno do contexto de cada organização.</p>
          {consulting}
          <button type="button" className="home-entry__back" onClick={explore}>Voltar às práticas <ArrowDown size={16} aria-hidden="true" /></button>
        </div>
      </div>}
      {training && <div ref={trainingRef} className="home-entry__consulting home-entry__training" id="home-training" aria-labelledby="home-training-title">
        <div className="home-entry__training-connector" aria-hidden="true"><span>01</span><i /><span>02</span></div>
        <div className="home-entry__consulting-mobile-media" aria-hidden="true">
          {!portraitError && <img src="/IMG_3376.JPG.jpeg" alt="" width="1104" height="1600" loading="lazy" onError={() => setPortraitError(true)} />}
        </div>
        <div className="home-entry__consulting-copy">
          <span className="home-entry__eyebrow">02 / FORMAÇÃO</span>
          <h2 id="home-training-title">Aprender também é transformar a forma de trabalhar.</h2>
          <p>Momentos de aprendizagem e treinamento corporativo preparados para pessoas, equipas e organizações.</p>
          {training}
          <button type="button" className="home-entry__back" onClick={explore}>Voltar à escolha de práticas <ArrowDown size={16} aria-hidden="true" /></button>
        </div>
      </div>}
      {spaces && <div ref={spacesRef} className="home-entry__spaces" id="home-spaces" aria-labelledby="home-spaces-title">{spaces}</div>}
      {closing && <>
        <div ref={proofRef} className="home-entry__proof" id="home-proof" aria-labelledby="home-proof-title">
          <div className="home-entry__consulting-mobile-media" aria-hidden="true">{!portraitError && <img src="/IMG_3376.JPG.jpeg" alt="" width="1104" height="1600" loading="lazy" onError={() => setPortraitError(true)} />}</div>
          <div className="home-entry__proof-copy">
            <span className="home-entry__eyebrow">FUNDADORA</span>
            <h2 id="home-proof-title">Experiência que se transforma em impacto.</h2>
            <p>Fundadora da Castro’s, consultora e formadora dedicada ao desenvolvimento de pessoas e organizações através da comunicação, liderança e desenvolvimento organizacional.</p>
            <Link className="home-entry__cta" to="/sobre">Conhecer a Castro’s e a sua fundadora <ArrowUpRight size={18} aria-hidden="true" /></Link>
            {import.meta.env.DEV && <p className="home-entry__pending" data-content-class="PENDING_CONTENT">Testemunhos aprovados em preparação.</p>}
          </div>
        </div>
        <div ref={finalRef} className="home-entry__final" id="home-conversation" aria-labelledby="home-conversation-title">
          <img className="home-entry__final-logo" src="/castros-logo-original.jpg" alt="Castro’s Services" width="192" height="48" />
          <span className="home-entry__eyebrow">PRÓXIMO PASSO</span>
          <h2 id="home-conversation-title">Começamos pela conversa certa.</h2>
          <Link className="home-entry__cta" to="/contacto">Falar com a Castro’s <ArrowUpRight size={20} aria-hidden="true" /></Link>
        </div>
      </>}
      <div className="home-entry__progress" aria-label={progressLabel}><button type="button" aria-label="Voltar ao início da experiência" onClick={() => {
        const top = (track.current?.getBoundingClientRect().top ?? 84) + window.scrollY - 84
        window.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
      }}>{progressNumber}</button><i aria-hidden="true"><b style={{ transform: `scaleX(${.25 + Math.min(1, progress / sceneCount) * .75})` }} /></i><span>{progressLabel}</span></div>
    </div>
    {entry < 3 && <div className="home-entry__intro" aria-hidden="true"><div className="home-entry__brand-seed"><span /><img src="/castros-logo-original.jpg" alt="" /></div></div>}
  </section>
}
