import type {
  AdminCourseDto,
  AdminCourseSessionDto,
  CourseDto,
  CourseSessionDto,
} from '../contracts'
import type { Collection } from '../../domain'
import type { ApiAdapter } from './adapters'
import { createApiAdapter } from './adapters'

const ORATORY_COURSE_ID = '30000000-0000-0000-0000-000000000001'
const ORATORY_SESSION_ID = '31000000-0000-0000-0000-000000000001'

const confirmedPreviewCourses: CourseDto[] = [
  {
    id: ORATORY_COURSE_ID,
    slug: 'oratoria-comunicacao-eficaz',
    name: 'Oratória e Comunicação Eficaz',
    shortDescription: 'A arte do falar bem transforma ideias em impacto.',
    description: 'Uma formação prática para desenvolver comunicação eficaz, presença, confiança e estrutura ao falar em público.',
    modality: 'PRESENCIAL',
    durationLabel: '1 mês',
    scheduleSummary: 'Terças e quintas, 17h–19h · Sábados, 09h–13h',
    investmentAmount: 1200,
    investmentCurrency: 'MZN',
    certificateIncluded: true,
    learningOutcomes: [
      'Comunicação eficaz e assertiva',
      'Técnicas de oratória e expressão verbal',
      'Linguagem corporal e presença',
      'Organização e estrutura de discursos',
      'Como falar em público com confiança',
    ],
    featured: true,
  },
]

const confirmedPreviewSessions: Record<string, CourseSessionDto[]> = {
  [ORATORY_COURSE_ID]: [
    {
      id: ORATORY_SESSION_ID,
      startAt: '2026-10-12T17:00:00+02:00',
      endAt: '2026-11-12T19:00:00+02:00',
      label: 'Edição Outubro 2026',
    },
  ],
}

const confirmedPreviewAdminCourses: Array<AdminCourseDto & {
  shortDescription?: string | null
  modality?: string | null
  durationLabel?: string | null
  scheduleSummary?: string | null
  investmentAmount?: number | null
  investmentCurrency?: string | null
  certificateIncluded?: boolean
  learningOutcomes?: string[]
  featured?: boolean
}> = confirmedPreviewCourses.map((course) => ({
  id: course.id,
  name: course.name,
  slug: course.slug,
  shortDescription: course.shortDescription,
  description: course.description,
  modality: course.modality,
  durationLabel: course.durationLabel,
  scheduleSummary: course.scheduleSummary,
  investmentAmount: course.investmentAmount,
  investmentCurrency: course.investmentCurrency,
  certificateIncluded: course.certificateIncluded,
  learningOutcomes: course.learningOutcomes,
  featured: course.featured,
  active: true,
}))

const confirmedPreviewAdminSessions: Record<string, Array<AdminCourseSessionDto & { label?: string | null }>> = {
  [ORATORY_COURSE_ID]: confirmedPreviewSessions[ORATORY_COURSE_ID].map((session) => ({
    ...session,
    courseId: ORATORY_COURSE_ID,
    active: true,
  })),
}

const collection = <T>(items: T[]): Collection<T> => ({ items, total: items.length })

/**
 * Keeps production on the real HTTP adapter while making local mock mode
 * represent the confirmed Castro's offer and its real public training flow.
 */
export function createPreviewAwareApiAdapter(): ApiAdapter {
  const base = createApiAdapter()
  if (base.kind === 'http') return base

  const publicApi = base.public
  const operationsApi = base.operations

  return {
    kind: 'mock',
    auth: base.auth,
    availability: base.availability,
    bookings: base.bookings,
    requests: base.requests,
    public: {
      ...publicApi,
      listCourses: async () => collection(confirmedPreviewCourses),
      getCourse: async (slug: string) => confirmedPreviewCourses.find((course) => course.slug === slug) ?? publicApi.getCourse(slug),
      listCourseSessions: async (courseId: string) => {
        const sessions = confirmedPreviewSessions[courseId]
        return sessions ? collection(sessions) : publicApi.listCourseSessions(courseId)
      },
    },
    operations: {
      ...operationsApi,
      listAdminCourses: async () => collection<AdminCourseDto>(confirmedPreviewAdminCourses),
      listAdminCourseSessions: async (courseId: string) => {
        const sessions = confirmedPreviewAdminSessions[courseId]
        return sessions ? collection<AdminCourseSessionDto>(sessions) : operationsApi.listAdminCourseSessions(courseId)
      },
    },
  }
}
