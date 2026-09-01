import type { FormHTMLAttributes, ReactNode } from 'react'
import { Button } from '../primitives'

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) { return <section className="ds-form-section"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><div className="ds-form-section__fields">{children}</div></section> }
export function FormActions({ children }: { children: ReactNode }) { return <div className="ds-form-actions">{children}</div> }
export function StickyMobileActions({ children }: { children: ReactNode }) { return <div className="ds-sticky-mobile-actions">{children}</div> }
export function FormSummary({ title = 'Resumo', children }: { title?: string; children: ReactNode }) { return <aside className="ds-form-summary"><h2>{title}</h2>{children}</aside> }
export function FormShell({ children, onSubmit }: FormHTMLAttributes<HTMLFormElement>) { return <form className="ds-form-shell" onSubmit={onSubmit}>{children}<StickyMobileActions><Button type="submit">Continuar</Button></StickyMobileActions></form> }
