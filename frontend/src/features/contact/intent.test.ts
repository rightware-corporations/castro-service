import { beforeEach, describe, expect, it, vi } from 'vitest'
import { capturePublicJourney, contactHref, contextFromSearch, readPublicJourney, whatsappHref } from './intent'

beforeEach(() => sessionStorage.clear())

describe('public intent context', () => {
  it('keeps first-entry attribution for the browser session', () => {
    capturePublicJourney('/formacao/lideranca', '?utm_source=instagram&utm_campaign=setembro', 'https://instagram.com/')
    const context = contextFromSearch(new URLSearchParams('source=TRAINING&entity=course-1&cta=TRAINING_DATES'), '/contacto')
    expect(context).toMatchObject({ sourceType: 'TRAINING', entityId: 'course-1', cta: 'TRAINING_DATES', entryPath: '/formacao/:slug' })
    expect(context).not.toHaveProperty('utmCampaign')
  })

  it('builds contextual contact and whatsapp destinations', () => {
    expect(contactHref({ type: 'CONSULTATION', sourceType: 'SERVICE', entityId: 'service-1', cta: 'SERVICE_CONTACT' })).toContain('source=SERVICE')
    expect(whatsappHref('+258 84 123 4567', 'Olá Castro’s')).toContain('https://wa.me/258841234567?text=')
  })

  it('does not retain free text, query data or referrer credentials', () => {
    capturePublicJourney('/reservar/confirmacao/private-reference', '?email=ana@example.com', 'https://user:password@example.com/private')
    expect(readPublicJourney()).toEqual({ entryPath: '/reservar/confirmacao/:reference' })
    expect(contactHref({ message: 'My private message' })).toBe('/contacto')
  })

  it('keeps navigation usable when browser storage is blocked', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    try { expect(capturePublicJourney('/espacos', '')).toEqual({ entryPath: '/espacos' }) }
    finally { spy.mockRestore() }
  })

  it('discards corrupt and unexpected stored attribution', () => {
    sessionStorage.setItem('castros.public-journey.v2', '{invalid')
    expect(readPublicJourney()).toBeUndefined()
    sessionStorage.setItem('castros.public-journey.v2', JSON.stringify({ entryPath: '/contacto?email=private', email: 'private' }))
    expect(readPublicJourney()).toEqual({ entryPath: '/contacto' })
  })
})
