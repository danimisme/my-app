import apiClient from '@/lib/axios'
import type { Transaction, CreateTransactionPayload, UpdateTransactionPayload } from '@/models/Transaction'

export const transactionsApi = {
  getAll: async (): Promise<Transaction[]> => {
    const { data } = await apiClient.get<Transaction[]>('/transactions')
    return data 
  },

  create: async (payload: CreateTransactionPayload): Promise<Transaction> => {
    const { data } = await apiClient.post<Transaction>('/transactions', payload)
    return data
  },

  update: async (id: string, payload: UpdateTransactionPayload): Promise<Transaction> => {
    const { data } = await apiClient.put<Transaction>(`/transactions/${id}`, payload)
    return data
  },
}

export const TRANSACTION_KEYS = {
  all: ['transactions'] as const,
  lists: () => [...TRANSACTION_KEYS.all, 'list'] as const,
}
