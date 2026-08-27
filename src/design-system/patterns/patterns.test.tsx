import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Dialog } from './feedback-overlays'
import { BookingStepper, TimeSlotGroup } from './booking'
import { Tabs } from './navigation'
import { EntityCard, ResponsiveEntityList } from './data'

describe('Design System behavior patterns', () => {
  it('closes Dialog with Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    function Fixture() {
      const [open, setOpen] = useState(false)
      return <><button type="button" onClick={() => setOpen(true)}>Abrir</button><Dialog open={open} title="Teste" onClose={() => setOpen(false)}>Conteúdo</Dialog></>
    }
    render(<Fixture />)
    const trigger = screen.getByRole('button', { name: 'Abrir' })
    await user.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(trigger)
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
