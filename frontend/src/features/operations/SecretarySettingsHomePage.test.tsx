import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppProviders } from '../../app/providers/AppProviders'
import { SecretarySettingsHomePage } from './SecretarySettingsHomePage'

describe('SecretarySettingsHomePage', () => {
  it('shows business operations without exposing RBAC administration', () => {
    render(<AppProviders><MemoryRouter><SecretarySettingsHomePage /></MemoryRouter></AppProviders>)

    expect(screen.getByText('Serviços')).toBeInTheDocument()
    expect(screen.getByText('Formação')).toBeInTheDocument()
    expect(screen.getByText('Espaços')).toBeInTheDocument()
    expect(screen.getByText('Disponibilidade')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()

    expect(screen.queryByText('Utilizadores')).not.toBeInTheDocument()
    expect(screen.queryByText('Funções')).not.toBeInTheDocument()
    expect(screen.queryByText('Permissões')).not.toBeInTheDocument()
  })
})
