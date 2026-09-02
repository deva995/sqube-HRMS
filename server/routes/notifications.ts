import { Router, Response } from 'express';
import { AuthenticatedRequest, NotFoundError } from '../types';
import { authenticate } from '../middleware/auth';
import { getRepository } from '../db/repository';

const router = Router();

router.use(authenticate);

/**
 * GET /api/v1/notifications
 */
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const repo = getRepository(req.user?.orgId, req.user?.role);
  const notifications = repo.getNotifications();
  res.json({ success: true, data: notifications, meta: { total: notifications.length } });
});

/**
 * PATCH /api/v1/notifications/:id/read
 */
router.patch('/:id/read', (req: AuthenticatedRequest, res: Response) => {
  const repo = getRepository(req.user?.orgId, req.user?.role);
  const notifications = repo.getNotifications();
  const notif = notifications.find((n) => n.id === req.params.id);

  if (notif) {
    notif.isRead = true;
  }

  res.json({ success: true, data: notif });
});

export default router;
