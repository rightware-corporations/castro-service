import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { BottomSheet, Dialog, ErrorState, Tooltip } from './feedback-overlays'
import { BookingStepper, TimeSlotGroup } from './booking'
import { Tabs } from './navigation'
import { EntityCard, ResponsiveEntityList } from './data'

describe('Design System behavior patterns', () => {
  it('traps Dialog focus, closes with Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    function Fixture() {
      const [open, setOpen] = useState(false)
      return <><button type="button" onClick={() => setOpen(true)}>Abrir</button><Dialog open={open} title="Teste" onClose={() => setOpen(false)}><button type="button">Primeira ação</button><button type="button">Última ação</button></Dialog></>
    }
    render(<Fixture />)
    const trigger = screen.getByRole('button', { name: 'Abrir' })
    await user.click(trigger)
    const close = screen.getByRole('button', { name: 'Fechar' })
    expect(document.activeElement).toBe(close)

    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Primeira ação' }))
    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Última ação' }))
    await user.tab()
    expect(document.activeElement).toBe(close)
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Última ação' }))

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(trigger)
  })

  it('does not leave a closed BottomSheet in the accessibility tree or tab order', async () => {
    const user = userEvent.setup()
    function Fixture() {
      const [open, setOpen] = useState(false)
      return <><button type="button" onClick={() => setOpen(true)}>Filtros</button><BottomSheet open={open} title="Filtros" onClose={() => setOpen(false)}><button type="button">Aplicar</button></BottomSheet></>
    }
    render(<Fixture />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Filtros' }))
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('announces ErrorState assertively', () => {
    render(<ErrorState title="Falha controlada" />)
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
  })

  it('gives every Tooltip an independent accessible description', () => {
    render(<><Tooltip label="Primeiro"><button type="button">A</button></Tooltip><Tooltip label="Segundo"><button type="button">B</button></Tooltip></>)
    const first = screen.getByRole('button', { name: 'A' }).parentElement
    const second = screen.getByRole('button', { name: 'B' }).parentElement
    expect(first?.getAttribute('aria-describedby')).toBeTruthy()
    expect(second?.getAttribute('aria-describedby')).toBeTruthy()
    expect(first?.getAttribute('aria-describedby')).not.toBe(second?.getAttribute('aria-describedby'))
  })

  it('moves Tabs with ArrowRight and exposes tab semantics', async () => {
    const user = userEvent.setup()
    render(<Tabs items={[{ id: 'first', label: 'Primeira', content: 'Um' }, { id: 'second', label: 'Segunda', content: 'Dois' }]} />)
    const first = screen.getByRole('tab', { name: 'Primeira' })
    await user.click(first)
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Segunda' })).toHaveAttribute('aria-selected', 'true')
  })

  it('marks the current BookingStepper step', () => {
    render(<BookingStepper current="review" />)
    expect(screen.getByText('Rever').closest('li')).toHaveClass('is-current')
  })

  it('uses the same row information for responsive table and entity representations', () => {
    render(<ResponsiveEntityList columns={[{ key: 'name', label: 'Nome', render: (row: { id: string; name: string }) => row.name }]} rows={[{ id: 'one', name: '[A confirmar]' }]} getRowKey={(row) => row.id} renderMobile={(row) => <EntityCard title={row.name}>Detalhe</EntityCard>} />)
    expect(screen.getByRole('columnheader', { name: 'Nome' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '[A confirmar]' })).toBeInTheDocument()
  })

  it('selects an available TimeSlot and keeps booked slots disabled', async () => {
    const user = userEvent.setup()
    render(<TimeSlotGroup label="Horários" slots={[{ id: 'available', label: '09:00' }, { id: 'booked', label: '10:00', state: 'booked' }]} />)
    const available = screen.getByRole('button', { name: '09:00, available' })
    const booked = screen.getByRole('button', { name: '10:00, booked' })
    expect(booked).toBeDisabled()
    await user.click(available)
    expect(available).toHaveAttribute('aria-pressed', 'true')
  })
})
