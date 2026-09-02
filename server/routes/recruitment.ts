import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, NotFoundError } from '../types';
import { authenticate, requireRole } from '../middleware/auth';
import { requireModule } from '../middleware/moduleCheck';
import { getRepository } from '../db/repository';
import { logAuditEvent } from '../services/audit';

const router = Router();

router.use(authenticate);
router.use(requireModule('recruitment'));

/**
 * GET /api/v1/recruitment/jobs
 */
router.get('/jobs', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const jobs = await repo.getJobs();
    res.json({ success: true, data: jobs, meta: { total: jobs.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/recruitment/candidates
 */
router.get('/candidates', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const candidates = await repo.getCandidates();
    res.json({ success: true, data: candidates, meta: { total: candidates.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/recruitment/candidates/:id/stage
 */
router.patch(
  '/candidates/:id/stage',
  requireRole(['Admin', 'HR Manager', 'Recruiter', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { stage } = z
        .object({
          stage: z.enum([
            'Applied',
            'Screening',
            'Shortlisted',
            'Interview',
            'Technical',
            'Technical Round',
            'HR Round',
            'Offer',
            'Offer Extended',
            'Hired',
            'Rejected',
          ]),
        })
        .parse(req.body);

      const repo = getRepository(req.user?.orgId, req.user?.role);
      const updated = await repo.updateCandidateStage(req.params.id, stage as any);

      await logAuditEvent(req, {
        action: 'UPDATE_CANDIDATE_STAGE',
        module: 'recruitment',
        recordName: `${updated.name} -> ${stage}`,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/recruitment/interviews
 */
router.get('/interviews', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const interviews = await repo.getInterviews();
    res.json({ success: true, data: interviews, meta: { total: interviews.length } });
  } catch (error) {
    next(error);
  }
});

export default router;
