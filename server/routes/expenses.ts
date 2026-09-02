import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, NotFoundError } from '../types';
import { authenticate, requireRole } from '../middleware/auth';
import { requireModule } from '../middleware/moduleCheck';
import { getRepository } from '../db/repository';
import { logAuditEvent } from '../services/audit';

const router = Router();

router.use(authenticate);
router.use(requireModule('expense'));

const CreateExpenseSchema = z.object({
  employeeId: z.string().optional(),
  employeeName: z.string().optional(),
  category: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  date: z.string(),
  merchant: z.string().min(1),
  description: z.string().min(2),
  receiptUrl: z.string().optional(),
  receiptFileKey: z.string().optional(),
});

/**
 * GET /api/v1/expenses
 */
router.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const expenses = await repo.getExpenses();
    res.json({ success: true, data: expenses, meta: { total: expenses.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/expenses
 */
router.post('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const parsed = CreateExpenseSchema.parse(req.body);
    const repo = getRepository(req.user?.orgId, req.user?.role);

    const employeeId = parsed.employeeId || req.user?.employeeId || 'emp-acro-104';
    const employee = await repo.getEmployeeById(employeeId);
    const employeeName = parsed.employeeName || (employee ? `${employee.firstName} ${employee.lastName}`.trim() : req.user?.name || 'Employee');

    const created = await repo.createExpense({
      employeeId,
      employeeName,
      category: parsed.category,
      amount: parsed.amount,
      currency: parsed.currency,
      date: parsed.date,
      merchant: parsed.merchant,
      description: parsed.description,
      receiptUrl: parsed.receiptUrl,
      receiptFileKey: parsed.receiptFileKey,
    });

    await logAuditEvent(req, {
      action: 'SUBMIT_EXPENSE_CLAIM',
      module: 'expense',
      recordName: `${employeeName}: ₹${parsed.amount.toLocaleString()} for ${parsed.merchant}`,
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/expenses/:id/status
 */
router.patch(
  '/:id/status',
  requireRole(['Admin', 'Manager', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { status, rejectionReason } = z
        .object({
          status: z.enum(['Approved', 'Rejected', 'Reimbursed']),
          rejectionReason: z.string().optional(),
        })
        .parse(req.body);

      const repo = getRepository(req.user?.orgId, req.user?.role);
      const updated = await repo.updateExpenseStatus(
        req.params.id,
        status,
        req.user?.name || 'Manager',
        rejectionReason
      );

      await logAuditEvent(req, {
        action: `EXPENSE_${status.toUpperCase()}`,
        module: 'expense',
        recordName: `Expense ID ${req.params.id} (${status})`,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/expenses/:id
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    await repo.deleteExpense(req.params.id);

    await logAuditEvent(req, {
      action: 'DELETE_EXPENSE',
      module: 'expense',
      recordName: `Expense ID ${req.params.id}`,
    });

    res.json({ success: true, data: { message: 'Expense claim deleted successfully.' } });
  } catch (error) {
    next(error);
  }
});

export default router;
