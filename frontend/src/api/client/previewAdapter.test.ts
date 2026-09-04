import { describe, expect, it } from 'vitest'
import { createPreviewAwareApiAdapter } from './previewAdapter'

describe('confirmed local training preview', () => {
  it('exposes the real Oratory course, its edition and the reusable registration flow', async () => {
    const api = createPreviewAwareApiAdapter()
    expect(api.kind).toBe('mock')

    const courses = await api.public.listCourses()
    expect(courses.items).toHaveLength(1)

    const course = courses.items[0]
    expect(course).toMatchObject({
      slug: 'oratoria-comunicacao-eficaz',
      name: 'Oratória e Comunicação Eficaz',
      modality: 'PRESENCIAL',
      durationLabel: '1 mês',
      investmentAmount: 1200,
      investmentCurrency: 'MZN',
      certificateIncluded: true,
      featured: true,
    })
    expect(course.contactPhone).toBeUndefined()
    expect(course.learningOutcomes).toHaveLength(5)

    const sessions = await api.public.listCourseSessions(course.id)
    expect(sessions.items).toHaveLength(1)
    expect(sessions.items[0]).toMatchObject({
      label: 'Edição Outubro 2026',
      startAt: '2026-10-12T17:00:00+02:00',
    })

    const registration = await api.public.registerCourseSession(sessions.items[0].id, {
      firstName: 'Preview',
      email: 'preview@example.com',
      participantCount: 1,
    })
    expect(registration).toMatchObject({ status: 'PENDING', courseSessionId: sessions.items[0].id })
  })

  it('shows the same confirmed course in the Secretary training workspace', async () => {
    const api = createPreviewAwareApiAdapter()
    const courses = await api.operations.listAdminCourses()
    const sessions = await api.operations.listAdminCourseSessions(courses.items[0].id)

    expect(courses.items[0]).toMatchObject({
      slug: 'oratoria-comunicacao-eficaz',
      active: true,
    })
    expect(sessions.items[0]).toMatchObject({
      courseId: courses.items[0].id,
      active: true,
    })
  })
})
