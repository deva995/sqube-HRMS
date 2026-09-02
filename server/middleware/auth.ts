import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticatedRequest, JwtUserPayload, UnauthorizedError, ForbiddenError } from '../types';
import { Role } from '../../src/types';

/**
 * Middleware: Authenticate Request via Bearer Token or Cookie
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required. Missing Bearer token or session cookie.');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtUserPayload;
    req.user = decoded;
    req.orgId = decoded.orgId;
    req.rawToken = token;

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Access token has expired. Please refresh your session.'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid access token.'));
    } else {
      next(error);
    }
  }
}

/**
 * Optional Authentication: Attaches user if present, proceeds if absent
 */
export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtUserPayload;
      req.user = decoded;
      req.orgId = decoded.orgId;
    } catch {
      // ignore invalid token for optional routes
    }
  }
  next();
}

/**
 * Middleware: Role-Based Access Control (RBAC)
 */
export function requireRole(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    // Super Admin has universal operational bypass
    if (req.user.role === 'Super Admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access forbidden for role '${req.user.role}'. Required roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
}
