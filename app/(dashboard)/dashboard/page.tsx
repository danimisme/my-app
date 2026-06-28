'use client'

import { useRouter } from 'next/navigation'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import {
  ArrowUpRight,
  Banknote,
  Clock,
  CheckCircle2,
  PlusCircle,
  ListFilter,
  ScrollText,
} from 'lucide-react'
import { useUser } from '@/providers/user-provider'
import { useGetTransactions } from '@/lib/api/hooks/transaction'
import { formatRupiah, formatDateShort } from '@/lib/format'
import type { Transaction } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// ── Derived stats ─────────────────────────────────────────────────────────────

function getStats(txs: Transaction[]) {
  const todayStr = new Date().toISOString().split('T')[0]
  const monthStr = new Date().toISOString().slice(0, 7)

  const todayTxs = txs.filter(t => t.created_at.startsWith(todayStr))

  return {
    totalDisbursementToday: todayTxs.length,
    totalAmountToday: todayTxs.reduce((sum, t) => sum + t.amount, 0),
    pendingApproval: txs.filter(t => t.status === 'PENDING' || t.status === 'APPROVED').length,
    successThisMonth: txs.filter(t => t.status === 'SUCCESS' && t.created_at.startsWith(monthStr)).length,
  }
}

// ── Chart data (7 days) ───────────────────────────────────────────────────────

const STATUS_COLORS = {
  SUCCESS: '#22C55E',
  PENDING: '#EAB308',
  FAILED:  '#EF4444',
  APPROVED: '#3B82F6',
}

function buildChartData(txs: Transaction[]) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const labels = days.map(d => formatDateShort(d.toISOString()))
  const statuses = ['SUCCESS', 'PENDING', 'APPROVED', 'FAILED'] as const

  const datasets = statuses.map(status => ({
    label: status,
    data: days.map(d => {
      const dayStr = d.toISOString().split('T')[0]
      return txs.filter(t => t.status === status && t.created_at.startsWith(dayStr)).length
    }),
    backgroundColor: STATUS_COLORS[status],
    borderRadius: 4,
  }))

  return { labels, datasets }
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  loading,
}: {
  title: string
  value: string
  sub?: string
  icon: React.ElementType
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex size-8 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4 text-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { role } = useUser()
  const router = useRouter()

  const { data: transactions = [], isLoading } = useGetTransactions()

  const stats = getStats(transactions)
  const chartData = buildChartData(transactions)

  const STAT_CARDS = [
    {
      title: 'Disbursement Hari Ini',
      value: isLoading ? '-' : `${stats.totalDisbursementToday} Transaksi`,
      sub: 'Total transaksi hari ini',
      icon: ArrowUpRight,
    },
    {
      title: 'Total Amount Hari Ini',
      value: isLoading ? '-' : formatRupiah(stats.totalAmountToday),
      sub: 'Jumlah nominal hari ini',
      icon: Banknote,
    },
    {
      title: 'Pending Approval',
      value: isLoading ? '-' : `${stats.pendingApproval} Transaksi`,
      sub: 'Menunggu persetujuan',
      icon: Clock,
    },
    {
      title: 'Sukses Bulan Ini',
      value: isLoading ? '-' : `${stats.successThisMonth} Transaksi`,
      sub: 'Berhasil bulan ini',
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Ringkasan aktivitas disbursement
          </p>
        </div>

        {/* Quick Actions */}
        {role === 'operator' && (
          <Button onClick={() => router.push('/disbursements/new')}>
            <PlusCircle />
            Buat Disbursement
          </Button>
        )}
        {role === 'admin' && (
          <Button onClick={() => router.push('/disbursements?status=PENDING')}>
            <ListFilter />
            Pending Approval
          </Button>
        )}
        {role === 'superadmin' && (
          <Button onClick={() => router.push('/audit-logs')}>
            <ScrollText />
            Audit Log
          </Button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map(card => (
          <StatCard key={card.title} {...card} loading={isLoading} />
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Disbursement 7 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <div className="h-72">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                  },
                  scales: {
                    x: { stacked: true, grid: { display: false } },
                    y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } },
                  },
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
