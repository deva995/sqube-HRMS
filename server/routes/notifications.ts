import { Router, Response } from 'express';
import { AuthenticatedRequest, NotFoundError } from '../types';
import { authenticate } from '../middleware/auth';
import { getRepository } from '../db/repository';

const router = Router();

router.use(authenticate);

/**
 * GET /api/v1/notifications
 */
router.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const notifications = await repo.getNotifications();
    res.json({ success: true, data: notifications, meta: { total: notifications.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/notifications/:id/read
 */
router.patch('/:id/read', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const notif = await repo.markNotificationRead(req.params.id);
    res.json({ success: true, data: notif });
  } catch (error) {
    next(error);
  }
});

export default router;
