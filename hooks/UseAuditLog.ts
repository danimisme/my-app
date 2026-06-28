import { useQuery } from '@tanstack/react-query'
import { auditLogsApi, AUDIT_LOG_KEYS } from '@/lib/api/audit-logs'

export function useGetAuditLogs() {
  return useQuery({
    queryKey: AUDIT_LOG_KEYS.lists(),
    queryFn:  auditLogsApi.getAll,
  })
}
