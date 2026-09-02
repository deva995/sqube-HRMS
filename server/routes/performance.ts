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
router.get('/goals', (req: AuthenticatedRequest, res: Response) => {
  const repo = getRepository(req.user?.orgId, req.user?.role);
  const goals = repo.getGoals();
  res.json({ success: true, data: goals, meta: { total: goals.length } });
});

/**
 * POST /api/v1/performance/goals
 */
router.post('/goals', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const parsed = CreateGoalSchema.parse(req.body);
    const repo = getRepository(req.user?.orgId, req.user?.role);

    const goal = repo.createGoal({
      ...parsed,
      currentProgress: 0,
      status: 'On Track',
    });

    logAuditEvent(req, {
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
router.patch('/goals/:id/progress', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { progress } = z.object({ progress: z.number().min(0).max(100) }).parse(req.body);
    const repo = getRepository(req.user?.orgId, req.user?.role);

    const goal = repo.updateGoalProgress(req.params.id, progress);

    logAuditEvent(req, {
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
router.get('/reviews', (req: AuthenticatedRequest, res: Response) => {
  const repo = getRepository(req.user?.orgId, req.user?.role);
  const reviews = repo.getReviews();
  res.json({ success: true, data: reviews, meta: { total: reviews.length } });
});

export default router;
