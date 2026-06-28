import { createColumnHelper } from '@tanstack/react-table'
import { ArrowUpDown, Eye, CheckCircle, XCircle } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/format'
import type { Transaction } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { StatusBadge } from './StatusBadge'

export interface TransactionColumnsOptions {
  canApprove: boolean
  onDetail:  (tx: Transaction) => void
  onApprove: (id: string) => void
  onReject:  (id: string) => void
}

const col = createColumnHelper<Transaction>()

export function getTransactionColumns({
  canApprove,
  onDetail,
  onApprove,
  onReject,
}: TransactionColumnsOptions) {
  return [
    col.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Pilih semua"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={v => row.toggleSelected(!!v)}
          aria-label="Pilih baris"
        />
      ),
    }),

    col.accessor('id', {
      header: 'ID',
      cell: info => (
        <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>
      ),
    }),

    col.accessor('sender_name', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-foreground"
          onClick={() => column.toggleSorting()}
        >
          Nama Pengirim <ArrowUpDown className="size-3" />
        </button>
      ),
      cell: info => <span className="font-medium">{info.getValue()}</span>,
    }),

    col.accessor('bank', {
      header: 'Bank',
      cell: info => <Badge variant="outline">{info.getValue()}</Badge>,
    }),

    col.accessor('amount', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-foreground"
          onClick={() => column.toggleSorting()}
        >
          Jumlah <ArrowUpDown className="size-3" />
        </button>
      ),
      cell: info => (
        <span className="font-medium tabular-nums">{formatRupiah(info.getValue())}</span>
      ),
    }),

    col.accessor('admin_fee', {
      header: 'Biaya Admin',
      cell: info => (
        <span className="tabular-nums text-muted-foreground">{formatRupiah(info.getValue())}</span>
      ),
    }),

    col.accessor('status', {
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />,
    }),

    col.accessor('created_at', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-foreground"
          onClick={() => column.toggleSorting()}
        >
          Tanggal <ArrowUpDown className="size-3" />
        </button>
      ),
      cell: info => (
        <span className="text-muted-foreground">{formatDate(info.getValue())}</span>
      ),
    }),

    col.display({
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const tx = row.original
        const isPending = tx.status === 'PENDING' || tx.status === 'APPROVED'

        return (
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDetail(tx)}
                >
                  <Eye />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Detail</TooltipContent>
            </Tooltip>

            {canApprove && isPending && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                      onClick={() => onApprove(tx.id)}
                    >
                      <CheckCircle />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Setujui</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onReject(tx.id)}
                    >
                      <XCircle />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tolak</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        )
      },
    }),
  ]
}
