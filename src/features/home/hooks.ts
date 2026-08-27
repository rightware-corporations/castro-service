import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../app/providers/AppProviders'
import { mapPublicConfigDto } from '../../api/contracts/mappers'

export function usePublicConfig() {
  const api = useApi()
  return useQuery({ queryKey: ['public', 'config'], queryFn: async () => mapPublicConfigDto(await api.public.getConfig()) })
}
