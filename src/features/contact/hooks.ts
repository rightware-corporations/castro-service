import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useApi } from '../../app/providers/AppProviders'
import { createIdempotencyKey } from '../../api/client/HttpApiClient'
import type { RequestRequestDto } from '../../api/contracts'

export function useCreateRequest() {
  const api = useApi()
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null)

  return useMutation({
    mutationFn: (input: RequestRequestDto) => {
      const fingerprint = JSON.stringify(input)
      if (!attempt.current || attempt.current.fingerprint !== fingerprint) {
        attempt.current = { fingerprint, key: createIdempotencyKey() }
      }
      return api.requests.create(input, { idempotencyKey: attempt.current.key })
    },
    onSuccess: () => { attempt.current = null },
  })
}
