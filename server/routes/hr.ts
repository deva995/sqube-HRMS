import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, NotFoundError } from '../types';
import { authenticate, requireRole } from '../middleware/auth';
import { requireModule } from '../middleware/moduleCheck';
import { getRepository } from '../db/repository';
import { logAuditEvent } from '../services/audit';

const router = Router();

// Protect all HR routes with authentication and module enablement check
router.use(authenticate);
router.use(requireModule('hr'));

const CreateEmployeeSchema = z.object({
  employeeCode: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  department: z.string().min(1),
  designation: z.string().min(1),
  employmentType: z.string().default('Full-Time'),
  joiningDate: z.string(),
  annualCtc: z.number().default(0),
  avatar: z.string().optional(),
  location: z.string().optional(),
});

/**
 * GET /api/v1/hr/employees
 */
router.get('/employees', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 50;

    let employees = await repo.getEmployees();

    // Filter by department if provided
    if (req.query.department) {
      employees = employees.filter((e) => e.department.toLowerCase() === (req.query.department as string).toLowerCase());
    }
    // Filter by search query
    if (req.query.search) {
      const q = (req.query.search as string).toLowerCase();
      employees = employees.filter(
        (e) =>
          e.firstName.toLowerCase().includes(q) ||
          e.lastName.toLowerCase().includes(q) ||
          e.employeeCode.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      );
    }

    const total = employees.length;
    const paginated = employees.slice((page - 1) * pageSize, page * pageSize);

    res.json({
      success: true,
      data: paginated,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/hr/employees/:id
 */
router.get('/employees/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const employee = await repo.getEmployeeById(req.params.id);

    if (!employee) {
      throw new NotFoundError('Employee');
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/hr/employees
 */
router.post(
  '/employees',
  requireRole(['Admin', 'HR Manager', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const parsed = CreateEmployeeSchema.parse(req.body);
      const repo = getRepository(req.user?.orgId, req.user?.role);

      const newEmp = await repo.createEmployee({
        ...parsed,
        avatar: parsed.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'Active',
        documents: [],
        history: [{ date: new Date().toISOString().split('T')[0], event: 'Onboarded into organization' }],
      });

      await logAuditEvent(req, {
        action: 'CREATE_EMPLOYEE',
        module: 'hr',
        recordName: `${newEmp.firstName} ${newEmp.lastName} (${newEmp.employeeCode})`,
      });

      res.status(201).json({
        success: true,
        data: newEmp,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/v1/hr/employees/:id
 */
router.patch(
  '/employees/:id',
  requireRole(['Admin', 'HR Manager', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const repo = getRepository(req.user?.orgId, req.user?.role);
      const updated = await repo.updateEmployee(req.params.id, req.body);

      await logAuditEvent(req, {
        action: 'UPDATE_EMPLOYEE',
        module: 'hr',
        recordName: `${updated.firstName} ${updated.lastName} (${updated.employeeCode})`,
        newValue: JSON.stringify(req.body),
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

/**
 * DELETE /api/v1/hr/employees/:id
 */
router.delete(
  '/employees/:id',
  requireRole(['Admin', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const repo = getRepository(req.user?.orgId, req.user?.role);
      await repo.deleteEmployee(req.params.id);

      await logAuditEvent(req, {
        action: 'DELETE_EMPLOYEE',
        module: 'hr',
        recordName: `Employee ID: ${req.params.id}`,
      });

      res.json({
        success: true,
        data: { message: 'Employee successfully removed.' },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/hr/departments
 */
router.get('/departments', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const departments = await repo.getDepartments();
    res.json({ success: true, data: departments, meta: { total: departments.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/hr/departments
 */
router.post(
  '/departments',
  requireRole(['Admin', 'HR Manager', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const schema = z.object({
        name: z.string().min(2),
        code: z.string().min(1),
        headEmployeeId: z.string().optional(),
        headName: z.string().optional(),
        budgetInr: z.number().optional(),
      });
      const parsed = schema.parse(req.body);
      const repo = getRepository(req.user?.orgId, req.user?.role);
      const created = await repo.createDepartment(parsed);

      await logAuditEvent(req, {
        action: 'CREATE_DEPARTMENT',
        module: 'hr',
        recordName: `${created.name} (${created.code})`,
      });

      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/hr/designations
 */
router.get('/designations', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const designations = await repo.getDesignations();
    res.json({ success: true, data: designations, meta: { total: designations.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/hr/designations
 */
router.post(
  '/designations',
  requireRole(['Admin', 'HR Manager', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const schema = z.object({
        title: z.string().min(2),
        department: z.string().min(1),
        level: z.number().min(1),
        minExperienceYears: z.number().optional(),
      });
      const parsed = schema.parse(req.body);
      const repo = getRepository(req.user?.orgId, req.user?.role);
      const created = await repo.createDesignation(parsed);

      await logAuditEvent(req, {
        action: 'CREATE_DESIGNATION',
        module: 'hr',
        recordName: `${created.title} - ${created.department}`,
      });

      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/hr/shifts
 */
router.get('/shifts', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const shifts = await repo.getShifts();
    res.json({ success: true, data: shifts, meta: { total: shifts.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/hr/shifts
 */
router.post(
  '/shifts',
  requireRole(['Admin', 'HR Manager', 'Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const schema = z.object({
        name: z.string().min(2),
        startTime: z.string().min(1),
        endTime: z.string().min(1),
        graceMinutes: z.number().optional(),
        breakDurationMinutes: z.number().optional(),
        workingDays: z.array(z.string()).optional(),
      });
      const parsed = schema.parse(req.body);
      const repo = getRepository(req.user?.orgId, req.user?.role);
      const created = await repo.createShift(parsed);

      await logAuditEvent(req, {
        action: 'CREATE_WORK_SHIFT',
        module: 'hr',
        recordName: `${created.name} (${created.startTime} - ${created.endTime})`,
      });

      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
