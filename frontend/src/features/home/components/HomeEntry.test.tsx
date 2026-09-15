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
