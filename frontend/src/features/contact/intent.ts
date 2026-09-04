export type PublicIntentSource = 'GENERAL' | 'SERVICE' | 'TRAINING' | 'SPACE'

export type PublicJourney = {
  entryPath?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export type RequestIntentContext = PublicJourney & {
  sourceType: PublicIntentSource
  entityId?: string
  cta?: string
  sourcePath?: string
}

const JOURNEY_KEY = 'castros.public-journey.v1'

function clean(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

export function capturePublicJourney(pathname: string, search: string, referrer?: string): PublicJourney {
  const existing = readPublicJourney()
  if (existing) return existing
  const params = new URLSearchParams(search)
  const journey: PublicJourney = {
    entryPath: pathname + search,
    referrer: clean(referrer),
    utmSource: clean(params.get('utm_source')),
    utmMedium: clean(params.get('utm_medium')),
    utmCampaign: clean(params.get('utm_campaign')),
  }
  if (typeof window !== 'undefined') window.sessionStorage.setItem(JOURNEY_KEY, JSON.stringify(journey))
  return journey
}

export function readPublicJourney(): PublicJourney | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = window.sessionStorage.getItem(JOURNEY_KEY)
    return raw ? JSON.parse(raw) as PublicJourney : undefined
  } catch {
    return undefined
  }
}

export function contactHref(input: {
  type?: string
  sourceType?: PublicIntentSource
  entityId?: string
  cta?: string
  message?: string
}) {
  const params = new URLSearchParams()
  if (input.type) params.set('type', input.type)
  if (input.sourceType) params.set('source', input.sourceType)
  if (input.entityId) params.set('entity', input.entityId)
  if (input.cta) params.set('cta', input.cta)
  if (input.message) params.set('message', input.message)
  const query = params.toString()
  return query ? `/contacto?${query}` : '/contacto'
}

export function contextFromSearch(search: URLSearchParams, sourcePath: string): RequestIntentContext {
  const source = search.get('source')
  const sourceType: PublicIntentSource = source === 'SERVICE' || source === 'TRAINING' || source === 'SPACE' ? source : 'GENERAL'
  const entityId = clean(search.get('entity'))
  const journey = readPublicJourney() ?? {}
  return {
    ...journey,
    sourceType,
    entityId: sourceType === 'GENERAL' ? undefined : entityId,
    cta: clean(search.get('cta')),
    sourcePath,
  }
}

export function whatsappHref(number: string, message: string) {
  const digits = number.replace(/\D/g, '')
  if (!digits) return undefined
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
