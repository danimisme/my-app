import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'

interface AppShellProps {
  username: string
  role: string
  children: React.ReactNode
}

export function AppShell({ username, role, children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Navbar username={username} role={role} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
