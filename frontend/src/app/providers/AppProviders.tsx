import { createContext, useContext, useMemo, type PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import type { ApiAdapter } from '../../api/client/adapters'
import { createPreviewAwareApiAdapter } from '../../api/client/previewAdapter'
import { ApiError } from '../../api/client/errors'
import type { AuthSession, Permission, PermissionContext } from '../../domain'
import { createCan } from '../../domain/permissions'

const ApiContext = createContext<ApiAdapter | null>(null)
const SessionContext = createContext<AuthSession | null>(null)
const SessionReadyContext = createContext(false)
const SessionErrorContext = createContext(false)
const PermissionContextValue = createContext<PermissionContext | null>(null)

// Local mock mode represents the day-to-day Secretary/Operations persona.
// Platform access, tenant-user administration and RBAC management are intentionally excluded.
const developmentPermissions: Permission[] = [
  'dashboard.read',
  'customer.read', 'customer.create', 'customer.update',
  'request.read', 'request.create', 'request.update', 'request.assign', 'request.close',
  'booking.read', 'booking.create', 'booking.update', 'booking.cancel',
  'service.read', 'service.manage',
  'course.read', 'course.manage',
  'space.read', 'space.manage',
  'availability.read', 'availability.manage',
  'content.read', 'content.manage',
  'settings.read', 'settings.manage',
  'task.read', 'task.manage',
  'notification.read',
  'report.read',
]

export function useApi(): ApiAdapter { const api = useContext(ApiContext); if (!api) throw new Error('useApi must be used inside AppProviders'); return api }
export function useSession(): AuthSession | null { return useContext(SessionContext) }
export function useSessionReady(): boolean { return useContext(SessionReadyContext) }
export function useSessionError(): boolean { return useContext(SessionErrorContext) }
export function usePermission(permission: Permission): boolean { return useCan()(permission) }
export function useCan(): (permission: Permission) => boolean { const permissions = useContext(PermissionContextValue); return useMemo(() => createCan(permissions), [permissions]) }

function SessionProviders({ api, children }: PropsWithChildren<{ api: ApiAdapter }>) {
  const sessionQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await api.auth.getSession()
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return null
        throw error
      }
    },
    retry: false,
    staleTime: 60_000,
    enabled: api.kind === 'http',
  })
  const session = api.kind === 'http' ? (sessionQuery.data ?? null) : null
  const ready = api.kind === 'mock' || sessionQuery.isFetched
  const sessionError = api.kind === 'http' && sessionQuery.isError
  const permissionContext = useMemo<PermissionContext | null>(() => {
    if (import.meta.env.DEV && api.kind === 'mock') return { permissions: new Set<Permission>(developmentPermissions) }
    if (!session?.authenticated) return null
    return { permissions: new Set<Permission>((session.permissions ?? []) as Permission[]) }
  }, [api.kind, session])
  return <SessionReadyContext.Provider value={ready}><SessionErrorContext.Provider value={sessionError}><SessionContext.Provider value={session}><PermissionContextValue.Provider value={permissionContext}>{children}</PermissionContextValue.Provider></SessionContext.Provider></SessionErrorContext.Provider></SessionReadyContext.Provider>
}

export function AppProviders({ children }: PropsWithChildren) {
  const queryClient = useMemo(() => new QueryClient(), [])
  const api = useMemo(() => createPreviewAwareApiAdapter(), [])
  return <QueryClientProvider client={queryClient}><ApiContext.Provider value={api}><SessionProviders api={api}>{children}</SessionProviders></ApiContext.Provider></QueryClientProvider>
}
