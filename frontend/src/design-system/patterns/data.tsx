import type { ReactNode } from 'react'

export type DataColumn<T> = { key: string; label: string; render: (item: T) => ReactNode }

export function DataTable<T>({ columns, rows, getRowKey }: { columns: DataColumn<T>[]; rows: T[]; getRowKey: (row: T) => string }) {
  return <div className="ds-data-table-wrap"><table className="ds-data-table"><thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={getRowKey(row)}>{columns.map((column) => <td key={column.key} data-label={column.label}>{column.render(row)}</td>)}</tr>)}</tbody></table></div>
}

export function EntityCard({ title, eyebrow, children, actions }: { title: string; eyebrow?: string; children: ReactNode; actions?: ReactNode }) { return <article className="ds-entity-card"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h3>{title}</h3></div><div className="ds-entity-card__body">{children}</div>{actions && <div className="ds-entity-card__actions">{actions}</div>}</article> }

export function ResponsiveEntityList<T>({ columns, rows, getRowKey, renderMobile }: { columns: DataColumn<T>[]; rows: T[]; getRowKey: (row: T) => string; renderMobile: (row: T) => ReactNode }) {
  return <><div className="ds-responsive-table"><DataTable columns={columns} rows={rows} getRowKey={getRowKey} /></div><div className="ds-responsive-entities">{rows.map((row) => <div key={getRowKey(row)}>{renderMobile(row)}</div>)}</div></>
}

export function DefinitionList({ items }: { items: { term: string; description: ReactNode }[] }) { return <dl className="ds-definition-list">{items.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.description}</dd></div>)}</dl> }

export function ActivityList({ items }: { items: { id: string; title: string; detail: string; time: string }[] }) { return <ol className="ds-activity-list">{items.map((item) => <li key={item.id}><span className="ds-activity-list__dot" aria-hidden="true" /><div><strong>{item.title}</strong><span>{item.detail}</span><small>{item.time}</small></div></li>)}</ol> }
export const Timeline = ActivityList
