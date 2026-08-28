import { createContext, useContext, useMemo, type PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import type { ApiAdapter } from '../../api/client/adapters'
import { createApiAdapter } from '../../api/client/adapters'
import type { AuthSession, Permission, PermissionContext } from '../../domain'
import { createCan } from '../../domain/permissions'

const ApiContext = createContext<ApiAdapter | null>(null)
const SessionContext = createContext<AuthSession | null>(null)
const PermissionContextValue = createContext<PermissionContext | null>(null)

const developmentPermissions: Permission[] = [
  'dashboard.read', 'customer.read', 'customer.create', 'customer.update', 'customer.delete',
  'request.read', 'request.create', 'request.update', 'request.assign', 'request.close',
  'booking.read', 'booking.create', 'booking.update', 'booking.cancel',
  'service.read', 'service.manage', 'course.read', 'course.manage', 'space.read', 'space.manage',
  'availability.read', 'availability.manage', 'content.read', 'content.manage', 'user.read', 'user.manage',
  'role.read', 'role.manage', 'permission.read', 'permission.manage', 'settings.read', 'settings.manage', 'audit.read',
]

export function useApi(): ApiAdapter {
  const api = useContext(ApiContext)
  if (!api) throw new Error('useApi must be used inside AppProviders')
  return api
}
export function useSession(): AuthSession | null { return useContext(SessionContext) }
export function usePermission(permission: Permission): boolean { return useCan()(permission) }
export function useCan(): (permission: Permission) => boolean {
  const permissions = useContext(PermissionContextValue)
  return useMemo(() => createCan(permissions), [permissions])
}

function SessionProviders({ api, children }: PropsWithChildren<{ api: ApiAdapter }>) {
  const sessionQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try { return await api.auth.getSession() } catch { return null }
    },
    retry: false,
    staleTime: 60_000,
    enabled: api.kind === 'http',
  })
  const session = api.kind === 'http' ? (sessionQuery.data ?? null) : null
  const permissionContext = useMemo<PermissionContext | null>(() => {
    if (import.meta.env.DEV && api.kind === 'mock') return { permissions: new Set<Permission>(developmentPermissions) }
    if (!session?.authenticated) return null
    return { permissions: new Set<Permission>((session.permissions ?? []) as Permission[]) }
  }, [api.kind, session])
  return <SessionContext.Provider value={session}><PermissionContextValue.Provider value={permissionContext}>{children}</PermissionContextValue.Provider></SessionContext.Provider>
}

export function AppProviders({ children }: PropsWithChildren) {
  const queryClient = useMemo(() => new QueryClient(), [])
  const api = useMemo(() => createApiAdapter(), [])
  return <QueryClientProvider client={queryClient}><ApiContext.Provider value={api}><SessionProviders api={api}>{children}</SessionProviders></ApiContext.Provider></QueryClientProvider>
}
