import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Space } from '../../../domain/models'
import { spacePublicExperience } from '../../../api/client/spacePublicExperience'

export function SpaceMediaPreview({ space, index, variant }: { space: Space; index?: number; variant: 'catalog' | 'detail' | 'config' }) {
  const scenes = useQuery({
    queryKey: ['public', 'spaces', space.id, 'scenes'],
    queryFn: () => spacePublicExperience.listScenes(space.id),
    enabled: Boolean(space.id),
    staleTime: 5 * 60 * 1000,
  })
  const [failedUrl, setFailedUrl] = useState('')
  const scene = !scenes.isLoading && !scenes.isError ? scenes.data?.[0] : undefined
  const mediaReady = Boolean(scene && failedUrl !== scene.panoramaUrl)
  const prefix = variant === 'detail' ? 'space-detail-v2' : variant === 'config' ? 'space-config-v2' : 'space-v2-card'
  const sceneCount = scenes.data?.length ?? 0
  const status = scenes.isLoading
    ? 'A preparar pré-visualização'
    : scenes.isError || Boolean(scene && !mediaReady)
      ? 'Pré-visualização indisponível'
      : scene
        ? `${sceneCount} ${sceneCount === 1 ? 'cena publicada' : 'cenas publicadas'}`
        : 'Imagem a publicar'
  const label = variant === 'detail' ? 'EXPERIÊNCIA ESPACIAL' : variant === 'config' ? 'PRÉ-VISUALIZAÇÃO' : `ESPAÇO ${String((index ?? 0) + 1).padStart(2, '0')}`

  return <div className={`${prefix}__visual ${mediaReady ? 'has-media' : 'is-empty'}`} aria-label={`Pré-visualização de ${space.name}`}>
    {scene && mediaReady ? <img onError={() => setFailedUrl(scene.panoramaUrl)} className={`${prefix}__image`} src={scene.panoramaUrl} alt={scene.title ? `${scene.title} — ${space.name}` : `Vista panorâmica de ${space.name}`} loading={variant === 'detail' ? 'eager' : 'lazy'} draggable={false} /> : <div className={`${prefix}__media-empty`} aria-hidden="true" />}
    <div className={`${prefix}__media-overlay`}><span>{label}</span><small>{status}</small></div>
  </div>
}
