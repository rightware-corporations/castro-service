import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../../api/client/errors'
import type { AuthSession } from '../../domain'
import { mapPlatformSession, platformApi } from './platformApi'

export const platformSessionQueryKey = ['platform', 'auth', 'me'] as const

export function usePlatformSession(): { session: AuthSession | null; ready: boolean; error: boolean } {
  const query = useQuery({
    queryKey: platformSessionQueryKey,
    queryFn: async () => {
      try {
        return mapPlatformSession(await platformApi.getSession())
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return null
        throw error
      }
    },
    retry: false,
    staleTime: 60_000,
  })

  return { session: query.data ?? null, ready: query.isFetched, error: query.isError }
}
