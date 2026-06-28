'use client'

import { decodePayload } from '@/lib/jwt'

export interface AuthState {
  username: string
  role: string
  isExpired: boolean
}

export function parseAuthToken(token: string | null | undefined): AuthState | null {
  if (!token) return null
  const payload = decodePayload(token)
  if (!payload) return null

  const now = Math.floor(Date.now() / 1000)
  return {
    username: payload.username,
    role: payload.role,
    isExpired: payload.exp < now,
  }
}

export function useAuth(): AuthState | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('access_token='))

  const token = match ? match.slice('access_token='.length) : null
  return parseAuthToken(token)
}
