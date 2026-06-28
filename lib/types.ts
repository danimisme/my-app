export type TransactionStatus = 'PENDING' | 'APPROVED' | 'SUCCESS' | 'FAILED'

export interface Transaction {
  id: string
  sender_name: string
  account_number: string
  bank: string
  amount: number
  admin_fee: number
  status: TransactionStatus
  note: string
  created_at: string
}

export type CreateTransactionPayload = Omit<Transaction, 'id'> & { created_at?: string }
export type UpdateTransactionPayload = Partial<Omit<Transaction, 'id' | 'created_at'>>
