'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverTrigger,
} from '@/components/ui/popover'

const ROLE_STYLES: Record<string, string> = {
  superadmin: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  operator: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
}

interface NavbarProps {
  username: string
  role: string
}

export function Navbar({ username, role }: NavbarProps) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const initials = username.slice(0, 2).toUpperCase()
  const roleBadge = ROLE_STYLES[role] ?? 'bg-muted text-muted-foreground'

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      {/* Kiri: trigger collapse sidebar */}
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm text-muted-foreground">Dashboard</span>
      </div>

      {/* Kanan: user popover */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted">
            <Avatar size="lg">
              <img src="/nadin-face.jpeg" alt="Avatar" className='w-full h-full rounded-full' />
              {/* <AvatarFallback>{initials}</AvatarFallback> */}
            </Avatar>
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-medium text-foreground capitalize">{username}</span>
              <span className={cn('mt-0.5 rounded px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide', roleBadge)}>
                {role}
              </span>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-80">
          {/* User info */}
          <div className="flex items-center gap-3">
            <Avatar className='h-16 w-16'>
              <img src="/nadin-amizah.jpeg" alt="Avatar" className='w-full h-full rounded-full' />
            </Avatar>
            <PopoverHeader>
              <PopoverTitle className='capitalize'>{username}</PopoverTitle>
              <PopoverDescription>
                <span className={cn('inline-block rounded px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide', roleBadge)}>
                  {role}
                </span>
              </PopoverDescription>
            </PopoverHeader>
          </div>

          <Separator />

          {/* Logout */}
          <Button
            variant="destructive"
            size="sm"
            className="w-full justify-start"
            disabled={loggingOut}
            onClick={handleLogout}
          >
            <LogOut />
            {loggingOut ? 'Keluar…' : 'Keluar'}
          </Button>
        </PopoverContent>
      </Popover>
    </header>
  )
}
