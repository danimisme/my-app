export type AuditAction = 'created' | 'status_changed' | 'deleted'

export type UserRole = 'operator' | 'admin' | 'superadmin'

export interface AuditLog {
  id: string
  entity_type: string
  entity_id: string
  action: AuditAction
  actor_username: string
  actor_role: UserRole
  changes: {
    before: Record<string, unknown> | null
    after: Record<string, unknown> | null
  }
  ip_address: string
  created_at: string
}

export interface AuditLogFilters {
  action?: AuditAction | 'ALL'
  actor?: string
  date_from?: string
  date_to?: string
}
