import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'

function makeToken(payload: object): string {
  const b64url = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  const header = b64url({ alg: 'HS256', typ: 'JWT' })
  const body   = b64url(payload)
  return `${header}.${body}.fake-sig`
}

function clearAuthCookie() {
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
}

describe('useAuth', () => {
  afterEach(() => clearAuthCookie())

  it('JWT valid → return { username, role, isExpired: false }', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    document.cookie = `access_token=${makeToken({ username: 'john', role: 'admin', exp })}`

    const { result } = renderHook(() => useAuth())

    expect(result.current).toEqual({ username: 'john', role: 'admin', isExpired: false })
  })

  it('JWT expired → return { isExpired: true }', () => {
    const exp = Math.floor(Date.now() / 1000) - 3600
    document.cookie = `access_token=${makeToken({ username: 'john', role: 'admin', exp })}`

    const { result } = renderHook(() => useAuth())

    expect(result.current?.isExpired).toBe(true)
    expect(result.current?.username).toBe('john')
  })

  it('tanpa cookie → return null', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current).toBeNull()
  })
})
