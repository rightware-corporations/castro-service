import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MotionProvider } from './MotionProvider'
import { SectionReveal } from './SectionReveal'

class ImmediateIntersectionObserver {
  readonly root = null
  readonly rootMargin = '0px'
  readonly thresholds = [0]
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe(target: Element) {
    this.callback([{ isIntersecting: true, intersectionRatio: 1, target, time: 0, boundingClientRect: target.getBoundingClientRect(), intersectionRect: target.getBoundingClientRect(), rootBounds: null }], this as unknown as IntersectionObserver)
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return [] }
}

function setReducedMotion(reduced: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === '(prefers-reduced-motion)' || query === '(prefers-reduced-motion: reduce)' ? reduced : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  vi.stubGlobal('IntersectionObserver', ImmediateIntersectionObserver)
}

afterEach(() => vi.unstubAllGlobals())

describe('Functional Motion Foundation', () => {
  it('respects reduced-motion preference without hiding editorial content', () => {
    setReducedMotion(true)
    render(<MotionProvider><SectionReveal><p>Conteúdo editorial</p></SectionReveal></MotionProvider>)
    const content = screen.getByText('Conteúdo editorial')
    expect(content).toBeVisible()
    expect(content.parentElement).toHaveAttribute('data-motion-reduced', 'true')
  })

  it('keeps the provider transparent to application content', () => {
    setReducedMotion(false)
    render(<MotionProvider><button type="button">Ação essencial</button></MotionProvider>)
    expect(screen.getByRole('button', { name: 'Ação essencial' })).toBeEnabled()
  })
})
