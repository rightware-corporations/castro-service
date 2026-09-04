import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ScrollToTop } from './ScrollToTop'

function RouteControl() {
  const navigate = useNavigate()
  return <button type="button" onClick={() => navigate('/second')}>Abrir segunda rota</button>
}

describe('ScrollToTop', () => {
  const scrollTo = vi.fn()

  beforeEach(() => {
    scrollTo.mockReset()
    Object.defineProperty(window, 'scrollTo', { configurable: true, value: scrollTo })
  })

  it('resets the viewport when the pathname changes', async () => {
    render(<MemoryRouter initialEntries={['/first']}><ScrollToTop /><RouteControl /></MemoryRouter>)
    await waitFor(() => expect(scrollTo).toHaveBeenCalled())
    scrollTo.mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'Abrir segunda rota' }))

    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' }))
  })
})
