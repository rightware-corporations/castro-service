import type { AuthSession } from '../../domain'
import { HttpApiClient } from '../../api/client/HttpApiClient'

const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
const client = new HttpApiClient(baseUrl, fetch, '/api/v1/platform/auth/csrf')
export const isPlatformMockMode = import.meta.env.DEV && !baseUrl

export type PlatformAuthDto = {
  email: string
  authenticated: boolean
  organizationId?: string | null
  firstName?: string | null
  lastName?: string | null
  experienceType?: string | null
  permissions?: string[]
}

export type PlatformOverviewDto = {
  organizations: number
  activeOrganizations: number
  tenantUsers: number
  activeTenantUsers: number
  platformAdministrators: number
  databaseStatus: string
  administratorEmail: string
  generatedAt: string
}

export type PlatformOrganizationDto = {
  id: string
  name: string
  slug: string
  active: boolean
  tenantUsers: number
  activeTenantUsers: number
  createdAt: string
}

export type PlatformAuditDto = {
  id: string
  action: string
  entityType: string
  entityId?: string | null
  details?: string | null
  actorEmail?: string | null
  createdAt: string
}

export function mapPlatformSession(dto: PlatformAuthDto): AuthSession {
  return {
    authenticated: dto.authenticated,
    identityKind: 'PLATFORM',
    subject: dto.email,
    username: dto.email,
    displayName: [dto.firstName, dto.lastName].filter(Boolean).join(' ') || dto.email,
    permissions: dto.permissions ?? [],
  }
}

const mockAuth: PlatformAuthDto = {
  email: 'superadmin@rightware.local',
  authenticated: true,
  firstName: 'RIGHTWARE',
  lastName: 'Super Admin',
  permissions: ['platform.admin'],
}

const mockOverview: PlatformOverviewDto = {
  organizations: 1,
  activeOrganizations: 1,
  tenantUsers: 2,
  activeTenantUsers: 2,
  platformAdministrators: 1,
  databaseStatus: 'DEV MOCK',
  administratorEmail: mockAuth.email,
  generatedAt: '2026-09-04T10:00:00+02:00',
}

const mockOrganizations: PlatformOrganizationDto[] = [{
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Castro’s Services',
  slug: 'castros-services',
  active: true,
  tenantUsers: 2,
  activeTenantUsers: 2,
  createdAt: '2026-08-01T09:00:00+02:00',
}]

const mockAudit: PlatformAuditDto[] = [{
  id: '00000000-0000-0000-0000-000000000101',
  action: 'LOCAL_PLATFORM_PREVIEW',
  entityType: 'DEVELOPMENT',
  details: 'Dados demonstrativos usados apenas para validar a experiência local do Super Admin.',
  actorEmail: mockAuth.email,
  createdAt: '2026-09-04T10:00:00+02:00',
}]

export const platformApi = {
  login: (email: string, password: string) => isPlatformMockMode
    ? Promise.resolve({ ...mockAuth, email: email || mockAuth.email })
    : client.requestOrThrow<PlatformAuthDto>('/api/v1/platform/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  getSession: () => isPlatformMockMode ? Promise.resolve(mockAuth) : client.requestOrThrow<PlatformAuthDto>('/api/v1/platform/auth/me'),
  logout: () => isPlatformMockMode ? Promise.resolve() : client.requestOrThrow<void>('/api/v1/platform/auth/logout', { method: 'POST' }),
  getOverview: () => isPlatformMockMode ? Promise.resolve(mockOverview) : client.requestOrThrow<PlatformOverviewDto>('/api/v1/platform/overview'),
  listOrganizations: () => isPlatformMockMode ? Promise.resolve(mockOrganizations) : client.requestOrThrow<PlatformOrganizationDto[]>('/api/v1/platform/organizations'),
  listAudit: () => isPlatformMockMode ? Promise.resolve(mockAudit) : client.requestOrThrow<PlatformAuditDto[]>('/api/v1/platform/audit'),
}
