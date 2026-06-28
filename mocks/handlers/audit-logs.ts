import { http, HttpResponse } from 'msw'
import { MOCK_AUDIT_LOGS } from '@/mocks/data/audit-logs'

export const auditLogHandlers = [
  http.get('/api/audit-logs', () => {
    const logs = [...MOCK_AUDIT_LOGS].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    return HttpResponse.json(logs)
  }),
]
