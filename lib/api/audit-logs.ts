import axios from 'axios'
import type { AuditLog } from '@/models/AuditLog'

// Separate client hitting local (MSW-intercepted) endpoints
const localClient = axios.create({ baseURL: '/' })

export const auditLogsApi = {
  getAll: async (): Promise<AuditLog[]> => {
    const { data } = await localClient.get<AuditLog[]>('/api/audit-logs')
    return data
  },
}

export const AUDIT_LOG_KEYS = {
  all:   ['audit-logs'] as const,
  lists: () => [...AUDIT_LOG_KEYS.all, 'list'] as const,
}
