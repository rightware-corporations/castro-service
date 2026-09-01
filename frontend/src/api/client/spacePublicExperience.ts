import { HttpApiClient } from './HttpApiClient'

export type PublicSpaceSceneDto = { id: string; panoramaUrl: string; title?: string | null; initialYaw: number; initialPitch: number; sortOrder: number }
export type PublicSpaceHotspotDto = { id: string; title: string; description?: string | null; yaw: number; pitch: number; type: string; targetSceneId?: string | null; resourceId?: string | null; resourceName?: string | null }

const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const client = baseUrl ? new HttpApiClient(baseUrl) : null
const prefix = (spaceId: string) => `/api/v1/spaces/${encodeURIComponent(spaceId)}`

export const spacePublicExperience = {
  async listScenes(spaceId: string): Promise<PublicSpaceSceneDto[]> {
    return client ? client.requestOrThrow<PublicSpaceSceneDto[]>(`${prefix(spaceId)}/scenes`) : []
  },
  async listHotspots(spaceId: string, sceneId: string): Promise<PublicSpaceHotspotDto[]> {
    return client ? client.requestOrThrow<PublicSpaceHotspotDto[]>(`${prefix(spaceId)}/scenes/${encodeURIComponent(sceneId)}/hotspots`) : []
  },
}
