import { HttpApiClient } from './HttpApiClient'

export type SpaceLayoutDto = { id: string; spaceId: string; name: string; description?: string | null; capacity?: number | null; active: boolean; sortOrder: number; createdAt: string; updatedAt: string }
export type SpaceLayoutInputDto = { name: string; description?: string; capacity?: number | null; active: boolean; sortOrder: number }
export type SpaceResourceDto = { id: string; spaceId: string; name: string; description?: string | null; quantity?: number | null; active: boolean; sortOrder: number; createdAt: string; updatedAt: string }
export type SpaceResourceInputDto = { name: string; description?: string; quantity?: number | null; active: boolean; sortOrder: number }

const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const client = baseUrl ? new HttpApiClient(baseUrl) : null
const prefix = (spaceId: string) => `/api/v1/operations/spaces/${encodeURIComponent(spaceId)}`
const json = { 'Content-Type': 'application/json' }

export const spaceExperienceAdmin = {
  async listLayouts(spaceId: string): Promise<SpaceLayoutDto[]> { return client ? client.requestOrThrow<SpaceLayoutDto[]>(`${prefix(spaceId)}/layouts`) : [] },
  async createLayout(spaceId: string, input: SpaceLayoutInputDto): Promise<SpaceLayoutDto> {
    if (!client) throw new Error('Operational mock mutation is not configured.')
    return client.requestOrThrow<SpaceLayoutDto>(`${prefix(spaceId)}/layouts`, { method: 'POST', headers: json, body: JSON.stringify(input) })
  },
  async updateLayout(spaceId: string, id: string, input: SpaceLayoutInputDto): Promise<SpaceLayoutDto> {
    if (!client) throw new Error('Operational mock mutation is not configured.')
    return client.requestOrThrow<SpaceLayoutDto>(`${prefix(spaceId)}/layouts/${encodeURIComponent(id)}`, { method: 'PUT', headers: json, body: JSON.stringify(input) })
  },
  async deleteLayout(spaceId: string, id: string): Promise<void> {
    if (!client) return
    return client.requestOrThrow<void>(`${prefix(spaceId)}/layouts/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
  async listResources(spaceId: string): Promise<SpaceResourceDto[]> { return client ? client.requestOrThrow<SpaceResourceDto[]>(`${prefix(spaceId)}/resources`) : [] },
  async createResource(spaceId: string, input: SpaceResourceInputDto): Promise<SpaceResourceDto> {
    if (!client) throw new Error('Operational mock mutation is not configured.')
    return client.requestOrThrow<SpaceResourceDto>(`${prefix(spaceId)}/resources`, { method: 'POST', headers: json, body: JSON.stringify(input) })
  },
  async updateResource(spaceId: string, id: string, input: SpaceResourceInputDto): Promise<SpaceResourceDto> {
    if (!client) throw new Error('Operational mock mutation is not configured.')
    return client.requestOrThrow<SpaceResourceDto>(`${prefix(spaceId)}/resources/${encodeURIComponent(id)}`, { method: 'PUT', headers: json, body: JSON.stringify(input) })
  },
  async deleteResource(spaceId: string, id: string): Promise<void> {
    if (!client) return
    return client.requestOrThrow<void>(`${prefix(spaceId)}/resources/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
}
