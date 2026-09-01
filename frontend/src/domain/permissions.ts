import type { AuthSession, Permission, PermissionContext } from './index'

export function createCan(context: PermissionContext | null): (permission: Permission) => boolean {
  return (permission: Permission) => Boolean(context?.permissions.has(permission))
}

export function sessionToContext(session: AuthSession | null): PermissionContext | null {
  void session
  // The current /auth/me contract does not expose permissions. Keep this boundary
  // explicit until backend permission enforcement and payloads are available.
  return null
}
