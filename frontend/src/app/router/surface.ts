export type AppSurface = 'ALL' | 'PUBLIC' | 'STAFF' | 'PLATFORM'

export function parseAppSurface(value?: string | null): AppSurface {
  const normalized = value?.trim().toUpperCase()
  if (normalized === 'PUBLIC' || normalized === 'STAFF' || normalized === 'PLATFORM') return normalized
  return 'ALL'
}

export const appSurface = parseAppSurface(import.meta.env.VITE_APP_SURFACE)

export const surfaceAllowsPublic = appSurface === 'ALL' || appSurface === 'PUBLIC'
export const surfaceAllowsStaff = appSurface === 'ALL' || appSurface === 'STAFF'
export const surfaceAllowsPlatform = appSurface === 'ALL' || appSurface === 'PLATFORM'

export function surfaceFallbackPath(surface: AppSurface): string {
  if (surface === 'STAFF') return '/login'
  if (surface === 'PLATFORM') return '/platform/login'
  return '/'
}
