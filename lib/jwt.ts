import { SignJWT, jwtVerify, decodeJwt } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'mock-jwt-secret-key-do-not-use-in-production'
)

export interface TokenPayload {
  username: string
  role: string
  exp: number
}

export async function signToken(payload: Omit<TokenPayload, 'exp'>, expiresInSeconds: number): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds
  return new SignJWT({ ...payload, exp })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

export function decodePayload(token: string): TokenPayload | null {
  try {
    return decodeJwt(token) as unknown as TokenPayload
  } catch {
    return null
  }
}
