import type { TransactionStatus } from '@/lib/types'
import type { SearchSelectItem } from '@/components/search-select'

export const STATUS_STYLE: Record<TransactionStatus, string> = {
  SUCCESS:  'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  PENDING:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  APPROVED: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  FAILED:   'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

export const STATUS_OPTIONS: SearchSelectItem<TransactionStatus | 'ALL'>[] = [
  { label: 'Semua Status', value: 'ALL' },
  { label: 'Success',      value: 'SUCCESS' },
  { label: 'Pending',      value: 'PENDING' },
  { label: 'Approved',     value: 'APPROVED' },
  { label: 'Failed',       value: 'FAILED' },
]
