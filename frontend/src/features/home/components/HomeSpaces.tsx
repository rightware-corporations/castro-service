import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useSpacesPreview } from '../../spaces/hooks'
import { spacePublicExperience } from '../../../api/client/spacePublicExperience'
import type { Space } from '../../../domain/models'
import { EmptyState, ErrorState, LoadingState } from '../../../design-system/patterns/feedback-overlays'

export function HomeSpaces() {
  const query = useSpacesPreview()
  const [selectedId, setSelectedId] = useState<string>()
  const items = query.isError ? [] : query.data?.items ?? []
  const selected = items.find((space) => space.id === selectedId) ?? items[0]

  return <div className="home-spaces">
    {selected && <HomeSpaceMedia key={selected.id} space={selected} />}
    <div className="home-spaces__panel">
      <span className="home-entry__eyebrow">03 / ESPAÇOS</span>
      <h2 id="home-spaces-title">O lugar também faz parte da experiência.</h2>
      {query.isLoading ? <LoadingState label="A carregar espaços." /> : query.isError ? <ErrorState title="Não foi possível carregar os espaços." action={<button type="button" className="home-entry__cta" disabled={query.isFetching} onClick={() => void query.refetch()}>Tentar novamente</button>} /> : !selected ? <EmptyState title="Espaços em preparação">Os espaços surgirão aqui assim que forem publicados no sistema.</EmptyState> : <>
        <nav className="home-spaces__index" aria-label="Selecionar espaço">
          {items.map((space, index) => <button key={space.id} type="button" aria-pressed={selected.id === space.id} onClick={() => setSelectedId(space.id)}><span>{String(index + 1).padStart(2, '0')}</span>{space.name}</button>)}
        </nav>
        <div className="home-spaces__detail" aria-live="polite" aria-atomic="true">
          <h3>{selected.name}</h3>
          {selected.summary && <p>{selected.summary}</p>}
          {(selected.location || selected.capacityMax != null || selected.capacityMin != null) && <dl>
            {selected.location && <div><dt>Localização</dt><dd>{selected.location}</dd></div>}
            {selected.capacityMax != null ? <div><dt>Capacidade máxima</dt><dd>{selected.capacityMax} pessoas</dd></div> : selected.capacityMin != null ? <div><dt>Capacidade mínima</dt><dd>{selected.capacityMin} pessoas</dd></div> : null}
          </dl>}
          <Link className="home-entry__cta" to={`/espacos/${selected.slug}`}>Conhecer {selected.name}<ArrowUpRight size={18} aria-hidden="true" /></Link>
          <Link className="home-v2-link" to={`/espacos/${selected.slug}/explorar`}>Explorar o espaço <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      </>}
      <Link className="home-v2-link" to="/espacos">Ver todos os espaços <ArrowUpRight size={16} aria-hidden="true" /></Link>
    </div>
  </div>
}

function HomeSpaceMedia({ space }: { space: Space }) {
  const scenes = useQuery({ queryKey: ['public', 'spaces', space.id, 'scenes'], queryFn: () => spacePublicExperience.listScenes(space.id), staleTime: 5 * 60 * 1000 })
  const scene = scenes.isError ? undefined : scenes.data?.[0]
  const [failedUrl, setFailedUrl] = useState<string>()
  const available = scene && failedUrl !== scene.panoramaUrl
  return <div className="home-spaces__media">
    {available ? <img src={scene.panoramaUrl} alt={scene.title ? `${scene.title} — ${space.name}` : `Vista panorâmica de ${space.name}`} loading="lazy" onError={() => setFailedUrl(scene.panoramaUrl)} /> : <p>{scenes.isLoading ? 'A preparar pré-visualização' : scenes.isError || failedUrl ? 'Pré-visualização indisponível' : 'Imagem a publicar'}</p>}
  </div>
}
