import { AuthenticatedRequest } from '../types';
import { db } from '../db/store';
import { AuditLogEntry } from '../../src/types';

export interface AuditLogOptions {
  action: string;
  module: string;
  recordName: string;
  previousValue?: string;
  newValue?: string;
}

/**
 * Log an immutable audit event to the append-only audit trail
 */
export function logAuditEvent(req: AuthenticatedRequest, options: AuditLogOptions): AuditLogEntry {
  const orgId = req.user?.orgId || req.orgId || 'org-acro';
  const userName = req.user?.name || 'System Actor';
  const userRole = req.user?.role || 'Admin';
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  const entry: AuditLogEntry = {
    id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    orgId,
    timestamp: new Date().toISOString(),
    userName,
    userRole,
    action: options.action,
    module: options.module,
    recordName: options.recordName,
    previousValue: options.previousValue,
    newValue: options.newValue,
    ipAddress,
  };

  db.auditLogs.unshift(entry);
  return entry;
}
