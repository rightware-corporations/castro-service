import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { PublicLayout } from './Layouts'

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

  it('exposes an operable mobile menu toggle with accurate expanded and control state', async () => {
    const { user } = renderLayout()
    const toggle = screen.getByRole('button', { name: 'Abrir menu' })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'public-primary-navigation')
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toHaveAttribute('id', 'public-primary-navigation')

    await user.click(toggle)

    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('aria-expanded', 'true')
  })
})
