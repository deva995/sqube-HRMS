import { AuthenticatedRequest } from '../types';
import { prisma } from '../db/prisma';
import { AuditLogEntry, Role } from '../../src/types';

export interface AuditLogOptions {
  action: string;
  module: string;
  recordName: string;
  previousValue?: string;
  newValue?: string;
}

/**
 * Log an immutable audit event to the append-only audit trail in PostgreSQL
 */
export async function logAuditEvent(
  req: AuthenticatedRequest,
  options: AuditLogOptions
): Promise<AuditLogEntry> {
  const orgId = req.user?.orgId || req.orgId || 'org-acro';
  const userName = req.user?.name || 'System Actor';
  const userRole = req.user?.role || 'Admin';
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  const entry = await prisma.auditLogEntry.create({
    data: {
      id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      orgId,
      timestamp: new Date(),
      userId: req.user?.userId || undefined,
      userName,
      userRole,
      action: options.action,
      module: options.module,
      recordName: options.recordName,
      previousValue: options.previousValue,
      newValue: options.newValue,
      ipAddress,
    },
  });

  return {
    id: entry.id,
    orgId: entry.orgId,
    timestamp: entry.timestamp.toISOString(),
    userName: entry.userName,
    userRole: entry.userRole as Role,
    action: entry.action,
    module: entry.module,
    recordName: entry.recordName,
    previousValue: entry.previousValue || undefined,
    newValue: entry.newValue || undefined,
    ipAddress: entry.ipAddress,
  };
}
