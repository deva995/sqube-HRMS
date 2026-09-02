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
router.get('/jobs', (req: AuthenticatedRequest, res: Response) => {
  const repo = getRepository(req.user?.orgId, req.user?.role);
  const jobs = repo.getJobs();
  res.json({ success: true, data: jobs, meta: { total: jobs.length } });
});

/**
 * GET /api/v1/recruitment/candidates
 */
router.get('/candidates', (req: AuthenticatedRequest, res: Response) => {
  const repo = getRepository(req.user?.orgId, req.user?.role);
  const candidates = repo.getCandidates();
  res.json({ success: true, data: candidates, meta: { total: candidates.length } });
});

/**
 * PATCH /api/v1/recruitment/candidates/:id/stage
 */
router.patch(
  '/candidates/:id/stage',
  requireRole(['Admin', 'HR Manager', 'Recruiter', 'Super Admin']),
  (req: AuthenticatedRequest, res: Response, next) => {
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
      const updated = repo.updateCandidateStage(req.params.id, stage as any);

      logAuditEvent(req, {
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
router.get('/interviews', (req: AuthenticatedRequest, res: Response) => {
  const repo = getRepository(req.user?.orgId, req.user?.role);
  const interviews = repo.getInterviews();
  res.json({ success: true, data: interviews, meta: { total: interviews.length } });
});

export default router;
