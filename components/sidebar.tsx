'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, ScrollText, Shield } from 'lucide-react'
import { useUser } from '@/providers/user-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: null },
  { href: '/disbursements', label: 'Disbursement', icon: ArrowLeftRight, roles: null },
  { href: '/audit-logs', label: 'Audit Log', icon: ScrollText, roles: ['superadmin'] },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { role } = useUser()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary">
            <Shield className="size-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight">MyApp</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.filter(item => !item.roles || item.roles.includes(role)).map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname === href || pathname.startsWith(href + '/')}>
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="px-2 py-1 text-xs text-muted-foreground">v1.0.0</p>
      </SidebarFooter>
    </Sidebar>
  )
}
