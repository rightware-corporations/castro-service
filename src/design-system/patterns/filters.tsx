import { useState, type ReactNode } from 'react'
import { SearchInput, Button } from '../primitives'
import { BottomSheet } from './feedback-overlays'

export function FilterGroup({ label, children }: { label: string; children: ReactNode }) { return <fieldset className="ds-filter-group"><legend>{label}</legend>{children}</fieldset> }
export function FilterButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) { return <Button variant="secondary" size="sm" onClick={onClick}>{children}</Button> }
export function ActiveFilterChips({ items, onRemove }: { items: { id: string; label: string }[]; onRemove: (id: string) => void }) { return <div className="ds-filter-chips" aria-label="Filtros ativos">{items.map((item) => <button key={item.id} type="button" onClick={() => onRemove(item.id)}>{item.label} <span aria-hidden="true">×</span></button>)}</div> }
export function ClearFilters({ onClick }: { onClick: () => void }) { return <button className="ds-clear-filters" type="button" onClick={onClick}>Limpar filtros</button> }
export function SearchToolbar({ placeholder = 'Pesquisar', children, onClear }: { placeholder?: string; children?: ReactNode; onClear?: () => void }) {
  const [open, setOpen] = useState(false)
  return <div className="ds-search-toolbar"><SearchInput placeholder={placeholder} /><div className="ds-search-toolbar__desktop">{children}</div><Button className="ds-search-toolbar__mobile-trigger" variant="secondary" size="sm" onClick={() => setOpen(true)}>Filtros</Button>{onClear && <ClearFilters onClick={onClear} />}<BottomSheet open={open} title="Filtros" onClose={() => setOpen(false)}><div className="ds-filter-sheet">{children}<Button variant="primary" onClick={() => setOpen(false)}>Aplicar filtros</Button></div></BottomSheet></div>
}
