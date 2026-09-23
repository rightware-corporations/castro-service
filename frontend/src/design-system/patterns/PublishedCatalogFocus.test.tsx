import { fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { PublishedCatalogFocus } from './PublishedCatalogFocus'

const items = [{ id: 'a', name: 'Primeiro' }, { id: 'b', name: 'Segundo' }]
function Detail() { const navigate = useNavigate(); return <button onClick={() => navigate(-1)}>Voltar</button> }
function Catalog() { return <PublishedCatalogFocus items={items} label="Catálogo" frame="S03">{item => <Link to="/detail">Abrir {item.name}</Link>}</PublishedCatalogFocus> }

describe('catalogue navigation context', () => {
  it('restores a selected entity after detail and browser Back', async () => {
    render(<MemoryRouter><Routes><Route path="/" element={<Catalog />} /><Route path="/detail" element={<Detail />} /></Routes></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /Segundo/ }))
    fireEvent.click(screen.getByRole('link', { name: 'Abrir Segundo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(await screen.findByRole('link', { name: 'Abrir Segundo' })).toBeInTheDocument()
  })
  it('restores direct URL selection and ignores an unpublished ID', () => {
    const { unmount } = render(<MemoryRouter initialEntries={['/?focus=b']}><Catalog /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Abrir Segundo' })).toBeInTheDocument()
    unmount()
    render(<MemoryRouter initialEntries={['/?focus=unknown']}><Catalog /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Abrir Primeiro' })).toBeInTheDocument()
  })
})
