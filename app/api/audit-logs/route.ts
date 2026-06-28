import { NextResponse } from 'next/server'
import { MOCK_AUDIT_LOGS } from '@/mocks/data/audit-logs'

export function GET() {
  const logs = [...MOCK_AUDIT_LOGS].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  return NextResponse.json(logs)
}
