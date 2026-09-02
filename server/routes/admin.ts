import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, AppError } from '../types';
import { authenticate, requireRole } from '../middleware/auth';
import { getRepository } from '../db/repository';
import { logAuditEvent } from '../services/audit';
import { ModuleId } from '../../src/types';

const router = Router();

const UpdateModulesSchema = z.object({
  enabledModuleIds: z.array(z.string()),
});

/**
 * GET /api/v1/admin/organizations
 */
router.get('/organizations', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const repo = getRepository(req.user?.orgId, req.user?.role);
  const organizations = repo.getOrganizations();

  res.json({
    success: true,
    data: organizations,
    meta: { total: organizations.length },
  });
});

/**
 * PATCH /api/v1/admin/organizations/:orgId/modules
 * Super Admin Multi-Tenant Module Assignment Matrix
 */
router.patch(
  '/organizations/:orgId/modules',
  authenticate,
  requireRole(['Super Admin']),
  (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { orgId } = req.params;
      const { enabledModuleIds } = UpdateModulesSchema.parse(req.body);

      const repo = getRepository(orgId, 'Super Admin');
      const updatedOrg = repo.updateOrganizationModules(orgId, enabledModuleIds as ModuleId[]);

      logAuditEvent(req, {
        action: 'UPDATE_ORGANIZATION_MODULES',
        module: 'admin',
        recordName: `Modules for ${updatedOrg.name}`,
        newValue: JSON.stringify(enabledModuleIds),
      });

      res.json({
        success: true,
        data: updatedOrg,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/admin/audit-logs
 */
router.get('/audit-logs', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const repo = getRepository(req.user?.orgId, req.user?.role);
  const logs = repo.getAuditLogs();

  res.json({
    success: true,
    data: logs,
    meta: { total: logs.length },
  });
});

export default router;
