import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const positions = new Map<string, number>()

export function usePublicScrollRestoration() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const previous = useRef(location)
  useLayoutEffect(() => {
    const prior = previous.current
    previous.current = location
    positions.set(prior.key, window.scrollY)
    if (positions.size > 100) positions.delete(positions.keys().next().value!)
    if (prior.pathname === location.pathname) return

    const target = navigationType === 'POP' ? positions.get(location.key) ?? 0 : 0
    let observer: ResizeObserver | undefined
    const stop = () => observer?.disconnect()
    const restore = () => {
      window.scrollTo({ top: target, behavior: 'instant' })
      if (document.documentElement.scrollHeight - window.innerHeight >= target) stop()
    }
    restore()
    // Cached data can render after route mount. Stop as soon as the visitor acts.
    if (target > document.documentElement.scrollHeight - window.innerHeight && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(restore)
      observer.observe(document.documentElement)
    }
    window.addEventListener('wheel', stop, { passive: true, once: true })
    window.addEventListener('touchstart', stop, { passive: true, once: true })
    window.addEventListener('keydown', stop, { once: true })
    return () => {
      stop()
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
      window.removeEventListener('keydown', stop)
    }
  }, [location, navigationType])
}
