'use client'

import { useState, useMemo } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { useRouter, useSearchParams } from 'next/navigation'
import { Download, Layers, PlusCircle, RotateCcw, Search } from 'lucide-react'
import type { RowSelectionState } from '@tanstack/react-table'
import { useUser } from '@/providers/user-provider'
import { useGetTransactions, useUpdateTransaction } from '@/hooks/UseTransaction'
import type { Transaction, TransactionStatus } from '@/models/Transaction'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DisbursementStats } from '@/components/disbursement-stats'
import { CustomTable } from '@/components/custom-table'
import { SearchSelect } from '@/components/search-select'
import { TransactionDetail } from './components/TransactionDetail'
import { getTransactionColumns } from './components/TransactionColumns'
import { STATUS_OPTIONS } from './components/StatusConfig'
import { ActionConfirmDialog } from './components/ActionConfirmDialog'
import { toast } from 'sonner'
import { CreateDisbursementDialog } from './components/CreateDisbursementDialog'
import type { PendingAction } from './components/ActionConfirmDialog'

async function exportCSV(rows: Transaction[]): Promise<void> {
  const toastId = toast.loading('Menyiapkan file CSV...')
  try {
    const HEADERS = ['ID', 'Nama Pengirim', 'Bank', 'Nomor Rekening', 'Jumlah', 'Biaya Admin', 'Status', 'Tanggal']
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`

    const lines = [
      HEADERS.join(','),
      ...rows.map(t =>
        [t.id, t.sender_name, t.bank, t.account_number, t.amount, t.admin_fee, t.status, t.created_at]
          .map(escape)
          .join(',')
      ),
    ]

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `disbursements-export-${new Date().toLocaleDateString('sv')}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success(`${rows.length} transaksi berhasil diekspor`, { id: toastId })
  } catch {
    toast.error('Gagal mengekspor CSV', { id: toastId })
  }
}


export default function DisbursementsPage() {
  const { role } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [globalFilter, setGlobalFilter] = useState('')
  const debouncedFilter = useDebounce(globalFilter, 500)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>(
    (searchParams.get('status') as TransactionStatus) ?? 'ALL'
  )
  const [detailTx, setDetailTx] = useState<Transaction | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { data: transactions = [], isLoading } = useGetTransactions()
  const updateTransaction = useUpdateTransaction()

  function handleConfirm() {
    if (!pendingAction) return
    updateTransaction.mutate(
      {
        id: pendingAction.id,
        payload: { status: pendingAction.type === 'approve' ? 'SUCCESS' : 'FAILED' },
      },
      { onSuccess: () => {
        setPendingAction(null)
        toast.success(`Transaksi berhasil ${pendingAction.type === 'approve' ? 'disetujui' : 'ditolak'}`)
      }, onError: () => {
        setPendingAction(null)
        toast.error(`Gagal ${pendingAction.type === 'approve' ? 'menyetujui' : 'menolak'} transaksi`)
      } }
    )
  }

  const filteredData = useMemo(
    () =>
      statusFilter === 'ALL'
        ? transactions
        : transactions.filter((t: Transaction) => t.status === statusFilter),
    [transactions, statusFilter]
  )

  const columns = useMemo(
    () =>
      getTransactionColumns({
        canApprove: role === 'admin' || role === 'superadmin',
        onDetail: tx => setDetailTx(tx),
        onApprove: id => setPendingAction({ id, type: 'approve' }),
        onReject: id => setPendingAction({ id, type: 'reject' }),
      }),
    [role]
  )

  // Rows selected (keyed by transaction id via getRowId)
  const selectedTransactions = useMemo(
    () => filteredData.filter(t => rowSelection[t.id]),
    [filteredData, rowSelection]
  )
  const hasSelection = selectedTransactions.length > 0

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Disbursement</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Daftar seluruh transaksi disbursement
          </p>
        </div>
        {(role === 'operator' || role === 'admin' || role === 'superadmin') && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/disbursements/batch')}>
              <Layers />
              Batch
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusCircle />
              Buat Disbursement
            </Button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <DisbursementStats transactions={transactions} isLoading={isLoading} />

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Cari nama / ID..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>

        <SearchSelect
          items={STATUS_OPTIONS}
          value={statusFilter}
          onSelect={setStatusFilter}
          placeholder="Filter Status"
          searchPlaceholder="Cari status..."
          className="w-44"
        />

        {(globalFilter || statusFilter !== 'ALL') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setGlobalFilter(''); setStatusFilter('ALL') }}
          >
            <RotateCcw />
            Reset
          </Button>
        )}

        {/* Export — only active when rows selected */}
        <Button
          variant="outline"
          size="sm"
          disabled={!hasSelection}
          onClick={() => exportCSV(selectedTransactions)}
          className="ml-auto"
        >
          <Download />
          Export CSV
          {hasSelection && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">
              {selectedTransactions.length}
            </span>
          )}
        </Button>
      </div>

      <CustomTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        globalFilter={debouncedFilter}
        onGlobalFilterChange={setGlobalFilter}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={tx => tx.id}
        pageSizeOptions={[10, 20, 30, 50, 100]}
        initialSorting={[{ id: 'created_at', desc: true }]}
        emptyMessage="Tidak ada data transaksi"
      />

      <TransactionDetail
        tx={detailTx}
        open={!!detailTx}
        onClose={() => setDetailTx(null)}
      />

      <ActionConfirmDialog
        pending={pendingAction}
        isLoading={updateTransaction.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />

      <CreateDisbursementDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </div>
  )
}
