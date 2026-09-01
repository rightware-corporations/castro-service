import { HttpApiClient } from './HttpApiClient'

export type AuditEventDto = { id:string; actorUserId?:string|null; actorFirstName?:string|null; actorLastName?:string|null; actorEmail?:string|null; action:string; entityType:string; entityId?:string|null; details?:string|null; createdAt:string }

const baseUrl=import.meta.env.VITE_API_BASE_URL?.trim()
const client=baseUrl?new HttpApiClient(baseUrl):null

export const auditAdmin={
  async list():Promise<AuditEventDto[]>{return client?client.requestOrThrow<AuditEventDto[]>('/api/v1/operations/audit'):[]},
}
