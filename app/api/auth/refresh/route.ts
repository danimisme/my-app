import { cookies } from 'next/headers'
import { verifyToken, signToken } from '@/lib/jwt'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (!refreshToken) {
    return Response.json({ error: 'Refresh token tidak ditemukan' }, { status: 401 })
  }

  const payload = await verifyToken(refreshToken)
  if (!payload) {
    return Response.json({ error: 'Refresh token tidak valid atau sudah kadaluarsa' }, { status: 401 })
  }

  const newAccessToken = await signToken({ username: payload.username, role: payload.role }, 15 * 60)
  const newRefreshToken = await signToken({ username: payload.username, role: payload.role }, 7 * 24 * 60 * 60)

  cookieStore.set('access_token', newAccessToken, {
    httpOnly: true,
    maxAge: 15 * 60,
    path: '/',
    sameSite: 'lax',
  })
  cookieStore.set('refresh_token', newRefreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
  })

  return Response.json({ success: true })
}
