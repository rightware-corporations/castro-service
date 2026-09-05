import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { Link } from 'react-router-dom'
import { motionPresets, motionSprings } from '../motion/motionPresets'

export function SkipLink({ href = '#main-content', label = 'Saltar para o conteúdo principal' }: { href?: string; label?: string }) { return <a className="ds-skip-link" href={href}>{label}</a> }

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) { return <nav className="ds-breadcrumbs" aria-label="Breadcrumbs">{items.map((item, index) => <span key={item.label}>{item.href ? <Link to={item.href}>{item.label}</Link> : <strong aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</strong>}{index < items.length - 1 && <span aria-hidden="true">/</span>}</span>)}</nav> }

export function Tabs({ items, initialId }: { items: { id: string; label: string; content: ReactNode }[]; initialId?: string }) {
  const [activeId, setActiveId] = useState(initialId ?? items[0]?.id)
  const listRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ x: 0, width: 0, visible: false })
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId))

  useLayoutEffect(() => {
    const list = listRef.current
    const tab = list?.querySelector<HTMLElement>(`#tab-${CSS.escape(activeId ?? '')}`)
    if (!list || !tab) return
    setIndicator({ x: tab.offsetLeft, width: tab.offsetWidth, visible: true })
  }, [activeId, items])

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!items.length) return
    const nextIndex = event.key === 'ArrowRight' ? (activeIndex + 1) % items.length : event.key === 'ArrowLeft' ? (activeIndex - 1 + items.length) % items.length : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : -1
    if (nextIndex >= 0) { event.preventDefault(); setActiveId(items[nextIndex].id); document.getElementById(`tab-${items[nextIndex].id}`)?.focus() }
  }
  const activeItem = items.find((item) => item.id === activeId)
  return <div className="ds-tabs"><div ref={listRef} className="ds-tabs__list" role="tablist" aria-label="Secções">{items.map((item) => <button key={item.id} id={`tab-${item.id}`} className="ds-tabs__tab" type="button" role="tab" aria-selected={activeId === item.id} aria-controls={`panel-${item.id}`} tabIndex={activeId === item.id ? 0 : -1} onClick={() => setActiveId(item.id)} onKeyDown={onKeyDown}>{item.label}</button>)}<m.span className="ds-tabs__indicator" initial={false} animate={{ x: indicator.x, width: indicator.width, opacity: indicator.visible ? 1 : 0 }} transition={motionSprings.selection} aria-hidden="true" /></div><AnimatePresence mode="wait" initial={false}>{activeItem ? <m.div className="ds-tabs__panel" key={activeItem.id} id={`panel-${activeItem.id}`} role="tabpanel" tabIndex={0} aria-labelledby={`tab-${activeItem.id}`} initial={motionPresets.fade.initial} animate={motionPresets.fade.animate} exit={motionPresets.fade.exit} transition={motionPresets.fade.transition}>{activeItem.content}</m.div> : null}</AnimatePresence></div>
}

export function Stepper({ steps, current }: { steps: { id: string; label: string }[]; current: string }) {
  return <ol className="ds-stepper" aria-label="Progresso">{steps.map((step, index) => <li key={step.id} className={step.id === current ? 'is-current' : ''}><span>{step.id === current ? <m.i className="ds-stepper__selection" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={motionSprings.selection} aria-hidden="true" /> : null}<b className="ds-stepper__value">{index + 1}</b></span><strong>{step.label}</strong></li>)}</ol>
}

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) { return <nav className="ds-pagination" aria-label="Paginação"><button className="ds-button ds-button--tertiary ds-button--sm" type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Anterior</button><span>Página {page} de {totalPages}</span><button className="ds-button ds-button--tertiary ds-button--sm" type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Seguinte</button></nav> }

export function MobileTopbar({ title, onMenu }: { title: string; onMenu: () => void }) { return <header className="ds-mobile-topbar"><button className="ds-button ds-button--icon" type="button" aria-label="Abrir menu" onClick={onMenu}>☰</button><strong>{title}</strong><span aria-hidden="true" /> </header> }
export function MobileBottomNavigation({ items }: { items: { href: string; label: string; icon?: ReactNode }[] }) { return <nav className="ds-mobile-bottom-nav" aria-label="Navegação mobile">{items.map((item) => <Link key={item.href} to={item.href}>{item.icon}<span>{item.label}</span></Link>)}</nav> }
