import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decodePayload } from '@/lib/jwt'
import { AppShell } from '@/components/app-shell'
import { UserProvider } from '@/providers/user-provider'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect('/auth/login')

  const payload = decodePayload(token)
  const username = payload?.username ?? ''
  const role = payload?.role ?? ''

  return (
    <UserProvider value={{ username, role }}>
      <AppShell username={username} role={role}>
        {children}
      </AppShell>
    </UserProvider>
  )
}
