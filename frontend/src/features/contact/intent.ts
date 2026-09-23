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

const JOURNEY_KEY = 'castros.public-journey.v2'

// Keep route identity without recording free text, resource identifiers or query data.
export function publicRouteIdentity(pathname: string): string {
  const path = pathname.split(/[?#]/)[0]
  if (/^\/(servicos|formacao|espacos)\//.test(path)) {
    const [family, , ...rest] = path.slice(1).split('/')
    if (family === 'formacao' && rest[0] === 'sessoes') return '/formacao/:slug/sessoes/:id/inscricao'
    const suffix = rest[0] && ['explorar', 'configurar', 'disponibilidade'].includes(rest[0]) ? `/${rest[0]}` : ''
    return `/${family}/:slug${suffix}`
  }
  if (path.startsWith('/reservar/confirmacao/')) return '/reservar/confirmacao/:reference'
  if (path.startsWith('/reservar/')) return '/reservar/:type/:id/:step'
  return ['/', '/servicos', '/formacao', '/espacos', '/contacto', '/sobre', '/insights', '/reservar'].includes(path) ? path : '/'
}

function clean(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function contextToken(value: string | null | undefined) {
  const normalized = clean(value)
  return normalized && /^[a-zA-Z0-9_-]{1,80}$/.test(normalized) ? normalized : undefined
}

export function capturePublicJourney(pathname: string, _search: string, _referrer?: string): PublicJourney {
  void _search
  void _referrer
  const existing = readPublicJourney()
  if (existing) return existing
  const journey: PublicJourney = {
    entryPath: publicRouteIdentity(pathname),
  }
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('castros.public-journey.v1')
      window.sessionStorage.setItem(JOURNEY_KEY, JSON.stringify(journey))
    }
  } catch { /* Attribution is optional when browser storage is unavailable. */ }
  return journey
}

export function readPublicJourney(): PublicJourney | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = window.sessionStorage.getItem(JOURNEY_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : undefined
    if (!parsed || typeof parsed !== 'object' || !('entryPath' in parsed) || typeof parsed.entryPath !== 'string') return undefined
    return { entryPath: publicRouteIdentity(parsed.entryPath) }
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
  if (input.type && ['CONSULTATION', 'CORPORATE_PROPOSAL', 'TRAINING_INFO', 'SPACE_INFO', 'GENERAL'].includes(input.type)) params.set('type', input.type)
  if (input.sourceType) params.set('source', input.sourceType)
  const entity = contextToken(input.entityId)
  const cta = contextToken(input.cta)
  if (entity) params.set('entity', entity)
  if (cta) params.set('cta', cta)
  const query = params.toString()
  return query ? `/contacto?${query}` : '/contacto'
}

export function contextFromSearch(search: URLSearchParams, sourcePath: string): RequestIntentContext {
  const source = search.get('source')
  const sourceType: PublicIntentSource = source === 'SERVICE' || source === 'TRAINING' || source === 'SPACE' ? source : 'GENERAL'
  const entityId = contextToken(search.get('entity'))
  const journey = readPublicJourney() ?? {}
  return {
    ...journey,
    sourceType,
    entityId: sourceType === 'GENERAL' ? undefined : entityId,
    cta: contextToken(search.get('cta')),
    sourcePath: publicRouteIdentity(sourcePath),
  }
}

export function whatsappHref(number: string, message: string) {
  const digits = number.replace(/\D/g, '')
  if (!digits) return undefined
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
