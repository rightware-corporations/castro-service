export const publicBookableTypes = ['SERVICE', 'SPACE', 'COURSE_SESSION'] as const
export type BookingTarget = typeof publicBookableTypes[number]

export function isPublicBookableType(value: string): value is BookingTarget {
  return publicBookableTypes.includes(value as BookingTarget)
}

export type Permission =
  | 'dashboard.read'
  | 'customer.read'
  | 'customer.create'
  | 'customer.update'
  | 'customer.delete'
  | 'request.read'
  | 'request.create'
  | 'request.update'
  | 'request.assign'
  | 'request.close'
  | 'booking.read'
  | 'booking.create'
  | 'booking.update'
  | 'booking.cancel'
  | 'service.read'
  | 'service.manage'
  | 'course.read'
  | 'course.manage'
  | 'space.read'
  | 'space.manage'
  | 'availability.read'
  | 'availability.manage'
  | 'content.read'
  | 'content.manage'
  | 'user.read'
  | 'user.manage'
  | 'role.read'
  | 'role.manage'
  | 'permission.read'
  | 'permission.manage'
  | 'settings.read'
  | 'settings.manage'
  | 'task.read'
  | 'task.manage'
  | 'notification.read'
  | 'audit.read'

export type PermissionSet = ReadonlySet<Permission>

export type AuthSession = {
  authenticated: boolean
  subject?: string
  username?: string
  displayName?: string
  organizationId?: string
  permissions?: string[]
}

export type PermissionContext = { permissions: PermissionSet }
export type Collection<T> = { items: T[]; total: number }
