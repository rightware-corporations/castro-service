import type { OperationsRequestItemDto, RequestOperationalStatus } from '../../api/contracts'
import { HttpApiClient } from '../../api/client/HttpApiClient'

export type CrmAssigneeDto = { id: string; firstName: string; lastName: string; experienceType: 'OPERATIONS' | 'OWNER' }
export type FollowUpInput = { ownerUserId?: string | null; followUpAt?: string | null }

const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
const client = new HttpApiClient(baseUrl)
const mockMode = import.meta.env.DEV && !baseUrl

const mockRequest: OperationsRequestItemDto = {
  id: 'crm-preview',
  type: 'CONSULTATION',
  status: 'NEW',
  message: 'Pré-visualização local do fluxo CRM.',
  createdAt: new Date().toISOString(),
  firstName: 'Contacto',
  lastName: 'Preview',
  email: 'preview@example.test',
  lifecycleStage: 'LEAD',
  sourceType: 'GENERAL',
  sourceCta: 'LOCAL_PREVIEW',
}

export const crmOperationsApi = {
  getRequest: (id: string) => mockMode
    ? Promise.resolve({ ...mockRequest, id })
    : client.requestOrThrow<OperationsRequestItemDto>(`/api/v1/operations/requests/${encodeURIComponent(id)}`),
  updateStatus: (id: string, status: RequestOperationalStatus) => mockMode
    ? Promise.resolve({ ...mockRequest, id, status })
    : client.requestOrThrow<OperationsRequestItemDto>(`/api/v1/operations/requests/${encodeURIComponent(id)}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    }),
  updateFollowUp: (id: string, input: FollowUpInput) => mockMode
    ? Promise.resolve({ ...mockRequest, id, ownerUserId: input.ownerUserId, followUpAt: input.followUpAt })
    : client.requestOrThrow<OperationsRequestItemDto>(`/api/v1/operations/requests/${encodeURIComponent(id)}/follow-up`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
    }),
  listAssignees: () => mockMode
    ? Promise.resolve<CrmAssigneeDto[]>([])
    : client.requestOrThrow<CrmAssigneeDto[]>('/api/v1/operations/crm/assignees'),
}
