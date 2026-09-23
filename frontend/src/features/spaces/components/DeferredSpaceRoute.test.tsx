import { lazy } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DeferredSpaceRoute } from './DeferredSpaceRoute'

describe('deferred space experience', () => {
  it('announces loading while the module is pending', () => {
    const Pending = lazy(() => new Promise< { default: () => React.ReactNode }>(() => {}))
    render(<MemoryRouter><DeferredSpaceRoute label="A preparar o explorador."><Pending /></DeferredSpaceRoute></MemoryRouter>)
    expect(screen.getByRole('status')).toHaveTextContent('A preparar o explorador.')
  })
  it('recovers safely when a module cannot be loaded', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const Failed = lazy(() => Promise.reject(new Error('module unavailable')))
    try {
      render(<MemoryRouter><DeferredSpaceRoute label="A preparar o explorador."><Failed /></DeferredSpaceRoute></MemoryRouter>)
      expect(await screen.findByRole('heading', { name: 'Não foi possível abrir esta experiência.' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Voltar aos espaços' })).toHaveAttribute('href', '/espacos')
      expect(screen.getByRole('button', { name: 'Carregar novamente' })).toBeEnabled()
      expect(screen.queryByText('module unavailable')).not.toBeInTheDocument()
    } finally { consoleError.mockRestore() }
  })
})
