import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi, TRANSACTION_KEYS } from '@/lib/api/transactions'
import type { CreateTransactionPayload, UpdateTransactionPayload } from '@/lib/types'

export function useGetTransactions() {
  return useQuery({
    queryKey: TRANSACTION_KEYS.lists(),
    queryFn: transactionsApi.getAll,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => transactionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.all })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTransactionPayload }) =>
      transactionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.all })
    },
  })
}
