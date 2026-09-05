import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react'
import { AnimatePresence, motion, useIsPresent } from 'motion/react'
import { AlertCircle, CheckCircle2, Info, LoaderCircle, X } from 'lucide-react'
import { IconButton } from '../primitives'
import { motionPresets } from '../motion/motionPresets'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusableElements(container: HTMLElement | null) {
  if (!container) return []
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true')
}

function useModalFocus(active: boolean, onClose: () => void, containerRef: RefObject<HTMLElement | null>, initialFocusRef?: RefObject<HTMLElement | null>) {
  const previousFocus = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!active) return
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const container = containerRef.current
    const initial = initialFocusRef?.current ?? focusableElements(container)[0] ?? container
    initial?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = focusableElements(containerRef.current)
      if (!focusable.length) {
        event.preventDefault()
        containerRef.current?.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previousFocus.current?.focus()
    }
  }, [active, containerRef, initialFocusRef])
}

export function Alert({ tone = 'info', title, children }: { tone?: 'info' | 'success' | 'warning' | 'danger'; title?: string; children: ReactNode }) {
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'danger' ? AlertCircle : tone === 'warning' ? AlertCircle : Info
  return <div className={`ds-alert ds-alert--${tone}`} role={tone === 'danger' ? 'alert' : 'status'}><Icon size={18} aria-hidden="true" /><div>{title && <strong>{title}</strong>}<span>{children}</span></div></div>
}

export function InlineError({ children }: { children: ReactNode }) { return <p className="ds-inline-error" role="alert"><AlertCircle size={16} aria-hidden="true" />{children}</p> }
export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) { return <div className="ds-state"><Info size={24} aria-hidden="true" /><h3>{title}</h3><p>{children}</p>{action}</div> }
export function ErrorState({ title = 'Não foi possível carregar esta área.', action }: { title?: string; action?: ReactNode }) { return <div className="ds-state ds-state--error" role="alert" aria-live="assertive"><AlertCircle size={24} aria-hidden="true" /><h3>{title}</h3>{action}</div> }
export function LoadingState({ label = 'A carregar conteúdo.' }: { label?: string }) { return <div className="ds-state" role="status" aria-live="polite"><LoaderCircle className="ds-spinner" size={24} aria-hidden="true" /><p>{label}</p></div> }

export function Dialog({ open, title, onClose, children, labelledBy }: { open: boolean; title: string; onClose: () => void; children: ReactNode; labelledBy?: string }) {
  return <AnimatePresence initial={false}>{open ? <DialogSurface key="dialog" title={title} onClose={onClose} labelledBy={labelledBy}>{children}</DialogSurface> : null}</AnimatePresence>
}

function DialogSurface({ title, onClose, children, labelledBy }: { title: string; onClose: () => void; children: ReactNode; labelledBy?: string }) {
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const generatedTitleId = useId()
  const isPresent = useIsPresent()
  const titleId = labelledBy ?? generatedTitleId
  useModalFocus(isPresent, onClose, dialogRef, closeButtonRef)
  return <motion.div className="ds-overlay" role="presentation" initial={motionPresets.scrim.initial} animate={motionPresets.scrim.animate} exit={motionPresets.scrim.exit} transition={motionPresets.scrim.transition} onMouseDown={(event) => { if (isPresent && event.target === event.currentTarget) onClose() }}><motion.section ref={dialogRef} inert={!isPresent} aria-hidden={isPresent ? undefined : true} tabIndex={-1} className="ds-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} initial={motionPresets.panel.initial} animate={motionPresets.panel.animate} exit={motionPresets.panel.exit} transition={motionPresets.panel.transition}><div className="ds-dialog__header"><h2 id={titleId}>{title}</h2><IconButton ref={closeButtonRef} label="Fechar" onClick={onClose}><X size={18} /></IconButton></div><div className="ds-dialog__body">{children}</div></motion.section></motion.div>
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirmar', onClose, onConfirm }: { open: boolean; title: string; description: string; confirmLabel?: string; onClose: () => void; onConfirm: () => void }) {
  return <Dialog open={open} title={title} onClose={onClose}><p>{description}</p><div className="ds-dialog__actions"><button className="ds-button ds-button--secondary" type="button" onClick={onClose}>Cancelar</button><button className="ds-button ds-button--destructive" type="button" onClick={onConfirm}>{confirmLabel}</button></div></Dialog>
}

