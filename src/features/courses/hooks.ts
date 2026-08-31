import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../app/providers/AppProviders'
import { mapCourseDto, mapCourseSessionDto } from '../../api/contracts/mappers'
import type { Course } from '../../domain/models'

export function useCourses() {
  const api = useApi()
  return useQuery({ queryKey: ['public', 'courses'], queryFn: async () => { const result = await api.public.listCourses(); return { ...result, items: result.items.map(mapCourseDto) } } })
}

export function useCourse(slug: string | undefined) {
  const api = useApi()
  return useQuery<Course | undefined>({ queryKey: ['public', 'course', slug], queryFn: async () => mapCourseDto(await api.public.getCourse(slug!)), enabled: Boolean(slug) })
}

export function useCourseSessions(courseId: string | undefined) {
  const api = useApi()
  return useQuery({ queryKey: ['public', 'course-sessions', courseId], queryFn: async () => { const result = await api.public.listCourseSessions(courseId!); return { ...result, items: result.items.map(mapCourseSessionDto) } }, enabled: Boolean(courseId) })
}
