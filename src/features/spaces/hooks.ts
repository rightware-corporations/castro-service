import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../app/providers/AppProviders'
import { mapSpaceDto } from '../../api/contracts/mappers'

export function useSpacesPreview() {
  const api = useApi()
  return useQuery({ queryKey: ['public', 'spaces-preview'], queryFn: async () => { const result = await api.public.listSpaces(); return { ...result, items: result.items.map(mapSpaceDto) } } })
}
