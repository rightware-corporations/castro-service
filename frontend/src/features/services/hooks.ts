import { useQuery } from '@tanstack/react-query'
import { useApi } from '../../app/providers/AppProviders'
import { mapServiceDto } from '../../api/contracts/mappers'
import type { Service } from '../../domain/models'

export function useServices() {
  const api = useApi()
  return useQuery({ queryKey: ['public', 'services'], queryFn: async () => { const result = await api.public.listServices(); return { ...result, items: result.items.map(mapServiceDto) } } })
}

export function useService(slug: string | undefined) {
  const api = useApi()
  return useQuery<Service | undefined>({ queryKey: ['public', 'service', slug], queryFn: async () => mapServiceDto(await api.public.getService(slug!)), enabled: Boolean(slug) })
}
