import type { AuthSession } from '../../domain'
import { HttpApiClient } from '../../api/client/HttpApiClient'

const client = new HttpApiClient(import.meta.env.VITE_API_BASE_URL?.trim() ?? '')

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
    subject: dto.email,
    username: dto.email,
    displayName: [dto.firstName, dto.lastName].filter(Boolean).join(' ') || dto.email,
    permissions: dto.permissions ?? [],
  }
}

export const platformApi = {
  login: (email: string, password: string) => client.requestOrThrow<PlatformAuthDto>('/api/v1/platform/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }),
  getOverview: () => client.requestOrThrow<PlatformOverviewDto>('/api/v1/platform/overview'),
  listOrganizations: () => client.requestOrThrow<PlatformOrganizationDto[]>('/api/v1/platform/organizations'),
  listAudit: () => client.requestOrThrow<PlatformAuditDto[]>('/api/v1/platform/audit'),
}
