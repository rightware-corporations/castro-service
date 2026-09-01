import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../app/providers/AppProviders'
import { mapSpaceDto } from '../../api/contracts/mappers'

export function useSpaces() {
  const api = useApi()
  return useQuery({
    queryKey: ['public', 'spaces'],
    queryFn: async () => {
      const result = await api.public.listSpaces()
      return { ...result, items: result.items.map(mapSpaceDto) }
    },
  })
}

export function useSpacesPreview() {
  const api = useApi()
  return useQuery({
    queryKey: ['public', 'spaces-preview'],
    queryFn: async () => {
      const result = await api.public.listSpaces()
      return { ...result, items: result.items.map(mapSpaceDto) }
    },
  })
}

export function useSpace(slug?: string) {
  const api = useApi()
  return useQuery({
    queryKey: ['public', 'space', slug],
    queryFn: async () => mapSpaceDto(await api.public.getSpace(slug!)),
    enabled: Boolean(slug),
    retry: false,
  })
}
