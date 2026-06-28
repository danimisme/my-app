import { cn } from '@/lib/utils'
import type { TransactionStatus } from '@/lib/types'
import { STATUS_STYLE } from './StatusConfig'

const STATUS_LABEL: Record<TransactionStatus, string> = {
  PENDING:  'Menunggu',
  APPROVED: 'Disetujui',
  SUCCESS:  'Sukses',
  FAILED:   'Gagal',
}

interface StatusBadgeProps {
  status: TransactionStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      data-testid="status-badge"
      data-status={status}
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        STATUS_STYLE[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
