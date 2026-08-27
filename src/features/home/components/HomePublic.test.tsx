import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ExperienceSelector } from './HomePublic'

describe('homepage experience navigation', () => {
  it('exposes Services, Formação and Espaços as distinct navigation paths', () => {
    render(<MemoryRouter><ExperienceSelector /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /Serviços/ })).toHaveAttribute('href', '/servicos')
    expect(screen.getByRole('link', { name: /Formação/ })).toHaveAttribute('href', '/formacao')
    expect(screen.getByRole('link', { name: /Espaços/ })).toHaveAttribute('href', '/espacos')
  })
})