export function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  return <AnimatePresence initial={false}>{open ? <DrawerSurface key="drawer" title={title} onClose={onClose}>{children}</DrawerSurface> : null}</AnimatePresence>
}

function DrawerSurface({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const drawerRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const isPresent = useIsPresent()
  useModalFocus(isPresent, onClose, drawerRef, closeButtonRef)
  return <motion.div className="ds-overlay ds-overlay--drawer" role="presentation" initial={motionPresets.scrim.initial} animate={motionPresets.scrim.animate} exit={motionPresets.scrim.exit} transition={motionPresets.scrim.transition} onMouseDown={(event) => { if (isPresent && event.target === event.currentTarget) onClose() }}><motion.aside ref={drawerRef} inert={!isPresent} aria-hidden={isPresent ? undefined : true} tabIndex={-1} className="ds-drawer" role="dialog" aria-modal="true" aria-labelledby={titleId} initial={motionPresets.drawer.initial} animate={motionPresets.drawer.animate} exit={motionPresets.drawer.exit} transition={motionPresets.drawer.transition}><div className="ds-dialog__header"><h2 id={titleId}>{title}</h2><IconButton ref={closeButtonRef} label="Fechar" onClick={onClose}><X size={18} /></IconButton></div><div className="ds-dialog__body">{children}</div></motion.aside></motion.div>
}

export function BottomSheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  return <AnimatePresence initial={false}>{open ? <BottomSheetSurface key="bottom-sheet" title={title} onClose={onClose}>{children}</BottomSheetSurface> : null}</AnimatePresence>
}

function BottomSheetSurface({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const isPresent = useIsPresent()
  useModalFocus(isPresent, onClose, sheetRef, closeButtonRef)
  return <motion.div className="ds-overlay ds-motion-overlay--sheet" role="presentation" initial={motionPresets.scrim.initial} animate={motionPresets.scrim.animate} exit={motionPresets.scrim.exit} transition={motionPresets.scrim.transition}><motion.div ref={sheetRef} inert={!isPresent} aria-hidden={isPresent ? undefined : true} tabIndex={-1} className="ds-bottom-sheet ds-bottom-sheet--open" role="dialog" aria-modal="true" aria-labelledby={titleId} initial={motionPresets.bottomSheet.initial} animate={motionPresets.bottomSheet.animate} exit={motionPresets.bottomSheet.exit} transition={motionPresets.bottomSheet.transition}><div className="ds-bottom-sheet__handle" aria-hidden="true" /><div className="ds-dialog__header"><h2 id={titleId}>{title}</h2><IconButton ref={closeButtonRef} label="Fechar" onClick={onClose}><X size={18} /></IconButton></div><div className="ds-dialog__body">{children}</div></motion.div></motion.div>
}

export function Popover({ label, children }: { label: string; children: ReactNode }) { return <details className="ds-popover"><summary>{label}</summary><div className="ds-popover__content">{children}</div></details> }
export function Tooltip({ label, children }: { label: string; children: ReactNode }) { const tooltipId = useId(); return <span className="ds-tooltip"><span aria-describedby={tooltipId}>{children}</span><span className="ds-tooltip__content" role="tooltip" id={tooltipId}>{label}</span></span> }
export function DropdownMenu({ label, children }: { label: string; children: ReactNode }) { return <details className="ds-dropdown"><summary>{label}</summary><div className="ds-dropdown__content">{children}</div></details> }
