import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OperationsLayout, PublicLayout } from './Layouts'
import { AppProviders } from '../providers/AppProviders'

function matchMediaForMobile(mobile: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === '(max-width: 767px)' ? mobile : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

afterEach(() => vi.unstubAllGlobals())

function renderLayout() {
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<div>Conteúdo público</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    ),
  }
}

const expectedLinks = [
  ['Serviços', '/servicos'],
  ['Formação', '/formacao'],
  ['Espaços', '/espacos'],
  ['Contacto', '/contacto'],
] as const

describe('public layout navigation', () => {
  it('keeps header and footer navigation aligned with the public route contract', () => {
    renderLayout()

    const primary = screen.getByRole('navigation', { name: 'Navegação principal' })
    const footer = screen.getByRole('navigation', { name: 'Navegação do rodapé' })

    for (const [label, href] of expectedLinks) {
      expect(within(primary).getByRole('link', { name: label })).toHaveAttribute('href', href)
      expect(within(footer).getByRole('link', { name: new RegExp(label) })).toHaveAttribute('href', href)
    }

    expect(within(primary).getByRole('link', { name: /Falar connosco/i })).toHaveAttribute('href', '/contacto')
    for (const brand of screen.getAllByRole('link', { name: 'Castro’s Services — início' })) {
      expect(brand).toHaveAttribute('href', '/')
    }
  })

  it('provides a skip link to a programmatically focusable main landmark', () => {
    renderLayout()
    const skipLink = screen.getByRole('link', { name: 'Saltar para o conteúdo principal' })
    expect(skipLink).toHaveAttribute('href', '#main-content')
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main-content')
    expect(main).toHaveAttribute('tabindex', '-1')
  })

  it('exposes an operable mobile menu with accurate expanded state and Escape focus return', async () => {
    matchMediaForMobile(true)
    const { user } = renderLayout()
    const toggle = screen.getByRole('button', { name: 'Abrir menu' })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'public-primary-navigation')
    const navigation = document.getElementById('public-primary-navigation')
    expect(navigation).not.toBeNull()
    expect(navigation).toHaveAttribute('aria-hidden', 'true')
    expect(navigation).toHaveAttribute('inert')

    await user.click(toggle)
    const closeToggle = screen.getByRole('button', { name: 'Fechar menu' })
    expect(closeToggle).toHaveAttribute('aria-expanded', 'true')
    expect(navigation).not.toHaveAttribute('aria-hidden')
    expect(navigation).not.toHaveAttribute('inert')
    await waitFor(() => expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument())

    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(toggle)
  })

  it('keeps the /app mobile sidebar keyboard-operable without changing route permissions', async () => {
    matchMediaForMobile(true)
    const user = userEvent.setup()
    render(<AppProviders><MemoryRouter initialEntries={['/app/dashboard']}><Routes><Route element={<OperationsLayout />}><Route path="/app/dashboard" element={<div>Dashboard interno</div>} /></Route></Routes></MemoryRouter></AppProviders>)
    const trigger = screen.getByRole('button', { name: 'Abrir navegação' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() => expect(screen.getByRole('navigation', { name: 'Navegação de operações' })).toBeInTheDocument())
    expect(screen.getByRole('link', { name: /Dashboard/i })).toHaveAttribute('href', '/app/dashboard')
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(trigger)
  })
})
