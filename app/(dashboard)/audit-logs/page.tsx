'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createColumnHelper } from '@tanstack/react-table'
import { RotateCcw, ShieldAlert } from 'lucide-react'
import { useUser } from '@/providers/user-provider'
import { useGetAuditLogs } from '@/hooks/UseAuditLog'
import type { AuditAction, AuditLog, UserRole } from '@/models/AuditLog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DateRangePicker, type DateRange } from '@/components/ui/date-range-picker'
import { SearchSelect } from '@/components/search-select'
import { CustomTable } from '@/components/custom-table'

const ACTION_OPTIONS = [
  { value: 'ALL',label: 'Semua Aksi' },
  { value: 'created',label: 'Created' },
  { value: 'status_changed',label: 'Status Changed' },
  { value: 'deleted',label: 'Deleted' },
]

const ACTION_BADGE: Record<AuditAction, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  created: { label: 'created', variant: 'default' },
  status_changed: { label: 'status_changed', variant: 'secondary' },
  deleted: { label: 'deleted', variant: 'destructive' },
}

const ROLE_BADGE: Record<UserRole, { label: string; className: string }> = {
  operator: { label: 'operator', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  admin: { label: 'admin', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  superadmin: { label: 'superadmin', className: 'bg-purple-100 text-purple-700 border-purple-200' },
}


function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function applyFilters(
  logs: AuditLog[],
  action: AuditAction | 'ALL',
  actor: string,
  dateFrom: string,
  dateTo: string,
): AuditLog[] {
  return logs.filter(log => {
    if (action !== 'ALL' && log.action !== action) return false
    if (actor && !log.actor_username.toLowerCase().includes(actor.toLowerCase())) return false
    if (dateFrom && new Date(log.created_at).getTime() < new Date(dateFrom).setHours(0, 0, 0, 0)) return false
    if (dateTo  && new Date(log.created_at).getTime() > new Date(dateTo).setHours(23, 59, 59, 999)) return false
    return true
  })
}

function DiffCell({
  before,
  after,
}: {
  before: Record<string, unknown> | null
  after:  Record<string, unknown> | null
}) {
  if (!before && after) {
    return (
      <span className="text-xs text-muted-foreground">
        → <span className="font-medium text-foreground">{String(after.status ?? '—')}</span>
      </span>
    )
  }
  if (before && !after) {
    return (
      <span className="text-xs">
        <span className="text-destructive line-through">{String(before.status ?? '—')}</span>
        {' → dihapus'}
      </span>
    )
  }
  if (before && after) {
    const keys  = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))
    const diffs = keys.filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k]))
    if (diffs.length === 0) return <span className="text-xs text-muted-foreground">—</span>
    return (
      <div className="flex flex-col gap-0.5">
        {diffs.map(k => (
          <span key={k} className="text-xs">
            <span className="text-destructive">{String(before[k])}</span>
            {' → '}
            <span className="font-medium text-emerald-600">{String(after[k])}</span>
          </span>
        ))}
      </div>
    )
  }
  return <span className="text-xs text-muted-foreground">—</span>
}


const col = createColumnHelper<AuditLog>()

function useAuditLogColumns(onEntityClick: (entityId: string) => void) {
  return useMemo(() => [
    col.accessor('id', {
      header: 'Log ID',
      cell: info => (
        <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>
      ),
    }),
    col.display({
      id: 'entity',
      header: 'Entitas',
      cell: ({ row }) => (
        <button
          onClick={() => onEntityClick(row.original.entity_id)}
          className="text-xs font-medium text-primary hover:underline underline-offset-2"
        >
          {row.original.entity_type}#{row.original.entity_id}
        </button>
      ),
    }),
    col.accessor('action', {
      header: 'Aksi',
      cell: info => {
        const meta = ACTION_BADGE[info.getValue()]
        return (
          <Badge variant={meta.variant} className="text-[10px] font-mono">
            {meta.label}
          </Badge>
        )
      },
    }),
    col.display({
      id: 'actor',
      header: 'Aktor',
      cell: ({ row }) => {
        const roleMeta = ROLE_BADGE[row.original.actor_role]
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium">{row.original.actor_username}</span>
            <span className={`inline-flex w-fit items-center rounded border px-1.5 py-0 text-[10px] font-medium ${roleMeta.className}`}>
              {roleMeta.label}
            </span>
          </div>
        )
      },
    }),
    col.display({
      id: 'changes',
      header: 'Perubahan',
      cell: ({ row }) => (
        <DiffCell
          before={row.original.changes.before}
          after={row.original.changes.after}
        />
      ),
    }),
    col.accessor('ip_address', {
      header: 'IP Address',
      cell: info => (
        <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>
      ),
    }),
    col.accessor('created_at', {
      header: 'Waktu',
      cell: info => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDateTime(info.getValue())}
        </span>
      ),
    }),
  ], [onEntityClick])
}


export default function AuditLogsPage() {
  const { role } = useUser()
  const router   = useRouter()

  const [actionFilter, setActionFilter] = useState<AuditAction | 'ALL'>('ALL')
  const [actorFilter,  setActorFilter]  = useState('')
  const [dateRange,    setDateRange]    = useState<DateRange | undefined>()

  const { data: allLogs = [], isLoading } = useGetAuditLogs()

  const filteredLogs = useMemo(
    () => applyFilters(
      allLogs,
      actionFilter,
      actorFilter,
      dateRange?.from ? dateRange.from.toLocaleDateString('sv') : '',
      dateRange?.to   ? dateRange.to.toLocaleDateString('sv')   : '',
    ),
    [allLogs, actionFilter, actorFilter, dateRange]
  )

  const columns = useAuditLogColumns((entityId) => {
    router.push(`/disbursements?id=${entityId}`)
  })

  const hasFilter = actionFilter !== 'ALL' || !!actorFilter || !!dateRange

  function resetFilters() {
    setActionFilter('ALL')
    setActorFilter('')
    setDateRange(undefined)
  }

  if (role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <ShieldAlert className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Anda tidak memiliki akses ke halaman ini.</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>Kembali</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Riwayat seluruh aktivitas sistem
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <SearchSelect
          items={ACTION_OPTIONS}
          value={actionFilter}
          onSelect={v => setActionFilter(v as AuditAction | 'ALL')}
          placeholder="Filter Aksi"
          searchPlaceholder="Cari aksi..."
          className="w-44"
        />

        <Input
          placeholder="Cari aktor..."
          value={actorFilter}
          onChange={e => setActorFilter(e.target.value)}
          className="w-44"
        />

        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          placeholder="Filter tanggal"
          className="w-56"
        />

        {hasFilter && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw />
            Reset
          </Button>
        )}
      </div>

      <CustomTable
        columns={columns}
        data={filteredLogs}
        isLoading={isLoading}
        pageSizeOptions={[10, 20, 30, 50, 100]}
        initialSorting={[{ id: 'created_at', desc: true }]}
        emptyMessage="Tidak ada log ditemukan"
      />
    </div>
  )
}
