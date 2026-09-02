import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NotFound } from './NotFound'
import { DeferredPublicPage } from './public/DeferredPublicPage'

describe('public system states', () => {
  it('renders a truthful 404 state with a route back to the homepage', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>)

    expect(screen.getByText('404 · CASTRO’S SERVICES')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Página não encontrada.' })).toBeInTheDocument()
    expect(screen.getByText(/não corresponde a uma área disponível/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute('href', '/')
  })

  it('keeps the generic booking entry explicit about deferred scope', () => {
    render(<MemoryRouter initialEntries={['/reservar']}><DeferredPublicPage /></MemoryRouter>)

    expect(screen.getByText('CASTRO’S · PRÓXIMA ETAPA')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Esta área' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Experiência em preparação.' })).toBeInTheDocument()
    expect(screen.getByText(/não é apresentada como produto concluído/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Voltar ao início/i })).toHaveAttribute('href', '/')
  })

  it('identifies deferred space availability as a Spaces state rather than a completed feature', () => {
    render(<MemoryRouter initialEntries={['/espacos/sala-reuniao/disponibilidade']}><DeferredPublicPage /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: 'Espaços' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Experiência em preparação.' })).toBeInTheDocument()
    expect(screen.getByText(/conteúdo, fotografia e disponibilidade serão ligados/i)).toBeInTheDocument()
  })
})
