import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decodePayload } from '@/lib/jwt'
import { AppShell } from '@/components/app-shell'
import { LayoutDashboard, Users, Activity } from 'lucide-react'

const STATS = [
  { label: 'Total Users',    value: '128',  icon: Users,           trend: '+12 bulan ini' },
  { label: 'Active Sessions',value: '24',   icon: Activity,        trend: 'Saat ini online' },
  { label: 'Pages Visited',  value: '1.4k', icon: LayoutDashboard, trend: '+8% minggu ini' },
]

export default async function Home() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) redirect('/auth/login')

  const payload = decodePayload(accessToken)
  const username = payload?.username ?? ''
  const role = payload?.role ?? ''

  return (
    <AppShell username={username} role={role}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Selamat datang, {username}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Berikut ringkasan aktivitas aplikasi Anda.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {STATS.map(({ label, value, icon: Icon, trend }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                  <Icon className="size-4 text-foreground" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
