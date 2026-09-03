import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ServiceDetailView, ServiceCollectionView } from './ServicesPublic'

const service = { id: 'service-1', slug: 'service-1', name: '[CONTENT TBD]', summary: '[A confirmar]' }

describe('public services', () => {
  it('renders loading state', () => {
    render(<MemoryRouter><ServiceCollectionView resource={{ isLoading: true, isError: false }} /></MemoryRouter>)
    expect(screen.getByRole('status')).toHaveTextContent('A carregar serviços.')
  })

  it('renders success state with a detail link', () => {
    render(<MemoryRouter><ServiceCollectionView resource={{ isLoading: false, isError: false, data: { items: [service] } }} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: '[CONTENT TBD]' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver [CONTENT TBD]' })).toHaveAttribute('href', '/servicos/service-1')
  })

  it('renders empty and API error states', () => {
    const { rerender } = render(<MemoryRouter><ServiceCollectionView resource={{ isLoading: false, isError: false, data: { items: [] } }} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Catálogo em preparação' })).toBeInTheDocument()
    rerender(<MemoryRouter><ServiceCollectionView resource={{ isLoading: false, isError: true }} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Não foi possível carregar os serviços.' })).toBeInTheDocument()
  })

  it('renders detail loading state', () => {
    render(<MemoryRouter><ServiceDetailView resource={{ isLoading: true, isError: false }} /></MemoryRouter>)
    expect(screen.getByRole('status')).toHaveTextContent('A carregar serviço.')
  })

  it('renders detail API error with a safe return path', () => {
    render(<MemoryRouter><ServiceDetailView resource={{ isLoading: false, isError: true }} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Não foi possível carregar este serviço.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar aos serviços' })).toHaveAttribute('href', '/servicos')
  })

  it('renders a not-found detail state when no service is returned', () => {
    render(<MemoryRouter><ServiceDetailView resource={{ isLoading: false, isError: false }} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Serviço não encontrado.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar aos serviços' })).toHaveAttribute('href', '/servicos')
  })
})
