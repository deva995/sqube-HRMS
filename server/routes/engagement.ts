import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, NotFoundError } from '../types';
import { authenticate, requireRole } from '../middleware/auth';
import { requireModule } from '../middleware/moduleCheck';
import { getRepository } from '../db/repository';
import { logAuditEvent } from '../services/audit';

const router = Router();

router.use(authenticate);
router.use(requireModule('engagement'));

const CreateAnnouncementSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  category: z.string().default('General'),
  pinned: z.boolean().default(false),
});

const CreateRecognitionSchema = z.object({
  recipientId: z.string().min(1),
  recipientName: z.string().min(1),
  recipientAvatar: z.string().optional(),
  badge: z.string().min(1),
  message: z.string().min(3),
});

/**
 * GET /api/v1/engagement/announcements
 */
router.get('/announcements', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const list = await repo.getAnnouncements();
    res.json({ success: true, data: list, meta: { total: list.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/engagement/announcements
 */
router.post(
  '/announcements',
  requireRole(['Admin', 'HR Manager', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const parsed = CreateAnnouncementSchema.parse(req.body);
      const repo = getRepository(req.user?.orgId, req.user?.role);

      const created = await repo.createAnnouncement({
        title: parsed.title,
        content: parsed.content,
        category: parsed.category,
        authorName: req.user?.name || 'HR Team',
        authorAvatar: (req.user as any)?.avatar,
        pinned: parsed.pinned,
      });

      await logAuditEvent(req, {
        action: 'PUBLISH_ANNOUNCEMENT',
        module: 'engagement',
        recordName: parsed.title,
      });

      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/engagement/announcements/:id/like
 */
router.post('/announcements/:id/like', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const result = await repo.toggleAnnouncementLike(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/engagement/recognitions
 */
router.get('/recognitions', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const list = await repo.getRecognitions();
    res.json({ success: true, data: list, meta: { total: list.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/engagement/recognitions
 */
router.post('/recognitions', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const parsed = CreateRecognitionSchema.parse(req.body);
    const repo = getRepository(req.user?.orgId, req.user?.role);

    const created = await repo.createRecognition({
      senderId: req.user?.employeeId || req.user?.userId || 'usr-1',
      senderName: req.user?.name || 'Colleague',
      senderAvatar: (req.user as any)?.avatar,
      recipientId: parsed.recipientId,
      recipientName: parsed.recipientName,
      recipientAvatar: parsed.recipientAvatar,
      badge: parsed.badge,
      message: parsed.message,
    });

    await logAuditEvent(req, {
      action: 'SEND_KUDOS_RECOGNITION',
      module: 'engagement',
      recordName: `${req.user?.name} -> ${parsed.recipientName} (${parsed.badge})`,
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
});

export default router;
