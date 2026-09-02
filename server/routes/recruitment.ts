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
 * POST /api/v1/recruitment/jobs
 */
router.post(
  '/jobs',
  requireRole(['Admin', 'HR Manager', 'Recruiter', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const schema = z.object({
        title: z.string().min(2),
        department: z.string().min(1),
        location: z.string().min(1),
        employmentType: z.string().optional(),
        experience: z.string().optional(),
        salaryRange: z.string().optional(),
        description: z.string().optional(),
        skillsRequired: z.array(z.string()).optional(),
        openings: z.number().optional(),
      });
      const parsed = schema.parse(req.body);
      const repo = getRepository(req.user?.orgId, req.user?.role);
      const created = await repo.createJob(parsed);

      await logAuditEvent(req, {
        action: 'CREATE_JOB_POSTING',
        module: 'recruitment',
        recordName: `${created.title} (${created.department})`,
      });

      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/recruitment/candidates
 */
router.post(
  '/candidates',
  requireRole(['Admin', 'HR Manager', 'Recruiter', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const schema = z.object({
        jobId: z.string().optional(),
        jobTitle: z.string().min(1),
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(5),
        currentCompany: z.string().optional(),
        experienceYears: z.number().optional(),
        skills: z.array(z.string()).optional(),
        expectedSalary: z.number().optional(),
        noticePeriodDays: z.number().optional(),
        location: z.string().optional(),
        source: z.string().optional(),
      });
      const parsed = schema.parse(req.body);
      const repo = getRepository(req.user?.orgId, req.user?.role);
      const created = await repo.createCandidate(parsed);

      await logAuditEvent(req, {
        action: 'CREATE_CANDIDATE',
        module: 'recruitment',
        recordName: `${created.name} for ${created.jobTitle}`,
      });

      res.status(201).json({ success: true, data: created });
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

/**
 * POST /api/v1/recruitment/interviews
 */
router.post(
  '/interviews',
  requireRole(['Admin', 'HR Manager', 'Recruiter', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const schema = z.object({
        candidateId: z.string().optional(),
        candidateName: z.string().min(1),
        jobTitle: z.string().optional(),
        round: z.string().optional(),
        roundType: z.string().optional(),
        interviewerName: z.string().min(1),
        scheduledAt: z.string().optional(),
        durationMinutes: z.number().optional(),
        meetingLink: z.string().optional(),
      });
      const parsed = schema.parse(req.body);
      const repo = getRepository(req.user?.orgId, req.user?.role);
      const created = await repo.scheduleInterview(parsed);

      await logAuditEvent(req, {
        action: 'SCHEDULE_INTERVIEW',
        module: 'recruitment',
        recordName: `${created.candidateName} with ${created.interviewerName}`,
      });

      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
