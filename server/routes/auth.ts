import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { prisma } from '../db/prisma';
import { AuthenticatedRequest, JwtUserPayload, UnauthorizedError, AppError } from '../types';
import { authenticate } from '../middleware/auth';
import { logAuditEvent } from '../services/audit';

const router = Router();

// Rate limiter for authentication endpoints: max 30 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
});

router.use(authLimiter);

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

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email credentials or account inactive.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid password credentials.');
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const userOrgId = user.orgId || 'org-acro';

    // Create JWT Claims
    const payload: JwtUserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
      orgId: userOrgId,
      employeeId: user.employeeId || undefined,
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

    // Store refresh token securely in PostgreSQL
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      },
    });

    // Set Refresh Token as httpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Set accessToken cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    await logAuditEvent(
      { user: payload, orgId: userOrgId, headers: req.headers, socket: req.socket } as any,
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
          orgId: userOrgId,
          employeeId: user.employeeId || undefined,
          avatar: user.avatar || undefined,
          department: user.department || undefined,
          designation: user.designation || undefined,
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

    const tokenEntry = await prisma.refreshToken.findUnique({
      where: { tokenHash: refreshToken },
    });

    if (!tokenEntry || tokenEntry.isRevoked || tokenEntry.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired or revoked. Please log in again.');
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account not found or disabled.');
    }

    // Invalidate old token (Rotation in PostgreSQL)
    await prisma.refreshToken.update({
      where: { id: tokenEntry.id },
      data: { isRevoked: true },
    });

    const userOrgId = user.orgId || 'org-acro';

    // Issue new pair
    const payload: JwtUserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
      orgId: userOrgId,
      employeeId: user.employeeId || undefined,
      name: user.name,
    };

    const newAccessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ userId: user.id }, config.jwt.refreshSecret, { expiresIn: '7d' });

    // Store new refresh token in PostgreSQL
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      },
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
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
router.post('/logout', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: refreshToken },
        data: { isRevoked: true },
      });
    }

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');

    await logAuditEvent(req, {
      action: 'USER_LOGOUT',
      module: 'auth',
      recordName: req.user?.email || 'User',
    });

    res.json({
      success: true,
      data: { message: 'Successfully logged out.' },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/auth/me
 */
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
    });

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
        orgId: user.orgId || 'org-acro',
        employeeId: user.employeeId || undefined,
        avatar: user.avatar || undefined,
        department: user.department || undefined,
        designation: user.designation || undefined,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/reset-password
 */
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email } = ResetPasswordRequestSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user) {
      const resetToken = jwt.sign({ userId: user.id }, config.jwt.secret, { expiresIn: '1h' });

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: resetToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          isUsed: false,
        },
      });

      console.log(`[Sqbe HRMS Auth] Password reset link issued for ${email}: /auth/reset?token=${resetToken}`);
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
