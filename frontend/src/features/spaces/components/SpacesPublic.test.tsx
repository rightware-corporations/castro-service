import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SpaceDetail, SpacesCatalog } from './SpacesPublic'

const hookMocks = vi.hoisted(() => ({
  useSpaces: vi.fn(),
  useSpace: vi.fn(),
}))

vi.mock('../hooks', () => ({
  useSpaces: hookMocks.useSpaces,
  useSpace: hookMocks.useSpace,
}))

const space = {
  id: 'space-1',
  slug: 'sala-reuniao',
  name: 'Sala de Reunião',
  description: 'Espaço publicado para reuniões.',
  location: 'Maputo',
  capacityMin: 2,
  capacityMax: 10,
}

describe('public spaces navigation', () => {
  beforeEach(() => {
    hookMocks.useSpaces.mockReset()
    hookMocks.useSpace.mockReset()
  })

  it('links each published space to its detail and explorer routes', () => {
    hookMocks.useSpaces.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [space] },
    })

    render(<MemoryRouter><SpacesCatalog /></MemoryRouter>)

    expect(screen.getByRole('link', { name: /Conhecer espaço/i })).toHaveAttribute('href', '/espacos/sala-reuniao')
    expect(screen.getByRole('link', { name: /^Explorar/i })).toHaveAttribute('href', '/espacos/sala-reuniao/explorar')
  })

  it('keeps the detail page connected to explorer, configurator and catalog routes', () => {
    hookMocks.useSpace.mockReturnValue({
      isLoading: false,
      isError: false,
      data: space,
    })

    render(<MemoryRouter initialEntries={['/espacos/sala-reuniao']}><SpaceDetail /></MemoryRouter>)

    expect(screen.getByRole('link', { name: 'Espaços' })).toHaveAttribute('href', '/espacos')
    expect(screen.getByRole('link', { name: /Explorar espaço/i })).toHaveAttribute('href', '/espacos/sala-reuniao/explorar')
    expect(screen.getByRole('link', { name: /Configurar encontro/i })).toHaveAttribute('href', '/espacos/sala-reuniao/configurar')
  })
})
