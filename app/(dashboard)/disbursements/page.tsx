'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowUpRight, Banknote, CheckCircle2, Clock, PlusCircle, Search } from 'lucide-react'
import type { RowSelectionState } from '@tanstack/react-table'
import { useUser } from '@/providers/user-provider'
import { useGetTransactions, useUpdateTransaction } from '@/lib/api/hooks/transaction'
import type { Transaction, TransactionStatus } from '@/lib/types'
import { formatRupiah } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CustomTable } from '@/components/custom-table'
import { SearchSelect } from '@/components/search-select'
import { TransactionDetail } from './components/TransactionDetail'
import { getTransactionColumns } from './components/TransactionColumns'
import { STATUS_OPTIONS } from './components/StatusConfig'
import { ActionConfirmDialog } from './components/ActionConfirmDialog'
import { CreateDisbursementDialog } from './components/CreateDisbursementDialog'
import type { PendingAction } from './components/ActionConfirmDialog'

export default function DisbursementsPage() {
  const { role } = useUser()
  const searchParams = useSearchParams()

  const [globalFilter,    setGlobalFilter]    = useState('')
  const [rowSelection,    setRowSelection]    = useState<RowSelectionState>({})
  const [statusFilter,    setStatusFilter]    = useState<TransactionStatus | 'ALL'>(
    (searchParams.get('status') as TransactionStatus) ?? 'ALL'
  )
  const [detailTx,        setDetailTx]        = useState<Transaction | null>(null)
  const [pendingAction,   setPendingAction]   = useState<PendingAction | null>(null)
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
      { onSuccess: () => setPendingAction(null) }
    )
  }

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const monthStr = new Date().toISOString().slice(0, 7)
    const todayTxs = transactions.filter((t: Transaction) => t.created_at.startsWith(todayStr))
    return {
      totalToday:     todayTxs.length,
      amountToday:    todayTxs.reduce((sum: number, t: Transaction) => sum + t.amount, 0),
      pendingCount:   transactions.filter((t: Transaction) => t.status === 'PENDING' || t.status === 'APPROVED').length,
      successMonth:   transactions.filter((t: Transaction) => t.status === 'SUCCESS' && t.created_at.startsWith(monthStr)).length,
    }
  }, [transactions])

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
        onDetail:  tx => setDetailTx(tx),
        onApprove: id => setPendingAction({ id, type: 'approve' }),
        onReject:  id => setPendingAction({ id, type: 'reject' }),
      }),
    [role]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Disbursement</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Daftar seluruh transaksi disbursement
          </p>
        </div>
        {(role === 'operator' || role === 'admin' || role === 'superadmin') && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle />
            Buat Disbursement
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Disbursement Hari Ini', value: `${stats.totalToday} Transaksi`, icon: ArrowUpRight },
          { title: 'Total Amount Hari Ini', value: formatRupiah(stats.amountToday),  icon: Banknote },
          { title: 'Pending Approval',      value: `${stats.pendingCount} Transaksi`, icon: Clock },
          { title: 'Sukses Bulan Ini',      value: `${stats.successMonth} Transaksi`, icon: CheckCircle2 },
        ].map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                <Icon className="size-4 text-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading
                ? <Skeleton className="h-7 w-32" />
                : <p className="text-2xl font-bold tracking-tight">{value}</p>
              }
            </CardContent>
          </Card>
        ))}
      </div>

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
      </div>

      <CustomTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        pageSize={10}
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
