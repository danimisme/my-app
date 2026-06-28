import { cn } from '@/lib/utils'
import { formatRupiah, formatDate } from '@/lib/format'
import type { Transaction, TransactionStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { STATUS_STYLE } from './StatusConfig'

interface TransactionDetailProps {
  tx: Transaction | null
  open: boolean
  onClose: () => void
}

export function TransactionDetail({ tx, open, onClose }: TransactionDetailProps) {
  if (!tx) return null

  const rows: [string, string][] = [
    ['ID Transaksi',  tx.id],
    ['Nama Pengirim', tx.sender_name],
    ['No. Rekening',  tx.account_number],
    ['Bank',          tx.bank],
    ['Jumlah',        formatRupiah(tx.amount)],
    ['Biaya Admin',   formatRupiah(tx.admin_fee)],
    ['Status',        tx.status],
    ['Catatan',       tx.note || '-'],
    ['Tanggal',       formatDate(tx.created_at)],
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium text-foreground break-all">
                {label === 'Status' ? (
                  <Badge className={cn('h-auto px-2 py-0.5', STATUS_STYLE[value as TransactionStatus])}>
                    {value}
                  </Badge>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  )
}
