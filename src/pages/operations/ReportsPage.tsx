import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, CalendarRange } from 'lucide-react'
import { useApi, useCan } from '../../app/providers/AppProviders'
import { ErrorState, LoadingState } from '../../design-system/patterns/feedback-overlays'

const DEFAULT_RANGE = defaultRange()

export function ReportsPage() {
  const api = useApi()
  const can = useCan()
  const [fromDate, setFromDate] = useState(DEFAULT_RANGE.from)
  const [toDate, setToDate] = useState(DEFAULT_RANGE.to)
  const validRange = Boolean(fromDate && toDate && fromDate <= toDate)
  const from = `${fromDate}T00:00:00Z`
  const to = `${toDate}T23:59:59.999Z`
  const report = useQuery({
    queryKey: ['operations', 'reports', from, to],
    queryFn: () => api.operations.getReport(from, to),
    enabled: can('report.read') && validRange,
  })

  return <section className="catalog-admin">
    <header className="ops-v2__hero"><div><span className="eyebrow">OPERAÇÕES</span><h1>Relatórios</h1><p>Leitura agregada da atividade operacional real no período selecionado.</p></div></header>
    <div className="catalog-admin__toolbar">
      <div><span className="eyebrow">PERÍODO</span><h2>Intervalo de análise</h2></div>
      <div className="catalog-admin__two">
        <label>De<input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
        <label>Até<input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
      </div>
    </div>
    {!validRange ? <ErrorState title="O intervalo selecionado não é válido." /> : report.isLoading ? <LoadingState label="A calcular relatório." /> : report.isError || !report.data ? <ErrorState title="Não foi possível calcular o relatório." /> : <>
      <section className="catalog-admin__summary">
        <article><small>Pedidos criados</small><strong>{report.data.requestsCreated}</strong></article>
        <article><small>Reservas criadas</small><strong>{report.data.bookingsCreated}</strong></article>
        <article><small>Clientes criados</small><strong>{report.data.customersCreated}</strong></article>
        <article><small>Tarefas criadas</small><strong>{report.data.tasksCreated}</strong></article>
      </section>
      <div className="catalog-admin__layout">
        <main className="catalog-admin__main">
          <div className="catalog-admin__toolbar"><div><span className="eyebrow">ATIVIDADE</span><h2>Atividade diária</h2></div><CalendarRange size={20} aria-hidden="true" /></div>
          <div className="catalog-admin__list">
            {report.data.daily.length ? report.data.daily.map((day) => <article className="catalog-admin__row" key={day.date}>
              <div className="catalog-admin__row-order"><BarChart3 size={18}/></div>
              <div className="catalog-admin__row-copy"><div className="catalog-admin__row-title"><strong>{formatDay(day.date)}</strong></div><p>Pedidos {day.requests} · Reservas {day.bookings} · Clientes {day.customers} · Tarefas {day.tasks}</p></div>
            </article>) : <div className="catalog-admin__empty"><h3>Sem atividade no período.</h3><p>O relatório não cria valores artificiais quando não existem registos.</p></div>}
          </div>
        </main>
        <aside className="catalog-admin__editor">
          <div className="catalog-admin__editor-heading"><div><span className="eyebrow">ESTADOS</span><h2>Distribuição</h2></div></div>
          <StatusBreakdown title="Pedidos" values={report.data.requestStatuses} />
          <StatusBreakdown title="Reservas" values={report.data.bookingStatuses} />
        </aside>
      </div>
    </>}
  </section>
}

function StatusBreakdown({ title, values }: { title: string; values: Record<string, number> }) {
  const entries = Object.entries(values)
  return <section className="catalog-admin__empty" style={{ textAlign: 'left' }}><h3>{title}</h3>{entries.length ? entries.map(([status, total]) => <p key={status}><strong>{statusLabel(status)}</strong>: {total}</p>) : <p>Sem registos no período.</p>}</section>
}

function statusLabel(value: string) { return value.replaceAll('_', ' ') }
function formatDay(value: string) { return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) }
function defaultRange() {
  const end = new Date()
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 29)
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }
}
