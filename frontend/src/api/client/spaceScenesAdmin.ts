import { HttpApiClient } from './HttpApiClient'

export type SpaceSceneDto = { id: string; spaceId: string; panoramaUrl: string; title?: string | null; initialYaw: number; initialPitch: number; sortOrder: number }
export type SpaceSceneInputDto = { panoramaUrl: string; title?: string; initialYaw: number; initialPitch: number; sortOrder: number }

const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const client = baseUrl ? new HttpApiClient(baseUrl) : null
const prefix = (spaceId: string) => `/api/v1/operations/spaces/${encodeURIComponent(spaceId)}/scenes`
const json = { 'Content-Type': 'application/json' }

export const spaceScenesAdmin = {
  async list(spaceId: string): Promise<SpaceSceneDto[]> { return client ? client.requestOrThrow<SpaceSceneDto[]>(prefix(spaceId)) : [] },
  async create(spaceId: string, input: SpaceSceneInputDto): Promise<SpaceSceneDto> {
    if (!client) throw new Error('Operational mock mutation is not configured.')
    return client.requestOrThrow<SpaceSceneDto>(prefix(spaceId), { method: 'POST', headers: json, body: JSON.stringify(input) })
  },
  async update(spaceId: string, id: string, input: SpaceSceneInputDto): Promise<SpaceSceneDto> {
    if (!client) throw new Error('Operational mock mutation is not configured.')
    return client.requestOrThrow<SpaceSceneDto>(`${prefix(spaceId)}/${encodeURIComponent(id)}`, { method: 'PUT', headers: json, body: JSON.stringify(input) })
  },
  async delete(spaceId: string, id: string): Promise<void> {
    if (!client) return
    return client.requestOrThrow<void>(`${prefix(spaceId)}/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
}
