import { HttpApiClient } from './HttpApiClient'

export type SpaceHotspotDto = { id: string; sceneId: string; title: string; description?: string | null; yaw: number; pitch: number; type: string; targetSceneId?: string | null; resourceId?: string | null }
export type SpaceHotspotInputDto = { title: string; description?: string; yaw: number; pitch: number; type: string; targetSceneId?: string | null; resourceId?: string | null }

const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const client = baseUrl ? new HttpApiClient(baseUrl) : null
const prefix = (spaceId:string,sceneId:string) => `/api/v1/operations/spaces/${encodeURIComponent(spaceId)}/scenes/${encodeURIComponent(sceneId)}/hotspots`
const json = { 'Content-Type': 'application/json' }

export const spaceHotspotsAdmin = {
  async list(spaceId:string,sceneId:string):Promise<SpaceHotspotDto[]> { return client ? client.requestOrThrow<SpaceHotspotDto[]>(prefix(spaceId,sceneId)) : [] },
  async create(spaceId:string,sceneId:string,input:SpaceHotspotInputDto):Promise<SpaceHotspotDto> {
    if (!client) throw new Error('Operational mock mutation is not configured.')
    return client.requestOrThrow<SpaceHotspotDto>(prefix(spaceId,sceneId), { method:'POST', headers:json, body:JSON.stringify(input) })
  },
  async update(spaceId:string,sceneId:string,id:string,input:SpaceHotspotInputDto):Promise<SpaceHotspotDto> {
    if (!client) throw new Error('Operational mock mutation is not configured.')
    return client.requestOrThrow<SpaceHotspotDto>(`${prefix(spaceId,sceneId)}/${encodeURIComponent(id)}`, { method:'PUT', headers:json, body:JSON.stringify(input) })
  },
  async delete(spaceId:string,sceneId:string,id:string):Promise<void> {
    if (!client) return
    return client.requestOrThrow<void>(`${prefix(spaceId,sceneId)}/${encodeURIComponent(id)}`, { method:'DELETE' })
  },
}
