import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { LoaderCircle } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'icon'
export type ControlSize = 'sm' | 'md' | 'lg'

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ControlSize; loading?: boolean }>(function Button({ variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) {
  return <button ref={ref} className={`ds-button ds-button--${variant} ds-button--${size}`} disabled={disabled || loading} {...props}>{loading && <LoaderCircle className="ds-spinner ds-spinner--inline" size={16} aria-hidden="true" />}{children}</button>
})

export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { label: string; size?: ControlSize }>(function IconButton({ label, size = 'md', children, ...props }, ref) {
  return <Button ref={ref} variant="icon" size={size} aria-label={label} {...props}>{children}</Button>
})

export function Field({ id, label, description, required, error, children }: { id?: string; label: string; description?: string; required?: boolean; error?: string; children: ReactNode }) {
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined
  return <div className="ds-field"><label className="ds-field__label" htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>{description && <span className="ds-field__description" id={descriptionId}>{description}</span>}{children}{error && <span className="ds-field__error" id={errorId} role="alert">{error}</span>}</div>
}

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string; error?: string; required?: boolean }>(function TextField({ id, label, description, error, required, ...props }, ref) {
  return <Field id={id} label={label} description={description} error={error} required={required}><input ref={ref} id={id} className="ds-control" aria-invalid={Boolean(error)} aria-describedby={[description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined} {...props} /></Field>
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; description?: string; error?: string; required?: boolean }>(function Textarea({ id, label, description, error, required, ...props }, ref) {
  return <Field id={id} label={label} description={description} error={error} required={required}><textarea ref={ref} id={id} className="ds-control ds-control--textarea" aria-invalid={Boolean(error)} aria-describedby={[description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined} {...props} /></Field>
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label: string; description?: string; error?: string; required?: boolean }>(function Select({ id, label, description, error, required, children, ...props }, ref) {
  return <Field id={id} label={label} description={description} error={error} required={required}><select ref={ref} id={id} className="ds-control" aria-invalid={Boolean(error)} aria-describedby={[description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined} {...props}>{children}</select></Field>
})

export function Checkbox({ id, label, description, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }) {
  return <label className="ds-choice" htmlFor={id}><input id={id} type="checkbox" {...props} /><span><strong>{label}</strong>{description && <small>{description}</small>}</span></label>
}

export function Radio({ id, name, label, description, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }) {
  return <label className="ds-choice" htmlFor={id}><input id={id} name={name} type="radio" {...props} /><span><strong>{label}</strong>{description && <small>{description}</small>}</span></label>
}

export function Switch({ id, label, description, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }) {
  return <label className="ds-switch" htmlFor={id}><input id={id} role="switch" type="checkbox" {...props} /><span className="ds-switch__track" aria-hidden="true"><span /></span><span><strong>{label}</strong>{description && <small>{description}</small>}</span></label>
}

export const SearchInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string }>(function SearchInput({ label = 'Pesquisar', ...props }, ref) {
  return <div className="ds-search"><span aria-hidden="true">⌕</span><input ref={ref} type="search" aria-label={label} {...props} /></div>
})

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' }) {
  return <span className={`ds-badge ds-badge--${tone}`}><span className="ds-badge__dot" aria-hidden="true" />{children}</span>
}

export function Divider({ label }: { label?: string }) { return <div className="ds-divider" role="separator">{label && <span>{label}</span>}</div> }

export function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: ControlSize }) {
  return src ? <img className={`ds-avatar ds-avatar--${size}`} src={src} alt={name} /> : <span className={`ds-avatar ds-avatar--${size}`} role="img" aria-label={name}>{name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
}

export function Spinner({ label = 'A carregar', size = 20 }: { label?: string; size?: number }) { return <span className="ds-spinner-wrap" role="status"><LoaderCircle className="ds-spinner" size={size} aria-hidden="true" /><span className="visually-hidden">{label}</span></span> }

export function Skeleton({ width = '100%', height = '1rem', radius = '0.5rem' }: { width?: string; height?: string; radius?: string }) { return <span className="ds-skeleton" aria-hidden="true" style={{ width, height, borderRadius: radius }} /> }
