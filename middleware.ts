import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, signToken, decodePayload } from '@/lib/jwt'

const PUBLIC_PATHS = ['/auth/login', '/api/auth/login', '/api/auth/refresh', '/api/auth/logout']

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p))
}

async function buildRefreshedResponse(
  base: NextResponse,
  username: string,
  role: string
): Promise<NextResponse> {
  const newAccessToken = await signToken({ username, role }, 15 * 60)
  const newRefreshToken = await signToken({ username, role }, 7 * 24 * 60 * 60)

  base.cookies.set('access_token', newAccessToken, {
    httpOnly: true,
    maxAge: 15 * 60,
    path: '/',
    sameSite: 'lax',
  })
  base.cookies.set('refresh_token', newRefreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
  })
  return base
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  if (isPublic(pathname)) {
    // Sudah login → redirect dari halaman login ke home
    if (pathname === '/auth/login' && accessToken) {
      const payload = await verifyToken(accessToken)
      if (payload) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      // Access token invalid, cek refresh token
      if (refreshToken) {
        const rPayload = await verifyToken(refreshToken)
        if (rPayload) {
          return NextResponse.redirect(new URL('/', request.url))
        }
      }
    }
    return NextResponse.next()
  }

  // === Protected route ===

  if (accessToken) {
    const payload = await verifyToken(accessToken)
    if (payload) {
      // Silent refresh: jika kurang dari 2 menit lagi habis
      const decoded = decodePayload(accessToken)
      const now = Math.floor(Date.now() / 1000)
      if (decoded && decoded.exp - now < 120 && refreshToken) {
        const rPayload = await verifyToken(refreshToken)
        if (rPayload) {
          return buildRefreshedResponse(NextResponse.next(), rPayload.username, rPayload.role)
        }
      }
      return NextResponse.next()
    }
  }

  // Access token tidak ada/kadaluarsa → coba pakai refresh token
  if (refreshToken) {
    const rPayload = await verifyToken(refreshToken)
    if (rPayload) {
      return buildRefreshedResponse(NextResponse.next(), rPayload.username, rPayload.role)
    }
  }

  // Tidak ada token yang valid → redirect ke login
  return NextResponse.redirect(new URL('/auth/login', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
