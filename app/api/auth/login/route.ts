import { cookies } from 'next/headers'
import { signToken } from '@/lib/jwt'

const USERS: Record<string, { password: string; role: string }> = {
  superadmin: { password: 'superadmin123', role: 'superadmin' },
  admin:      { password: 'admin123',      role: 'admin' },
  operator:   { password: 'operator123',   role: 'operator' },
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))

  const user = USERS[body.username as string]
  if (!user || user.password !== body.password) {
    return Response.json({ error: 'Username atau password salah' }, { status: 401 })
  }

  const accessToken  = await signToken({ username: body.username, role: user.role }, 15 * 60)
  const refreshToken = await signToken({ username: body.username, role: user.role }, 7 * 24 * 60 * 60)

  const cookieStore = await cookies()
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    maxAge: 15 * 60,
    path: '/',
    sameSite: 'lax',
  })
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
  })

  return Response.json({ success: true, username: body.username, role: user.role })
}
