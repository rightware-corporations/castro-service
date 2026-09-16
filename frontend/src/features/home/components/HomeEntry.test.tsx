import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HomeEntry } from './HomeEntry'

const settings = vi.hoisted(() => ({ reduced: false }))
vi.mock('motion/react', () => ({ useReducedMotion: () => settings.reduced }))
const renderEntry = () => render(<MemoryRouter><HomeEntry /></MemoryRouter>)

describe('Home entry continuity and access', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sessionStorage.clear()
    settings.reduced = false
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 84, height: 1665 } as DOMRect)
  })
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

  it('resolves the timed entry and does not replay when returning to Home', () => {
    const view = renderEntry()
    const stage = screen.getByRole('region', { name: 'A experiência Castro’s' })
    expect(stage).toHaveAttribute('data-frame', 'H00')
    act(() => vi.advanceTimersByTime(200))
    expect(stage).toHaveAttribute('data-frame', 'H01')
    act(() => vi.advanceTimersByTime(350))
    expect(stage).toHaveAttribute('data-frame', 'H02')
    act(() => vi.advanceTimersByTime(650))
    expect(stage).toHaveAttribute('data-frame', 'H03')
    view.unmount()
    renderEntry()
    expect(screen.getByRole('region', { name: 'A experiência Castro’s' })).toHaveAttribute('data-frame', 'H03')
  })

  it('cancels pending intro phases on user intent without restarting them', () => {
    renderEntry()
    fireEvent.wheel(window)
    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByRole('region', { name: 'A experiência Castro’s' })).toHaveAttribute('data-frame', 'H03')
  })

  it('skips entry under reduced motion and preserves the original portrait', () => {
    settings.reduced = true
    renderEntry()
    expect(screen.getByRole('region', { name: 'A experiência Castro’s' })).toHaveAttribute('data-frame', 'H03')
    expect(screen.getByRole('img', { name: 'Elizabeth Castro, fundadora da Castro’s' })).toHaveAttribute('src', '/IMG_3376.JPG.jpeg')
  })

  it('keeps keyboard selection, panel and destination synchronized', () => {
    settings.reduced = true
    renderEntry()
    fireEvent.keyDown(screen.getByRole('tab', { name: /Consultoria/ }), { key: 'ArrowDown' })
    expect(screen.getByRole('tab', { name: /Formação/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /Formação/ })).toHaveFocus()
    expect(screen.getByRole('link', { name: 'Explorar formação' })).toHaveAttribute('href', '/formacao')
    fireEvent.keyDown(screen.getByRole('tab', { name: /Formação/ }), { key: 'End' })
    expect(screen.getByRole('link', { name: 'Explorar espaços' })).toHaveAttribute('href', '/espacos')
  })

  it('reports failed portrait media without substituting a different person', () => {
    settings.reduced = true
    renderEntry()
    fireEvent.error(screen.getByRole('img', { name: 'Elizabeth Castro, fundadora da Castro’s' }))
    expect(screen.getByRole('status')).toHaveTextContent('O retrato de Elizabeth Castro não está disponível')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('inherits the portrait when scrolling into Consulting and returns focus to the gateway', () => {
    settings.reduced = true
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    measure.mockReturnValue({ top: 84, height: 2400 } as DOMRect)
    render(<MemoryRouter><HomeEntry consulting={<a href="/servicos">Catálogo</a>} /></MemoryRouter>)
    const portrait = screen.getByRole('img', { name: 'Elizabeth Castro, fundadora da Castro’s' })
    measure.mockReturnValue({ top: -1100, height: 2400 } as DOMRect)
    fireEvent.scroll(window)
    act(() => vi.advanceTimersByTime(20))
    expect(screen.getByRole('region', { name: 'A experiência Castro’s' })).toHaveAttribute('data-frame', 'H06')
    expect(screen.getByRole('img', { name: 'Elizabeth Castro, fundadora da Castro’s' })).toBe(portrait)
    fireEvent.click(screen.getByRole('button', { name: 'Voltar às práticas' }))
    expect(screen.getByRole('region', { name: 'A experiência Castro’s' })).toHaveAttribute('data-frame', 'H05')
    expect(document.activeElement).toHaveAttribute('aria-label', 'Escolher uma prática')
  })

  it('crosses H07 into H08 with the same portrait and preserves the return destination', () => {
    sessionStorage.setItem('castros.home.entry.v1', 'seen')
    vi.stubGlobal('scrollTo', vi.fn())
    const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    const height = window.innerHeight + 2400
    measure.mockReturnValue({ top: 84, height } as DOMRect)
    render(<MemoryRouter><HomeEntry consulting={<p>Serviços</p>} training={<p>Cursos</p>} /></MemoryRouter>)
    const portrait = screen.getByRole('img', { name: 'Elizabeth Castro, fundadora da Castro’s' })
    measure.mockReturnValue({ top: 84 - 1600, height } as DOMRect)
    fireEvent.scroll(window)
    act(() => vi.advanceTimersByTime(20))
    expect(screen.getByRole('region', { name: 'A experiência Castro’s' })).toHaveAttribute('data-frame', 'H07')
    measure.mockReturnValue({ top: 84 - 1920, height } as DOMRect)
    fireEvent.scroll(window)
    act(() => vi.advanceTimersByTime(20))
    expect(screen.getByRole('region', { name: 'A experiência Castro’s' })).toHaveAttribute('data-frame', 'H08')
    expect(screen.getByRole('img', { name: 'Elizabeth Castro, fundadora da Castro’s' })).toBe(portrait)
    fireEvent.click(screen.getByRole('button', { name: 'Voltar à escolha de práticas' }))
    expect(document.activeElement).toHaveAttribute('aria-label', 'Escolher uma prática')
  })

  it.each([false, true])('preserves the ending sequence and contact action with reduced motion %s', (reduced) => {
    settings.reduced = reduced
    sessionStorage.setItem('castros.home.entry.v1', 'seen')
    const height = window.innerHeight + 4800
    const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    measure.mockReturnValue({ top: 84, height } as DOMRect)
    render(<MemoryRouter><HomeEntry consulting={<p>Serviços</p>} training={<p>Cursos</p>} spaces={<h2 id="home-spaces-title">Espaços</h2>} closing /></MemoryRouter>)
    const stage = screen.getByRole('region', { name: 'A experiência Castro’s' })
    for (const [progress, expected] of [[3, reduced ? 'H10' : 'H09'], [3.5, 'H10'], [4.5, 'H11'], [5.5, 'H12'], [2.5, 'H08']] as const) {
      measure.mockReturnValue({ top: 84 - progress * 800, height } as DOMRect)
      fireEvent.scroll(window)
      act(() => vi.advanceTimersByTime(20))
      expect(stage).toHaveAttribute('data-frame', expected)
    }
    expect(screen.getByRole('link', { name: 'Falar com a Castro’s' })).toHaveAttribute('href', '/contacto')
    expect(screen.getByText('Testemunhos aprovados em preparação.')).toHaveAttribute('data-content-class', 'PENDING_CONTENT')
    expect(screen.queryByRole('blockquote')).not.toBeInTheDocument()
  })

  it('reveals and focuses the gateway before resolving the discovery scroll', () => {
    settings.reduced = true
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(1665)
    renderEntry()
    fireEvent.click(screen.getByRole('button', { name: 'Explorar a experiência' }))
    expect(screen.getByRole('region', { name: 'A experiência Castro’s' })).toHaveAttribute('data-frame', 'H05')
    expect(document.activeElement).toHaveAttribute('aria-label', 'Escolher uma prática')
    expect(scrollTo).toHaveBeenCalledWith({ top: (1665 - window.innerHeight) * .7, behavior: 'instant' })
  })
})
