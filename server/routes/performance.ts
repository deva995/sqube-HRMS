import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, NotFoundError } from '../types';
import { authenticate, requireRole } from '../middleware/auth';
import { requireModule } from '../middleware/moduleCheck';
import { getRepository } from '../db/repository';
import { logAuditEvent } from '../services/audit';

const router = Router();

router.use(authenticate);
router.use(requireModule('performance'));

const CreateGoalSchema = z.object({
  employeeId: z.string().optional(),
  employeeName: z.string(),
  department: z.string().optional(),
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.enum(['Individual', 'Team', 'Department', 'OKR']).default('OKR'),
  targetMetric: z.string().min(2),
  weightage: z.number().default(25),
  dueDate: z.string(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
});

/**
 * GET /api/v1/performance/goals
 */
router.get('/goals', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const goals = await repo.getGoals();
    res.json({ success: true, data: goals, meta: { total: goals.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/performance/goals
 */
router.post('/goals', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const parsed = CreateGoalSchema.parse(req.body);
    const repo = getRepository(req.user?.orgId, req.user?.role);

    const goal = await repo.createGoal({
      ...parsed,
      currentProgress: 0,
      status: 'On Track',
    });

    await logAuditEvent(req, {
      action: 'CREATE_PERFORMANCE_GOAL',
      module: 'performance',
      recordName: `${goal.title} for ${goal.employeeName}`,
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/performance/goals/:id/progress
 */
router.patch('/goals/:id/progress', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { progress } = z.object({ progress: z.number().min(0).max(100) }).parse(req.body);
    const repo = getRepository(req.user?.orgId, req.user?.role);

    const goal = await repo.updateGoalProgress(req.params.id, progress);

    await logAuditEvent(req, {
      action: 'UPDATE_GOAL_PROGRESS',
      module: 'performance',
      recordName: `${goal.title} (${progress}%)`,
    });

    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/performance/reviews
 */
router.get('/reviews', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const reviews = await repo.getReviews();
    res.json({ success: true, data: reviews, meta: { total: reviews.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/performance/reviews
 */
router.post(
  '/reviews',
  requireRole(['Admin', 'HR Manager', 'Manager', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const schema = z.object({
        employeeId: z.string().optional(),
        employeeName: z.string().min(1),
        reviewerName: z.string().optional(),
        cycle: z.string().optional(),
        rating: z.number().optional(),
        feedback: z.string().optional(),
        department: z.string().optional(),
        currentStage: z.number().optional(),
        selfRating: z.number().optional(),
        selfComments: z.string().optional(),
        managerRating: z.number().optional(),
        managerComments: z.string().optional(),
      });
      const parsed = schema.parse(req.body);
      const repo = getRepository(req.user?.orgId, req.user?.role);
      const created = await repo.createReview(parsed);

      await logAuditEvent(req, {
        action: 'SUBMIT_PERFORMANCE_REVIEW',
        module: 'performance',
        recordName: `Review for ${created.employeeName} (${created.cycle})`,
      });

      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/v1/performance/reviews/:id
 */
router.patch(
  '/reviews/:id',
  requireRole(['Admin', 'HR Manager', 'Manager', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const schema = z.object({
        currentStage: z.union([z.string(), z.number()]).optional(),
        rating: z.number().optional(),
        feedback: z.string().optional(),
        managerRating: z.number().optional(),
        managerComments: z.string().optional(),
        isCompleted: z.boolean().optional(),
        finalScore: z.number().optional(),
        finalRecommendation: z.string().optional(),
      });
      const parsed = schema.parse(req.body);
      const stageStr = typeof parsed.currentStage === 'number'
        ? (['Self', 'Manager', 'Peer', 'HR', 'Final'][parsed.currentStage - 1] || 'Self')
        : parsed.currentStage;

      const repo = getRepository(req.user?.orgId, req.user?.role);
      const updated = await repo.updateReview(req.params.id, {
        ...parsed,
        currentStage: stageStr,
      });

      await logAuditEvent(req, {
        action: 'UPDATE_PERFORMANCE_REVIEW',
        module: 'performance',
        recordName: `Review ${req.params.id} for ${updated.employeeName}`,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
