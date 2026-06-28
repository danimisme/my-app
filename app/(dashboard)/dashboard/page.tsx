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
import { PlusCircle, ListFilter, ScrollText } from 'lucide-react'
import { useUser } from '@/providers/user-provider'
import { useGetTransactions } from '@/lib/api/hooks/transaction'
import { formatDateShort } from '@/lib/format'
import type { Transaction } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DisbursementStats } from '@/components/disbursement-stats'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { role } = useUser()
  const router = useRouter()

  const { data: transactions = [], isLoading } = useGetTransactions()

  const chartData = buildChartData(transactions)

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
          <Button onClick={() => router.push('/disbursements')}>
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
      <DisbursementStats transactions={transactions} isLoading={isLoading} />

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
