import { createContext, useContext, useMemo, type PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ApiAdapter } from '../../api/client/adapters'
import { createApiAdapter } from '../../api/client/adapters'
import type { AuthSession, Permission, PermissionContext } from '../../domain'
import { createCan } from '../../domain/permissions'

const ApiContext = createContext<ApiAdapter | null>(null)
const SessionContext = createContext<AuthSession | null>(null)
const PermissionContextValue = createContext<PermissionContext | null>(null)

const developmentPermissions: Permission[] = [
  'dashboard.read',
  'customer.read',
  'customer.create',
  'customer.update',
  'customer.delete',
  'request.read',
  'request.create',
  'request.update',
  'request.assign',
  'booking.read',
  'booking.create',
  'booking.update',
  'booking.cancel',
  'service.read',
  'service.manage',
  'course.read',
  'course.manage',
  'space.read',
  'space.manage',
  'availability.read',
  'availability.manage',
  'content.read',
  'content.manage',
  'user.read',
  'user.manage',
  'role.read',
  'role.manage',
  'permission.read',
  'permission.manage',
  'settings.read',
  'settings.manage',
  'audit.read',
]

export function useApi(): ApiAdapter {
  const api = useContext(ApiContext)
  if (!api) throw new Error('useApi must be used inside AppProviders')
  return api
}

export function useSession(): AuthSession | null {
  return useContext(SessionContext)
}

export function usePermission(permission: Permission): boolean {
  return useCan()(permission)
}

export function useCan(): (permission: Permission) => boolean {
  const permissions = useContext(PermissionContextValue)
  return useMemo(() => createCan(permissions), [permissions])
}

export function AppProviders({ children }: PropsWithChildren) {
  const queryClient = useMemo(() => new QueryClient(), [])
  const api = useMemo(() => createApiAdapter(), [])
  const developmentPermissionContext = useMemo<PermissionContext | null>(() => {
    if (!import.meta.env.DEV || api.kind !== 'mock') return null
    return { permissions: new Set<Permission>(developmentPermissions) }
  }, [api])

  return (
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={api}>
        <SessionContext.Provider value={null}>
          <PermissionContextValue.Provider value={developmentPermissionContext}>{children}</PermissionContextValue.Provider>
        </SessionContext.Provider>
      </ApiContext.Provider>
    </QueryClientProvider>
  )
}
