import { useId, useState, type ReactNode } from 'react'
import './published-catalog-focus.css'

type Item = { id: string; name: string }

/** Selection stays local; only the explicit detail link changes route. */
export function PublishedCatalogFocus<T extends Item>({ items, label, frame, children }: {
  items: T[]
  label: string
  frame: string
  children: (item: T) => ReactNode
}) {
  const [selectedId, setSelectedId] = useState<string>()
  const panelId = useId()
  const selected = items.find((item) => item.id === selectedId) ?? items[0]
  if (!selected) return null
  return <div className="published-catalog-focus" data-frame={frame}>
    <div className="published-catalog-focus__index" role="group" aria-label={label}>
      {items.map((item, index) => <button key={item.id} type="button" aria-pressed={selected.id === item.id} aria-controls={panelId} onClick={() => setSelectedId(item.id)}>
        <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span>{item.name}</span>
      </button>)}
    </div>
    <div id={panelId} className="published-catalog-focus__detail" aria-live="polite" aria-atomic="true">{children(selected)}</div>
  </div>
}
