import { useEffect, useRef, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, LoaderCircle, X } from 'lucide-react'
import { IconButton } from '../primitives'

export function Alert({ tone = 'info', title, children }: { tone?: 'info' | 'success' | 'warning' | 'danger'; title?: string; children: ReactNode }) {
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'danger' ? AlertCircle : tone === 'warning' ? AlertCircle : Info
  return <div className={`ds-alert ds-alert--${tone}`} role={tone === 'danger' ? 'alert' : 'status'}><Icon size={18} aria-hidden="true" /><div>{title && <strong>{title}</strong>}<span>{children}</span></div></div>
}

export function InlineError({ children }: { children: ReactNode }) { return <p className="ds-inline-error" role="alert"><AlertCircle size={16} aria-hidden="true" />{children}</p> }
export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) { return <div className="ds-state"><Info size={24} aria-hidden="true" /><h3>{title}</h3><p>{children}</p>{action}</div> }
export function ErrorState({ title = 'Não foi possível carregar esta área.', action }: { title?: string; action?: ReactNode }) { return <div className="ds-state ds-state--error"><AlertCircle size={24} aria-hidden="true" /><h3>{title}</h3>{action}</div> }
export function LoadingState({ label = 'A carregar conteúdo.' }: { label?: string }) { return <div className="ds-state" role="status" aria-live="polite"><LoaderCircle className="ds-spinner" size={24} aria-hidden="true" /><p>{label}</p></div> }

function useEscape(onClose: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [enabled, onClose])
}

export function Dialog({ open, title, onClose, children, labelledBy }: { open: boolean; title: string; onClose: () => void; children: ReactNode; labelledBy?: string }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement as HTMLElement
    closeButtonRef.current?.focus()
    return () => previousFocus.current?.focus()
  }, [open])
  useEscape(onClose, open)
  if (!open) return null
  const titleId = labelledBy ?? 'ds-dialog-title'
  return <div className="ds-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="ds-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}><div className="ds-dialog__header"><h2 id={titleId}>{title}</h2><IconButton ref={closeButtonRef} label="Fechar" onClick={onClose}><X size={18} /></IconButton></div><div className="ds-dialog__body">{children}</div></section></div>
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirmar', onClose, onConfirm }: { open: boolean; title: string; description: string; confirmLabel?: string; onClose: () => void; onConfirm: () => void }) {
  return <Dialog open={open} title={title} onClose={onClose}><p>{description}</p><div className="ds-dialog__actions"><button className="ds-button ds-button--secondary" type="button" onClick={onClose}>Cancelar</button><button className="ds-button ds-button--destructive" type="button" onClick={onConfirm}>{confirmLabel}</button></div></Dialog>
}

export function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  useEscape(onClose, open)
  if (!open) return null
  return <div className="ds-overlay ds-overlay--drawer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><aside className="ds-drawer" role="dialog" aria-modal="true" aria-label={title}><div className="ds-dialog__header"><h2>{title}</h2><IconButton label="Fechar" onClick={onClose}><X size={18} /></IconButton></div><div className="ds-dialog__body">{children}</div></aside></div>
}

export function BottomSheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  return <div className={`ds-bottom-sheet ${open ? 'ds-bottom-sheet--open' : ''}`} role="dialog" aria-modal={open} aria-label={title} aria-hidden={!open}><div className="ds-bottom-sheet__handle" aria-hidden="true" /><div className="ds-dialog__header"><h2>{title}</h2><IconButton label="Fechar" onClick={onClose}><X size={18} /></IconButton></div><div className="ds-dialog__body">{children}</div></div>
}

export function Popover({ label, children }: { label: string; children: ReactNode }) { return <details className="ds-popover"><summary>{label}</summary><div className="ds-popover__content">{children}</div></details> }
export function Tooltip({ label, children }: { label: string; children: ReactNode }) { return <span className="ds-tooltip"><span aria-describedby="tooltip-content">{children}</span><span className="ds-tooltip__content" role="tooltip" id="tooltip-content">{label}</span></span> }
export function DropdownMenu({ label, children }: { label: string; children: ReactNode }) { return <details className="ds-dropdown"><summary>{label}</summary><div className="ds-dropdown__content">{children}</div></details> }
