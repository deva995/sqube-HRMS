import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, NotFoundError } from '../types';
import { authenticate, requireRole } from '../middleware/auth';
import { requireModule } from '../middleware/moduleCheck';
import { getRepository } from '../db/repository';
import { logAuditEvent } from '../services/audit';

const router = Router();

router.use(authenticate);
router.use(requireModule('marketplace'));

/**
 * GET /api/v1/marketplace/apps
 */
router.get('/apps', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const apps = await repo.getMarketplaceApps();
    res.json({ success: true, data: apps, meta: { total: apps.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/marketplace/apps/:id/toggle-install
 */
router.post(
  '/apps/:id/toggle-install',
  requireRole(['Admin', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { installed } = z.object({ installed: z.boolean() }).parse(req.body);
      const repo = getRepository(req.user?.orgId, req.user?.role);

      const result = await repo.toggleInstallMarketplaceApp(
        req.params.id,
        installed,
        req.user?.name || 'Admin'
      );

      await logAuditEvent(req, {
        action: installed ? 'INSTALL_MARKETPLACE_APP' : 'UNINSTALL_MARKETPLACE_APP',
        module: 'marketplace',
        recordName: `App ID ${req.params.id}`,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
