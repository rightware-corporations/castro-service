import { createContext, useContext, useMemo, type PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ApiAdapter } from '../../api/client/adapters'
import { createApiAdapter } from '../../api/client/adapters'
import type { AuthSession, Permission, PermissionContext } from '../../domain'
import { createCan } from '../../domain/permissions'

const ApiContext = createContext<ApiAdapter | null>(null)
const SessionContext = createContext<AuthSession | null>(null)
const PermissionContextValue = createContext<PermissionContext | null>(null)

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

  return (
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={api}>
        <SessionContext.Provider value={null}>
          <PermissionContextValue.Provider value={null}>{children}</PermissionContextValue.Provider>
        </SessionContext.Provider>
      </ApiContext.Provider>
    </QueryClientProvider>
  )
}
