'use client'

import { useMemo } from 'react'
import { ArrowUpRight, Banknote, CheckCircle2, Clock } from 'lucide-react'
import type { Transaction } from '@/lib/types'
import { formatRupiah } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// 'sv' locale gives YYYY-MM-DD in local time — avoids UTC/local mismatch
function localDateStr(date: Date) {
  return date.toLocaleDateString('sv')
}

interface DisbursementStatsProps {
  transactions: Transaction[]
  isLoading: boolean
}

export function DisbursementStats({ transactions, isLoading }: DisbursementStatsProps) {
  const stats = useMemo(() => {
    const todayStr = localDateStr(new Date())
    const monthStr = todayStr.slice(0, 7)

    const todayTxs = transactions.filter(t => localDateStr(new Date(t.created_at)) === todayStr)

    return {
      totalToday:   todayTxs.length,
      amountToday:  todayTxs.reduce((sum, t) => sum + t.amount, 0),
      pendingCount: transactions.filter(t => t.status === 'PENDING' || t.status === 'APPROVED').length,
      successMonth: transactions.filter(
        t => t.status === 'SUCCESS' && localDateStr(new Date(t.created_at)).startsWith(monthStr)
      ).length,
    }
  }, [transactions])

  const cards = [
    { title: 'Disbursement Hari Ini', value: `${stats.totalToday} Transaksi`,   icon: ArrowUpRight },
    { title: 'Total Amount Hari Ini', value: formatRupiah(stats.amountToday),    icon: Banknote },
    { title: 'Pending Approval',      value: `${stats.pendingCount} Transaksi`,  icon: Clock },
    { title: 'Sukses Bulan Ini',      value: `${stats.successMonth} Transaksi`,  icon: CheckCircle2 },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ title, value, icon: Icon }) => (
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
  )
}
