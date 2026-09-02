import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, AppError } from '../types';
import { authenticate, requireRole } from '../middleware/auth';
import { getRepository } from '../db/repository';
import { logAuditEvent } from '../services/audit';
import { ModuleId } from '../../src/types';

const router = Router();

const UpdateModulesSchema = z.object({
  enabledModuleIds: z.array(z.string()),
});

const CreateOrganizationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  industry: z.string().optional(),
  contactEmail: z.string().email(),
  billingPlan: z.enum(['Enterprise', 'Professional', 'Growth']).default('Enterprise'),
  logoUrl: z.string().optional(),
  enabledModules: z.array(z.string()).optional(),
});

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  role: z.enum([
    'Super Admin',
    'Admin',
    'Org Admin',
    'Manager',
    'Team Lead',
    'Executive',
    'Employee',
    'HR Manager',
    'Payroll Manager',
    'Recruiter',
  ]),
  orgId: z.string().optional(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  avatar: z.string().optional(),
});

/**
 * GET /api/v1/admin/organizations
 */
router.get('/organizations', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const organizations = await repo.getOrganizations();

    res.json({
      success: true,
      data: organizations,
      meta: { total: organizations.length },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/organizations
 * Super Admin Tenant Provisioning
 */
router.post(
  '/organizations',
  authenticate,
  requireRole(['Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const parsed = CreateOrganizationSchema.parse(req.body);
      const repo = getRepository('all', 'Super Admin');

      const org = await repo.createOrganization({
        ...parsed,
        enabledModules: parsed.enabledModules as ModuleId[],
      });

      await logAuditEvent(req, {
        action: 'CREATE_ORGANIZATION',
        module: 'admin',
        recordName: `${org.name} (${org.id})`,
      });

      res.status(201).json({
        success: true,
        data: org,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/admin/users
 * Super Admin or Org Admin User Creation
 */
router.post(
  '/users',
  authenticate,
  requireRole(['Super Admin', 'Admin', 'Org Admin', 'HR Manager']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const parsed = CreateUserSchema.parse(req.body);
      const targetOrgId = req.user?.role === 'Super Admin' ? (parsed.orgId || req.user.orgId) : req.user?.orgId;
      const repo = getRepository(targetOrgId, req.user?.role);

      const user = await repo.createUser({
        ...parsed,
        orgId: targetOrgId,
        role: parsed.role as any,
      });

      await logAuditEvent(req, {
        action: 'CREATE_USER',
        module: 'admin',
        recordName: `${user.name} (${user.email}) [${user.role}] in ${user.orgId}`,
      });

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/v1/admin/organizations/:orgId/modules
 * Super Admin Multi-Tenant Module Assignment Matrix
 */
router.patch(
  '/organizations/:orgId/modules',
  authenticate,
  requireRole(['Super Admin']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { orgId } = req.params;
      const { enabledModuleIds } = UpdateModulesSchema.parse(req.body);

      const repo = getRepository(orgId, 'Super Admin');
      const updatedOrg = await repo.updateOrganizationModules(orgId, enabledModuleIds as ModuleId[]);

      await logAuditEvent(req, {
        action: 'UPDATE_ORGANIZATION_MODULES',
        module: 'admin',
        recordName: `Modules for ${updatedOrg.name}`,
        newValue: JSON.stringify(enabledModuleIds),
      });

      res.json({
        success: true,
        data: updatedOrg,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/admin/audit-logs
 */
router.get('/audit-logs', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const repo = getRepository(req.user?.orgId, req.user?.role);
    const logs = await repo.getAuditLogs();

    res.json({
      success: true,
      data: logs,
      meta: { total: logs.length },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
