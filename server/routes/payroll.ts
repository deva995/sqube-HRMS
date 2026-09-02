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
router.get('/structures', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const structures = await repo.getSalaryStructures();
    res.json({ success: true, data: structures, meta: { total: structures.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/payroll/runs
 */
router.get('/runs', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const runs = await repo.getPayrollRuns();
    res.json({ success: true, data: runs, meta: { total: runs.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/payroll/calculate
 * Executes authoritative server-side payroll calculation and saves run
 */
router.post(
  '/calculate',
  requireRole(['Admin', 'Payroll Manager', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { monthYear, targetEmployeeIds } = CalculatePayrollSchema.parse(req.body);
      const repo = getRepository(req.user?.orgId, req.user?.role);

      const result = await calculateMonthlyPayroll(repo, monthYear, targetEmployeeIds);
      await repo.savePayrollRun(result.payrollRun, result.payslips);

      await logAuditEvent(req, {
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
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const repo = getRepository(req.user?.orgId, req.user?.role);
      const updated = await repo.updatePayrollRunStatus(
        req.params.id,
        'Approved',
        req.user?.name || 'Admin',
        undefined,
        5
      );

      await logAuditEvent(req, {
        action: 'APPROVE_PAYROLL_RUN',
        module: 'payroll',
        recordName: `Payroll Run ${updated.monthYear}`,
      });

      res.json({ success: true, data: updated });
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
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const repo = getRepository(req.user?.orgId, req.user?.role);
      const updated = await repo.updatePayrollRunStatus(
        req.params.id,
        'Disbursed',
        undefined,
        new Date().toISOString().split('T')[0],
        6
      );

      await logAuditEvent(req, {
        action: 'DISBURSE_PAYROLL_SALARIES',
        module: 'payroll',
        recordName: `Disbursed ${updated.totalEmployees} salaries for ${updated.monthYear}`,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/payroll/payslips
 */
router.get('/payslips', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const payrollRunId = req.query.payrollRunId as string | undefined;
    const payslips = await repo.getPayslips(payrollRunId);

    res.json({
      success: true,
      data: payslips,
      meta: { total: payslips.length },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
