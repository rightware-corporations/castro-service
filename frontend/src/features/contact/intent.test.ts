import { beforeEach, describe, expect, it } from 'vitest'
import { capturePublicJourney, contactHref, contextFromSearch, whatsappHref } from './intent'

beforeEach(() => sessionStorage.clear())

describe('public intent context', () => {
  it('keeps first-entry attribution for the browser session', () => {
    capturePublicJourney('/formacao/lideranca', '?utm_source=instagram&utm_campaign=setembro', 'https://instagram.com/')
    const context = contextFromSearch(new URLSearchParams('source=TRAINING&entity=course-1&cta=TRAINING_DATES'), '/contacto')
    expect(context).toMatchObject({ sourceType: 'TRAINING', entityId: 'course-1', cta: 'TRAINING_DATES', entryPath: '/formacao/lideranca?utm_source=instagram&utm_campaign=setembro', utmSource: 'instagram', utmCampaign: 'setembro' })
  })

  it('builds contextual contact and whatsapp destinations', () => {
    expect(contactHref({ type: 'CONSULTATION', sourceType: 'SERVICE', entityId: 'service-1', cta: 'SERVICE_CONTACT' })).toContain('source=SERVICE')
    expect(whatsappHref('+258 84 123 4567', 'Olá Castro’s')).toContain('https://wa.me/258841234567?text=')
  })
})
