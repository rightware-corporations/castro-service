import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppProviders } from '../../app/providers/AppProviders'
import { SecretaryDashboardPage } from './SecretaryDashboardPage'

describe('SecretaryDashboardPage', () => {
  it('prioritizes daily operational work', async () => {
    render(<AppProviders><MemoryRouter><SecretaryDashboardPage /></MemoryRouter></AppProviders>)

    expect(await screen.findByRole('heading', { name: 'Bom trabalho.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Nova reserva/ })).toHaveAttribute('href', '/app/reservas/nova')
    expect(screen.getByRole('heading', { name: 'Agenda de hoje' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Fila de atenção' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Próximos seguimentos' })).toBeInTheDocument()
  })
})
