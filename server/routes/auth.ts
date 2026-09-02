import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config';
import { db } from '../db/store';
import { AuthenticatedRequest, JwtUserPayload, UnauthorizedError, AppError } from '../types';
import { authenticate } from '../middleware/auth';
import { logAuditEvent } from '../services/audit';

const router = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ResetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

/**
 * POST /api/v1/auth/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email credentials or account inactive.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid password credentials.');
    }

    // Create JWT Claims
    const payload: JwtUserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
      employeeId: user.employeeId,
      name: user.name,
    };

    // Access Token (15m)
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: '15m',
    });

    // Refresh Token (7d)
    const refreshToken = jwt.sign({ userId: user.id }, config.jwt.refreshSecret, {
      expiresIn: '7d',
    });

    // Store refresh token in store
    db.refreshTokens.set(refreshToken, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
    });

    // Set Refresh Token as httpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Also set accessToken cookie for convenience
    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    logAuditEvent(
      { user: payload, orgId: user.orgId, headers: req.headers, socket: req.socket } as any,
      {
        action: 'USER_LOGIN',
        module: 'auth',
        recordName: user.email,
      }
    );

    res.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId,
          employeeId: user.employeeId,
          avatar: user.avatar,
          department: user.department,
          designation: user.designation,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError('Missing refresh token');
    }

    const tokenEntry = db.refreshTokens.get(refreshToken);
    if (!tokenEntry || tokenEntry.isRevoked || tokenEntry.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired or revoked. Please log in again.');
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };
    const user = db.users.find((u) => u.id === decoded.userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account not found or disabled.');
    }

    // Invalidate old token (Rotation)
    tokenEntry.isRevoked = true;

    // Issue new pair
    const payload: JwtUserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
      employeeId: user.employeeId,
      name: user.name,
    };

    const newAccessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ userId: user.id }, config.jwt.refreshSecret, { expiresIn: '7d' });

    db.refreshTokens.set(newRefreshToken, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/logout
 */
router.post('/logout', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken && db.refreshTokens.has(refreshToken)) {
    const entry = db.refreshTokens.get(refreshToken);
    if (entry) entry.isRevoked = true;
  }

  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');

  logAuditEvent(req, {
    action: 'USER_LOGOUT',
    module: 'auth',
    recordName: req.user?.email || 'User',
  });

  res.json({
    success: true,
    data: { message: 'Successfully logged out.' },
  });
});

/**
 * GET /api/v1/auth/me
 */
router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.user?.userId);
  if (!user) {
    throw new UnauthorizedError('User session not found.');
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId,
      employeeId: user.employeeId,
      avatar: user.avatar,
      department: user.department,
      designation: user.designation,
    },
  });
});

/**
 * POST /api/v1/auth/reset-password
 */
router.post('/reset-password', (req, res, next) => {
  try {
    const { email } = ResetPasswordRequestSchema.parse(req.body);
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      const resetToken = jwt.sign({ userId: user.id }, config.jwt.secret, { expiresIn: '1h' });
      db.passwordResetTokens.set(resetToken, {
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        isUsed: false,
      });

      // Email interface stub
      console.log(`[Sqbe HRMS Auth] Password reset link sent to ${email}: /auth/reset?token=${resetToken}`);
    }

    res.json({
      success: true,
      data: {
        message: 'If the email is registered, a secure single-use password reset link has been dispatched.',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
