import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppProviders } from '../../app/providers/AppProviders'
import { OwnerDashboardPage } from './OwnerDashboardPage'

describe('OwnerDashboardPage', () => {
  it('presents a read-oriented executive view using real-data contracts', async () => {
    render(<AppProviders><MemoryRouter><OwnerDashboardPage /></MemoryRouter></AppProviders>)

    expect(await screen.findByRole('heading', { name: 'Visão da empresa.' })).toBeInTheDocument()
    expect(screen.getByText('Estado atual')).toBeInTheDocument()
    expect(screen.getByText('Agenda em movimento')).toBeInTheDocument()
    expect(screen.getByText('Pedidos a acompanhar')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Atividade real, sem métricas inventadas.' })).toBeInTheDocument()
    expect(screen.getByText(/Receita e conversão só entram quando existirem contratos de dados reais/)).toBeInTheDocument()
  })
})
