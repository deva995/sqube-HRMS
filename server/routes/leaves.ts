import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, AppError } from '../types';
import { authenticate, requireRole } from '../middleware/auth';
import { getRepository } from '../db/repository';
import { logAuditEvent } from '../services/audit';

const router = Router();

router.use(authenticate);

const CreateLeaveSchema = z.object({
  employeeId: z.string().optional(),
  employeeName: z.string().optional(),
  department: z.string().optional(),
  leaveType: z.enum([
    'Earned Leave (EL)',
    'Casual Leave (CL)',
    'Sick Leave (SL)',
    'Maternity / Paternity',
    'Comp Off',
  ]),
  startDate: z.string(),
  endDate: z.string(),
  days: z.number().default(1),
  reason: z.string().min(3),
});

/**
 * GET /api/v1/leaves
 */
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const repo = getRepository(req.user?.orgId, req.user?.role);
  const leaves = repo.getLeaveRequests();

  res.json({
    success: true,
    data: leaves,
    meta: { total: leaves.length },
  });
});

/**
 * POST /api/v1/leaves
 */
router.post('/', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const parsed = CreateLeaveSchema.parse(req.body);
    const repo = getRepository(req.user?.orgId, req.user?.role);

    const employeeId = parsed.employeeId || req.user?.employeeId || 'emp-acro-104';
    const employee = repo.getEmployeeById(employeeId);

    const empName = parsed.employeeName || (employee ? `${employee.firstName} ${employee.lastName}`.trim() : req.user?.name || 'Employee');
    const dept = parsed.department || (employee ? employee.department : 'Engineering');

    const created = repo.createLeaveRequest({
      employeeId,
      employeeName: empName,
      department: dept,
      leaveType: parsed.leaveType as any,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      days: parsed.days,
      reason: parsed.reason,
      appliedDate: new Date().toISOString().split('T')[0],
    });

    logAuditEvent(req, {
      action: 'SUBMIT_LEAVE_REQUEST',
      module: 'leave',
      recordName: `${empName} (${parsed.leaveType}, ${parsed.days} days)`,
    });

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/leaves/:id/status
 */
router.patch(
  '/:id/status',
  requireRole(['Admin', 'HR Manager', 'Manager', 'Team Lead', 'Super Admin']),
  (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { status } = z.object({ status: z.enum(['Approved', 'Rejected']) }).parse(req.body);
      const repo = getRepository(req.user?.orgId, req.user?.role);

      const updated = repo.updateLeaveRequestStatus(req.params.id, status, req.user?.name || 'Manager');

      logAuditEvent(req, {
        action: `LEAVE_${status.toUpperCase()}`,
        module: 'leave',
        recordName: `Leave ID ${req.params.id} for ${updated.employeeName}`,
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
