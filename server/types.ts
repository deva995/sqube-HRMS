import { Request } from 'express';
import { Role, ModuleId } from '../src/types';

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: Role;
  orgId: string;
  employeeId?: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
  orgId?: string;
  rawToken?: string;
}

export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ModuleDisabledError extends AppError {
  constructor(moduleId: string) {
    super(`Module '${moduleId}' is not enabled for your organization`, 403, 'MODULE_DISABLED');
  }
}

export class TenantIsolationError extends AppError {
  constructor(message: string = 'Cross-tenant data access violation') {
    super(message, 403, 'CROSS_TENANT_VIOLATION');
  }
}
