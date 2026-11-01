import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from './client'
import { queryKeys } from './queries'
import type { CreateTransferRequest, TransferResponse } from './types'

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransferRequest) =>
      apiFetch<TransferResponse>('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: async () => {
      // Invalidate customer, accounts, and transactions simultaneously
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.customer }),
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      ])
    },
  })
}
