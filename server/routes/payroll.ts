import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, NotFoundError } from '../types';
import { authenticate, requireRole } from '../middleware/auth';
import { requireModule } from '../middleware/moduleCheck';
import { getRepository } from '../db/repository';
import { calculateMonthlyPayroll } from '../services/payroll';
import { logAuditEvent } from '../services/audit';

const router = Router();

router.use(authenticate);
router.use(requireModule('payroll'));

const CalculatePayrollSchema = z.object({
  monthYear: z.string().min(4), // e.g. "2026-08" or "August 2026"
  targetEmployeeIds: z.array(z.string()).optional(),
});

/**
 * GET /api/v1/payroll/structures
 */
router.get('/structures', (req: AuthenticatedRequest, res: Response) => {
  const repo = getRepository(req.user?.orgId, req.user?.role);
  const structures = repo.getSalaryStructures();
  res.json({ success: true, data: structures, meta: { total: structures.length } });
});

/**
 * GET /api/v1/payroll/runs
 */
router.get('/runs', (req: AuthenticatedRequest, res: Response) => {
  const repo = getRepository(req.user?.orgId, req.user?.role);
  const runs = repo.getPayrollRuns();
  res.json({ success: true, data: runs, meta: { total: runs.length } });
});

/**
 * POST /api/v1/payroll/calculate
 * Executes authoritative server-side payroll calculation and saves run
 */
router.post(
  '/calculate',
  requireRole(['Admin', 'Payroll Manager', 'Super Admin']),
  (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { monthYear, targetEmployeeIds } = CalculatePayrollSchema.parse(req.body);
      const repo = getRepository(req.user?.orgId, req.user?.role);

      const result = calculateMonthlyPayroll(repo, monthYear, targetEmployeeIds);
      repo.savePayrollRun(result.payrollRun, result.payslips);

      logAuditEvent(req, {
        action: 'EXECUTE_PAYROLL_CALCULATION',
        module: 'payroll',
        recordName: `Monthly Run ${monthYear} (Gross: ₹${result.summary.totalGrossPay.toLocaleString()}, Net: ₹${result.summary.totalNetPay.toLocaleString()})`,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/payroll/runs/:id/approve
 */
router.post(
  '/runs/:id/approve',
  requireRole(['Admin', 'Payroll Manager', 'Super Admin']),
  (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const repo = getRepository(req.user?.orgId, req.user?.role);
      const runs = repo.getPayrollRuns();
      const run = runs.find((r) => r.id === req.params.id);

      if (!run) throw new NotFoundError('Payroll Run');

      run.status = 'Approved';
      run.approvedBy = req.user?.name || 'Admin';
      run.currentStep = 5;

      logAuditEvent(req, {
        action: 'APPROVE_PAYROLL_RUN',
        module: 'payroll',
        recordName: `Payroll Run ${run.monthYear}`,
      });

      res.json({ success: true, data: run });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/payroll/runs/:id/disburse
 */
router.post(
  '/runs/:id/disburse',
  requireRole(['Admin', 'Payroll Manager', 'Super Admin']),
  (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const repo = getRepository(req.user?.orgId, req.user?.role);
      const runs = repo.getPayrollRuns();
      const run = runs.find((r) => r.id === req.params.id);

      if (!run) throw new NotFoundError('Payroll Run');

      run.status = 'Disbursed';
      run.processedDate = new Date().toISOString().split('T')[0];
      run.currentStep = 6;

      logAuditEvent(req, {
        action: 'DISBURSE_PAYROLL_SALARIES',
        module: 'payroll',
        recordName: `Disbursed ${run.totalEmployees} salaries for ${run.monthYear}`,
      });

      res.json({ success: true, data: run });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/payroll/payslips
 */
router.get('/payslips', (req: AuthenticatedRequest, res: Response) => {
  const repo = getRepository(req.user?.orgId, req.user?.role);
  const payrollRunId = req.query.payrollRunId as string | undefined;
  const payslips = repo.getPayslips(payrollRunId);

  res.json({
    success: true,
    data: payslips,
    meta: { total: payslips.length },
  });
});

export default router;
