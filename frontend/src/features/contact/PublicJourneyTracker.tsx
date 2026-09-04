import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { capturePublicJourney } from './intent'

const internalPrefixes = ['/app', '/owner', '/platform', '/login', '/recuperar-password', '/redefinir-password']

export function PublicJourneyTracker() {
  const location = useLocation()
  useEffect(() => {
    if (internalPrefixes.some(prefix => location.pathname.startsWith(prefix))) return
    capturePublicJourney(location.pathname, location.search, typeof document === 'undefined' ? undefined : document.referrer)
  }, [location.pathname, location.search])
  return null
}
