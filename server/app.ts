import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { AppError } from './types';

// Import Route Handlers
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import hrRoutes from './routes/hr';
import attendanceRoutes from './routes/attendance';
import leavesRoutes from './routes/leaves';
import payrollRoutes from './routes/payroll';
import performanceRoutes from './routes/performance';
import recruitmentRoutes from './routes/recruitment';
import filesRoutes from './routes/files';
import notificationsRoutes from './routes/notifications';
import testTenantRoutes from './routes/test-tenant';

export function createExpressApp() {
  const app = express();

  // 1. Security & CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // In local/container preview, allow the origin
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    })
  );

  // 2. Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // 3. Health check & System Info
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'Sqbe HRMS Backend v1',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      version: '1.0.0',
    });
  });

  // 4. API v1 Versioned Routes
  const apiV1 = express.Router();

  apiV1.use('/auth', authRoutes);
  apiV1.use('/admin', adminRoutes);
  apiV1.use('/hr', hrRoutes);
  apiV1.use('/attendance', attendanceRoutes);
  apiV1.use('/leaves', leavesRoutes);
  apiV1.use('/payroll', payrollRoutes);
  apiV1.use('/performance', performanceRoutes);
  apiV1.use('/recruitment', recruitmentRoutes);
  apiV1.use('/files', filesRoutes);
  apiV1.use('/notifications', notificationsRoutes);
  apiV1.use('/test-tenant-isolation', testTenantRoutes);

  app.use('/api/v1', apiV1);

  // 5. Global Standardized Error Handling Middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
    const message = err.message || 'An unexpected server error occurred';

    // Log server errors for observability
    if (statusCode >= 500) {
      console.error('[Sqbe HRMS Server Error]', err);
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message,
        details: err.details || undefined,
      },
    });
  });

  return app;
}
