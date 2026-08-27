export type BookingTarget = 'SPACE' | 'SERVICE' | 'COURSE_SESSION'

export type Permission =
  | 'dashboard.read'
  | 'request.read'
  | 'request.create'
  | 'request.update'
  | 'request.assign'
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
  | 'audit.read'

export type PermissionSet = ReadonlySet<Permission>

export type AuthSession = {
  authenticated: boolean
  subject?: string
  username?: string
  displayName?: string
}

export type PermissionContext = {
  permissions: PermissionSet
}

export type Collection<T> = {
  items: T[]
  total: number
}
