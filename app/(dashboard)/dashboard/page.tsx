'use client'

import { useRouter } from 'next/navigation'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { PlusCircle, ListFilter, ScrollText } from 'lucide-react'
import { useUser } from '@/providers/user-provider'
import { useGetTransactions } from '@/hooks/UseTransaction'
import { formatDateShort } from '@/lib/format'
import type { Transaction } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DisbursementStats } from '@/components/disbursement-stats'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const STATUS_COLORS = {
  SUCCESS: '#22C55E',
  PENDING: '#EAB308',
  FAILED: '#EF4444',
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

  const datasets = statuses.map(status => {
    const perDay = days.map(d => {
      const dayStr = d.toLocaleDateString('sv')
      const matched = txs.filter(
        t => t.status === status && new Date(t.created_at).toLocaleDateString('sv') === dayStr
      )
      return { count: matched.length, amount: matched.reduce((s, t) => s + t.amount, 0) }
    })

    return {
      label: status,
      data: perDay.map(d => d.count),
      amountData: perDay.map(d => d.amount),
      borderColor: STATUS_COLORS[status],
      backgroundColor: STATUS_COLORS[status] + '22',
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0,
      fill: false,
    }
  })

  return { labels, datasets }
}


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
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                      callbacks: {
                        label: ctx => {
                          const count  = ctx.parsed.y
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const amount = (ctx.dataset as any).amountData?.[ctx.dataIndex] as number ?? 0
                          const fmt    = new Intl.NumberFormat('id-ID').format(amount)
                          return `${ctx.dataset.label}: ${count} transaksi  |  Rp ${fmt}`
                        },
                      },
                    },
                  },
                  scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
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
