import { useMutation } from '@tanstack/react-query'
import { useApi } from '../../app/providers/AppProviders'
import type { RequestRequestDto } from '../../api/contracts'

export function useCreateRequest() {
  const api = useApi()
  return useMutation({ mutationFn: (input: RequestRequestDto) => api.requests.create(input) })
}
