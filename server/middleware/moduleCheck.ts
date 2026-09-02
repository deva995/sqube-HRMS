import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ModuleDisabledError, UnauthorizedError } from '../types';
import { getRepository } from '../db/repository';
import { ModuleId } from '../../src/types';

/**
 * Middleware: Verify that the specified SaaS module is enabled for the organization
 */
export function requireModule(moduleId: ModuleId) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    // Super Admin has unrestricted access to all modules
    if (req.user.role === 'Super Admin' || req.user.orgId === 'all') {
      return next();
    }

    const repo = getRepository(req.user.orgId, req.user.role);
    const isEnabled = repo.isModuleEnabled(moduleId);

    if (!isEnabled) {
      return next(new ModuleDisabledError(moduleId));
    }

    next();
  };
}
